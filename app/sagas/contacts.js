import {
	put, takeLatest
} from 'redux-saga/effects';
import 'moment/min/locales';
import * as types from '../actions/actionsTypes';
import Contacts from 'react-native-contacts';
import RocketChat from '../lib/rocketchat';
import { fetchFailure, fetchSuccess } from '../actions/contacts';

const handleFetchContacts = function* handleFetchContacts() {
	try {
		const permission = yield Contacts.checkPermission();
		if(!permission || permission!== 'authorized'){
			yield put(fetchFailure('not-allowed'));
			return;
		}

		const list = yield Contacts.getAll();

		let contacts = list.filter(item => item.emailAddresses.length > 0).sort(function(a, b){
			let nameA = a.displayName.toUpperCase(); // ignore upper and lowercase
			let nameB = b.displayName.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		});
		let contactUsers = [];
		let emails = [];

		contacts.forEach(item => {
			emails = emails.concat(item.emailAddresses.map(address => { return address.email}));
		})

		try{
			const result = yield RocketChat.getUsers({
				emails,
				sort: { username: 1 }
			});
			const registeredUsers = result.users;
			contacts.forEach(contact => {
				if(!contact.separator){
					const contactEmails = contact.emailAddresses.map(address => {
						return address.email;
					});

					for(let i = 0; i<registeredUsers.length; i++){
						const user = registeredUsers[i];
						if (user.emails.find(email => { return contactEmails.includes(email.address) })) {
							contactUsers.push({
								...user,
								contact
							});
							break;
						}
					}
				}
			});
		} catch (e) {
			log(e);
			yield put(fetchFailure(e));
			return;
		}

		yield put(fetchSuccess(contacts, contactUsers));

	} catch (e) {
		yield put(fetchFailure(e));
	}
};

const root = function* root() {
	yield takeLatest(types.CONTACTS.FETCH, handleFetchContacts);
};
export default root;
