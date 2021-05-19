import { put, takeLatest } from 'redux-saga/effects';
import { Alert, Share } from 'react-native';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';
import { Q } from '@nozbe/watermelondb';
import semver from 'semver';

import Navigation from '../lib/Navigation';
import { SERVER } from '../actions/actionsTypes';
import {
	serverFailure, selectServerRequest, selectServerSuccess, selectServerFailure
} from '../actions/server';
import { clearSettings } from '../actions/settings';
import { setShareUser, setUser } from '../actions/login';
import RocketChat from '../lib/rocketchat';
import database from '../lib/database';
import log, { logServerVersion } from '../utils/log';
import I18n from '../i18n';
import { BASIC_AUTH_KEY, setBasicAuth } from '../utils/fetch';
import { appStart, ROOT_INSIDE, ROOT_OUTSIDE, ROOT_SET_USERNAME } from '../actions/app';
import UserPreferences from '../lib/userPreferences';
import { encryptionStop } from '../actions/encryption';
import SSLPinning from '../utils/sslPinning';

import { inquiryReset } from '../ee/omnichannel/actions/inquiry';
import ShareSlate from '../lib/shareslate';

const getServerInfo = function* getServerInfo({ server, raiseError = true }) {
	try {
		const serverInfo = yield RocketChat.getServerInfo(server);
		let websocketInfo = { success: true };
		if (raiseError) {
			websocketInfo = yield RocketChat.getWebsocketInfo({ server });
		}
		if (!serverInfo.success || !websocketInfo.success) {
			if (raiseError) {
				const info = serverInfo.success ? websocketInfo : serverInfo;
				Alert.alert(I18n.t('Oops'), info.message);
			}
			yield put(serverFailure());
			return;
		}

		let serverVersion = semver.valid(serverInfo.version);
		if (!serverVersion) {
			({ version: serverVersion } = semver.coerce(serverInfo.version));
		}

		const serversDB = database.servers;
		const serversCollection = serversDB.collections.get('servers');
		yield serversDB.action(async() => {
			try {
				const serverRecord = await serversCollection.find(server);
				await serverRecord.update((record) => {
					record.version = serverVersion;
				});
			} catch (e) {
				await serversCollection.create((record) => {
					record._raw = sanitizedRaw({ id: server }, serversCollection.schema);
					record.version = serverVersion;
				});
			}
		});

		return serverInfo;
	} catch (e) {
		log(e);
	}
};

const handleSelectServer = function* handleSelectServer({ server, version, fetchVersion }) {
	try {
		// SSL Pinning - Read certificate alias and set it to be used by network requests
		const certificate = yield UserPreferences.getStringAsync(`${ RocketChat.CERTIFICATE_KEY }-${ server }`);
		yield SSLPinning.setCertificate(certificate, server);

		yield put(inquiryReset());
		yield put(encryptionStop());
		const serversDB = database.servers;
		yield UserPreferences.setStringAsync(RocketChat.CURRENT_SERVER, server);
		const userId = yield UserPreferences.getStringAsync(`${ RocketChat.TOKEN_KEY }-${ server }`);
		const ss_user_id = yield UserPreferences.getStringAsync(ShareSlate.USER_ID_KEY);
		const userCollections = serversDB.collections.get('users');
		const shareSlateUserCollections = serversDB.collections.get('shareslate_users');
		let user, ss_user = null;
		if (userId && ss_user_id) {
			try {
				// search credentials on database
				const userRecord = yield userCollections.find(userId);
				const ssUserRecord = yield shareSlateUserCollections.find(ss_user_id);
				user = {
					id: userRecord.id,
					token: userRecord.token,
					username: userRecord.username,
					name: userRecord.name,
					language: userRecord.language,
					status: userRecord.status,
					statusText: userRecord.statusText,
					roles: userRecord.roles,
					avatarETag: userRecord.avatarETag,
				};
				ss_user = {
					user_id: ssUserRecord.user_id,
					token: ssUserRecord.token,
					fname: ssUserRecord.fname,
					lname: ssUserRecord.lname,
					email: ssUserRecord.email,
					username: ssUserRecord.username,
					contact: ssUserRecord.contact,
					country_code: ssUserRecord.country_code,
					gender: ssUserRecord.gender,
					dob: ssUserRecord.dob,
					profile_img: ssUserRecord.profile_img,
					color: ssUserRecord.color,
					country: ssUserRecord.country,
					state: ssUserRecord.state,
					city: ssUserRecord.city,
					designation: ssUserRecord.designation,
					school: ssUserRecord.school,
					college: ssUserRecord.college,
					employer: ssUserRecord.employer,
					friends: ssUserRecord.friends??[]
				}
			} catch {
				// search credentials on shared credentials (Experimental/Official)
				const token = yield UserPreferences.getStringAsync(`${ RocketChat.TOKEN_KEY }-${ userId }`);
				const ss_token = UserPreferences.getStringAsync(ShareSlate.TOKEN_KEY);
				if (token && ss_token) {
					user = { token };
					ss_user = { user_id: ss_user_id, token: ss_token };
				}
			}
		}

		const basicAuth = yield UserPreferences.getStringAsync(`${ BASIC_AUTH_KEY }-${ server }`);
		setBasicAuth(basicAuth);

		// Check for running requests and abort them before connecting to the server
		RocketChat.abort();

		if (user && ss_user) {
			yield put(clearSettings());
			yield ShareSlate.setToken(ss_user.token);
			yield RocketChat.connect({ server, user, ss_user, logoutOnError: true });
			yield put(setUser(user));
			yield put(setShareUser(ss_user));
			yield put(appStart({ root: ROOT_INSIDE }));
		} else {
			yield RocketChat.connect({ server });
			yield put(appStart({ root: ROOT_OUTSIDE }));
		}

		// We can't use yield here because fetch of Settings & Custom Emojis is slower
		// and block the selectServerSuccess raising multiples errors
		RocketChat.setSettings();
		RocketChat.setCustomEmojis();
		RocketChat.setEnterpriseModules();
		if(ss_user){
			yield ShareSlate.getUserDetail({ user_id: ss_user.user_id });
		}

		let serverInfo;
		if (fetchVersion) {
			serverInfo = yield getServerInfo({ server, raiseError: false });
		}

		// Return server version even when offline
		const serverVersion = (serverInfo && serverInfo.version) || version;

		// we'll set serverVersion as metadata for bugsnag
		logServerVersion(serverVersion);
		yield put(selectServerSuccess(server, serverVersion));
	} catch (e) {
		yield put(selectServerFailure());
		log(e);
	}
};

const handleServerRequest = function* handleServerRequest({ server, username, fromServerHistory }) {
	try {
		// SSL Pinning - Read certificate alias and set it to be used by network requests
		// const certificate = yield UserPreferences.getStringAsync(`${ RocketChat.CERTIFICATE_KEY }-${ server }`);
		// yield SSLPinning.setCertificate(certificate, server);

		const serverInfo = yield getServerInfo({ server });
		const serversDB = database.servers;
		const serversHistoryCollection = serversDB.collections.get('servers_history');

		if (serverInfo) {
			yield RocketChat.getLoginServices(server);
			yield RocketChat.getLoginSettings({ server });
			//Navigation.navigate('WorkspaceView');

			if (fromServerHistory) {
				Navigation.navigate('LoginView', { username });
			}

			yield serversDB.action(async() => {
				try {
					const serversHistory = await serversHistoryCollection.query(Q.where('url', server)).fetch();
					if (!serversHistory?.length) {
						await serversHistoryCollection.create((s) => {
							s.url = server;
						});
					}
				} catch (e) {
					log(e);
				}
			});
			yield put(selectServerRequest(server, serverInfo.version, false));
		}
	} catch (e) {
		yield put(serverFailure());
		log(e);
	}
};

const root = function* root() {
	yield takeLatest(SERVER.REQUEST, handleServerRequest);
	yield takeLatest(SERVER.SELECT_REQUEST, handleSelectServer);
};
export default root;
