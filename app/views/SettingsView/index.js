import React from 'react';
import {
	Linking, Share, Clipboard, Image, View, Text, ScrollView
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FastImage from '@rocket.chat/react-native-fast-image';
import CookieManager from '@react-native-community/cookies';

import { logout as logoutAction } from '../../actions/login';
import { selectServerRequest as selectServerRequestAction } from '../../actions/server';
import { STATUS_COLORS, themes } from '../../constants/colors';
import * as HeaderButton from '../../containers/HeaderButton';
import StatusBar from '../../containers/StatusBar';
import * as List from '../../containers/List';
import I18n from '../../i18n';
import RocketChat from '../../lib/rocketchat';
import {
	getReadableVersion, getDeviceModel, isAndroid
} from '../../utils/deviceInfo';
import openLink from '../../utils/openLink';
import { showErrorAlert, showConfirmationAlert } from '../../utils/info';
import { logEvent, events } from '../../utils/log';
import {
	PLAY_MARKET_LINK, FDROID_MARKET_LINK, APP_STORE_LINK, LICENSE_LINK, TERMS_URL
} from '../../constants/links';
import { withTheme } from '../../theme';
import { LISTENER } from '../../containers/Toast';
import EventEmitter from '../../utils/events';
import { appStart as appStartAction, ROOT_LOADING } from '../../actions/app';
import { onReviewPress } from '../../utils/review';
import SafeAreaView from '../../containers/SafeAreaView';
import database from '../../lib/database';
import { isFDroidBuild } from '../../constants/environment';
import { getShareUserSelector, getUserSelector } from '../../selectors/login';
import SettingItem from './SettingItem';
import sharedStyles from '../Styles';
import styles from './styles';
import scrollPersistTaps from '../../utils/scrollPersistTaps';
import Touchable from 'react-native-platform-touchable';

class SettingsView extends React.Component {
	static navigationOptions = ({ navigation, isMasterDetail }) => ({
		headerLeft: () => (isMasterDetail ? (
			<HeaderButton.CloseModal navigation={navigation} testID='settings-view-close' />
		) : (
			<HeaderButton.Drawer navigation={navigation} testID='settings-view-drawer' />
		)),
		title: I18n.t('Settings')
	});

	static propTypes = {
		navigation: PropTypes.object,
		server: PropTypes.object,
		theme: PropTypes.string,
		isMasterDetail: PropTypes.bool,
		logout: PropTypes.func.isRequired,
		selectServerRequest: PropTypes.func,
		user: PropTypes.shape({
			roles: PropTypes.array,
			id: PropTypes.string,
			status: PropTypes.string
		}),
		shareUser: PropTypes.object,
		appStart: PropTypes.func
	}

	checkCookiesAndLogout = async() => {
		const { logout, user } = this.props;
		const db = database.servers;
		const usersCollection = db.collections.get('users');
		try {
			const userRecord = await usersCollection.find(user.id);
			if (!userRecord.loginEmailPassword) {
				showConfirmationAlert({
					title: I18n.t('Clear_cookies_alert'),
					message: I18n.t('Clear_cookies_desc'),
					confirmationText: I18n.t('Clear_cookies_yes'),
					dismissText: I18n.t('Clear_cookies_no'),
					onPress: async() => {
						await CookieManager.clearAll(true);
						logout();
					},
					onCancel: () => {
						logout();
					}
				});
			} else {
				logout();
			}
		} catch {
			// Do nothing: user not found
		}
	}

	handleLogout = () => {
		logEvent(events.SE_LOG_OUT);
		showConfirmationAlert({
			message: I18n.t('You_will_be_logged_out_of_this_application'),
			confirmationText: I18n.t('Logout'),
			onPress: this.checkCookiesAndLogout
		});
	}

	handleClearCache = () => {
		logEvent(events.SE_CLEAR_LOCAL_SERVER_CACHE);
		showConfirmationAlert({
			message: I18n.t('This_will_clear_all_your_offline_data'),
			confirmationText: I18n.t('Clear'),
			onPress: async() => {
				const {
					server: { server }, appStart, selectServerRequest
				} = this.props;
				appStart({ root: ROOT_LOADING, text: I18n.t('Clear_cache_loading') });
				await RocketChat.clearCache({ server });
				await FastImage.clearMemoryCache();
				await FastImage.clearDiskCache();
				selectServerRequest(server, null, true);
			}
		});
	}

	navigateToScreen = (screen) => {
		logEvent(events[`SE_GO_${ screen.replace('View', '').toUpperCase() }`]);
		const { navigation } = this.props;
		navigation.navigate(screen);
	}

	sendEmail = async() => {
		logEvent(events.SE_CONTACT_US);
		const subject = encodeURI('ShareSlate App Support');
		const email = encodeURI('support@shareslate.com');
		const description = encodeURI(`
			version: ${ getReadableVersion }
			device: ${ getDeviceModel }
		`);
		try {
			await Linking.openURL(`mailto:${ email }?subject=${ subject }&body=${ description }`);
		} catch (e) {
			logEvent(events.SE_CONTACT_US_F);
			showErrorAlert(I18n.t('error-email-send-failed', { message: 'support@rocket.chat' }));
		}
	}

	shareApp = () => {
		let message;
		if (isAndroid) {
			message = PLAY_MARKET_LINK;
			if (isFDroidBuild) {
				message = FDROID_MARKET_LINK;
			}
		} else {
			message = APP_STORE_LINK;
		}
		Share.share({ message });
	}

	copyServerVersion = () => {
		const { server: { version } } = this.props;
		logEvent(events.SE_COPY_SERVER_VERSION, { serverVersion: version });
		this.saveToClipboard(version);
	}

	copyAppVersion = () => {
		logEvent(events.SE_COPY_APP_VERSION, { appVersion: getReadableVersion });
		this.saveToClipboard(getReadableVersion);
	}

	saveToClipboard = async(content) => {
		await Clipboard.setString(content);
		EventEmitter.emit(LISTENER, { message: I18n.t('Copied_to_clipboard') });
	}

	onPressLicense = () => {
		logEvent(events.SE_READ_LICENSE);
		const { theme } = this.props;
		openLink(LICENSE_LINK, theme);
	}

	render() {
		const { shareUser, user, server, isMasterDetail, theme } = this.props;
		return (
			<SafeAreaView testID='settings-view'>
				<StatusBar />
				<ScrollView style={styles.container} {...scrollPersistTaps}>
					<View style={[styles.header, sharedStyles.shadow]}>
						<View style={styles.avatarContainer}>
							<Image style={styles.avatar} source={{ uri: shareUser.profile_img }}/>
							<View style={[styles.status, {backgroundColor: STATUS_COLORS[user.status] ?? STATUS_COLORS.offline}]}/>
						</View>
						<Text numberOfLines={1} style={styles.username}>{`${shareUser.fname} ${shareUser.lname}`}</Text>
					</View>
					<View style={styles.content}>
						<View style={styles.row}>
							<SettingItem
								title='Profile'
								left={<Image source={require('../../images/icon_user.png')} style={[styles.icon, { tintColor: themes[theme].grayColor }]} />}
								onPress={() => this.navigateToScreen('ProfileView')}
								testID='settings-view-contact'
							/>
							<SettingItem
								title='Contact_us'
								left={<Image source={require('../../images/icon_sound.png')} style={[styles.icon, { tintColor: themes[theme].grayColor }]} />}
								onPress={this.sendEmail}
								testID='settings-view-contact'
							/>
						</View>
						<View style={styles.row}>
							<SettingItem
								title='Terms & Conditions'
								left={<Image source={require('../../images/icon_card.png')} style={[styles.icon, { tintColor: themes[theme].grayColor }]} />}
								onPress={()=>openLink(TERMS_URL)}
								testID='settings-view-contact'
								translateTitle={false}
							/>
							<SettingItem
								title='Review_this_app'
								left={<Image source={require('../../images/icon_feedback.png')} style={[styles.icon, { tintColor: themes[theme].grayColor }]} />}
								onPress={onReviewPress}
								testID='settings-view-review-app'
							/>
						</View>
						<View style={styles.row}>
							<SettingItem
								title='Share_this_app'
								left={<Image source={require('../../images/icon_sharefill.png')} style={[styles.icon, { tintColor: themes[theme].grayColor }]} />}
								onPress={this.shareApp}
								testID='settings-view-share-app'
							/>
							<SettingItem
								title='Security_and_privacy'
								left={<Image source={require('../../images/icon_lock.png')} style={[styles.icon, { tintColor: themes[theme].grayColor }]} />}
								onPress={() => this.navigateToScreen('SecurityPrivacyView')}
								testID='settings-view-security-privacy'
							/>
						</View>
					</View>

					<View style={styles.btnContainer}>
						<Touchable
							type='primary'
							testID='settings-logout'
							onPress={this.handleLogout}
							style={styles.logoutBtn}
							theme={theme}>
							<View style={styles.btnContent}>
								<Text style={styles.btnLabel}>Logout</Text>
								<Text style={styles.version}>{I18n.t('Version_no', { version: getReadableVersion })}</Text>
							</View>
						</Touchable>
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}
}

const mapStateToProps = state => ({
	server: state.server,
	user: getUserSelector(state),
	shareUser: getShareUserSelector(state),
	isMasterDetail: state.app.isMasterDetail
});

const mapDispatchToProps = dispatch => ({
	logout: () => dispatch(logoutAction()),
	selectServerRequest: params => dispatch(selectServerRequestAction(params)),
	appStart: params => dispatch(appStartAction(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SettingsView));
