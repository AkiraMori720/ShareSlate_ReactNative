import fetch from '../utils/fetch';
import { SHARESLATE_MAIN_SERVER } from '../constants/server';
import reduxStore from './createStore';
import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';
import database from './database';
import log from '../utils/log';
import UserPreferences from './userPreferences';
import { FRIEND_REQUEST_TYPE_RECEIVED } from '../constants/requests';
import { Base64 } from 'js-base64';

const TOKEN_KEY = 'reactnativeshareslate_user_token';
const USER_ID_KEY = 'reactnativeshareslate_user_id';

const ShareSlate = {
	TOKEN_KEY,
	USER_ID_KEY,
	async loginWithPassword({ email, password}){
		const credentials = new FormData();
		credentials.append("email", email);
		credentials.append("password", password);

		const mainResult = await fetch(`${SHARESLATE_MAIN_SERVER}/apis/rc_login.php`, {
			method: 'POST',
			body: credentials,
		}).then(response => response.json());

		if(mainResult.status === 'success') {
			let rc_credential = this.getClaimFromSSToken(mainResult.auth_token);
			console.log('rc_credential', rc_credential);
			if(rc_credential){
				this.setToken(mainResult.auth_token);
				return {
					success: true,
					email: rc_credential.email,
					password: rc_credential.password,
					ss_user: {
						user_id: mainResult.user_id,
						token: mainResult.auth_token
					}
				}
			}
			return { success: false, msg: 'Login Failed' };
		}
		return { success: false, msg: mainResult.msg };
	},
	setToken(token){
		this.jwt_token = token;
	},
	urlBase64Decode(str) {
		let output = str.replace('-', '+').replace('_', '/');
		switch (output.length % 4) {
			case 0:
				break;
			case 2:
				output += '==';
				break;
			case 3:
				output += '=';
				break;
			default:
				throw 'Illegal base64url string!';
		}
		return Base64.decode(output);
	},

	getClaimFromSSToken(token) {
		let user = {};
		if (typeof token !== 'undefined') {
			let encoded = token.split('.')[1];
			user = JSON.parse(this.urlBase64Decode(encoded));
		}
		return user;
	},
	post(url, params, auth= true) {
		return new Promise(async(resolve, reject) => {
			try {
				const formData = new FormData();
				Object.keys(params).forEach(key => {
					if(key === 'file'){
						console.log('file', params['file']);
						formData.append('profile', {
							type: params['file'].type,
							name: params['file'].name || 'profileImage',
							uri: params['file'].url
						});
					} else {
						formData.append(key, params[key]);
					}
				})

				if(auth){
					formData.append('token', this.jwt_token);
				}

				await fetch(`${SHARESLATE_MAIN_SERVER}${url}`, {
					method: 'POST',
					body: formData,
				})
					.then(response => resolve(response.json()))
					.catch(e => reject(e));
			} catch (e) {
				reject(e);
			}
		});
	},

	get(url, params) {
		return new Promise(async(resolve, reject) => {
			try {
				console.log('api call get', url, params);
				await fetch(`${SHARESLATE_MAIN_SERVER}${url}`, {
					headers: params,
				})
					.then(response => resolve(response.json()))
					.catch(e => reject(e));
			} catch (e) {
				reject(e);
			}
		});
	},

	async search({ text }){
		const searchText = text.trim();
		// if (searchText === '') {
		// 	return [];
		// }
		const shareUser = reduxStore.getState().login.shareUser;
		const id = shareUser.user_id;
		try{
			const formData = {
				logged_in_user_id: id,
				value: searchText
			}
			const result = await this.post(`/apis/search.php`, formData);
			if(result.status === 'success'){
				return result.data;
			}
			return [];
		} catch (e){
			return [];
		}
	},

	async fetchProfile({ user_id }){
		try{
			const formData = {
				user_id
			}
			const result = await this.post(`/apis/user_detail.php`, formData);
			const paramData = {
				user_id,
				action: 'get_friends'
			}

			let friend_ids = [];
			try{
				const result = await this.post('/apis/get_friends.php', paramData);
				if(result.status === 'success'){
					friend_ids = result.data.map(friend => friend.id);
				}
			} catch (e) {

			}

			if(result.status === 'success'){
				return {
					user_id: result.user_id,
					fname: result.fname,
					lname: result.lname,
					email: result.email,
					username: result.username,
					contact: result.contact??'',
					country_code: result.country_code??'',
					gender: result.gender??'',
					dob: result.dob??'',
					profile_img: result.profile_img??'',
					color: result.color??'',
					country: result.country??'',
					state: result.state??'',
					city: result.city??'',
					designation: result.designation??'',
					school: result.school??'',
					college: result.college??'',
					employer: result.employer??'',
					friends: friend_ids
				};
			}
			return null;
		} catch (e){
			return null;
		}
	},

	async saveProfile(fields){
		const { shareUser } = reduxStore.getState().login;
		const id = shareUser.user_id;

		let formData = {
			user_id: id,
			...fields
		};

		if(formData.location){
			const location = formData.location;
			const filterLocation = location.split(',');
			formData.city = filterLocation[0];
			formData.state = filterLocation[1]??'';
			formData.country = filterLocation[2]??'';
			delete formData.location;
		}
		const result = await this.post(`/apis/save_profile.php`, formData);
		if(result.status === 'success'){
			return result.message;
		}
		throw result.message;
	},

	async fetchAddress({text}){
		const searchText = text.trim();
		if (searchText === '') {
			return [];
		}
		const { user } = reduxStore.getState().login;
		try{
			const formData = {
				value: searchText
			}
			const result = await this.post(`/dashboard/ajax/autocomplete.php`, formData);
			if(result){
				return result;
			}
			return [];
		} catch (e){
			return [];
		}
	},

	getFullName(user){
		if(!user) return '';
		return `${user.fname} ${user.lname}`;
	},

	getLocation(user){
		if(!user) return '';
		return `${user.city?user.city + ', ':''}${user.state?user.state + ', ':''}${user.country?user.country + ', ':''}`;
	},

	async getUserDetail({ user_id }){
		const user = await this.fetchProfile({ user_id });
		if(!user){
			return;
		}

		const serversDB = database.servers;

		try{
			const shareUsersCollection = serversDB.collections.get('shareslate_users');
			const su = {
				user_id: user.user_id,
				token: user.token,
				fname: user.fname,
				lname: user.lname,
				email: user.email,
				username: user.username,
				contact: user.contact,
				country_code: user.country_code,
				gender: user.gender,
				dob: user.dob,
				profile_img: user.profile_img,
				color: user.color,
				country: user.country,
				state: user.state,
				city: user.city,
				designation: user.designation,
				school: user.school,
				college: user.college,
				employer: user.employer,
				friends: user.friends
			};
			await serversDB.action(async() => {
				const userRecord = await shareUsersCollection.find(su.user_id);
				await userRecord.update((record) => {
					record._raw = sanitizedRaw({ id: su.user_id, ...record._raw }, shareUsersCollection.schema);
					Object.assign(record, su);
				});
			});
		} catch (e) {

		}
	},
	async sendFriendRequest(sender_id, receiver_id){
		const params = {
			sender_id,
			receiver_id,
			action: 'send'
		};
		return await this.post(`/apis/request.php`, params);
	},
	async acceptFriendRequest(sender_id, receiver_id){
		const params = {
			sender_id,
			receiver_id,
			action: 'accept'
		};
		return await this.post(`/apis/request.php`, params);
	},
	async declineFriendRequest(sender_id, receiver_id){
		const params = {
			sender_id,
			receiver_id,
			action: 'decline'
		};
		return await this.post(`/apis/request.php`, params);
	},
	async fetchRequests(user_id) {
		try{
			const params = {
				user_id,
			};
			const result = await this.post(`/apis/userRequests.php`, params);
			if(result.status === 'success'){
				return result.data.map(item => ({
					user_id: item.id,
					fname: item.fname,
					lname: item.lname,
					profile: item.img,
					location: this.getLocation(item),
					type: FRIEND_REQUEST_TYPE_RECEIVED
				}));
			}
		} catch (e){
			log(e);
		}
		return [];
	},
	async logout(){
		const userId = await UserPreferences.getStringAsync(ShareSlate.USER_ID_KEY);
		try{
			const serversDB = database.servers;
			const usersCollection = serversDB.collections.get('shareslate_users');
			if (userId) {
				const userRecord = await usersCollection.find(userId);
				await serversDB.action(async() => {
					await userRecord.destroyPermanently();
				});
			}
		} catch (e) {

		}
		await UserPreferences.removeItem(ShareSlate.USER_ID_KEY);
		await UserPreferences.removeItem(ShareSlate.TOKEN_KEY);
	}
}

export default ShareSlate;
