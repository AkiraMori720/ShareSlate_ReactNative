import * as types from './actionsTypes';

export function fetchContacts() {
	return {
		type: types.CONTACTS.FETCH
	};
}

export function fetchSuccess(contacts, users) {
	return {
		type: types.CONTACTS.FETCH_SUCCESS,
		contacts,
		users
	};
}


export function fetchFailure(err) {
	return {
		type: types.CONTACTS.FETCH_FAILURE,
		err
	};
}

export function setRegistered(users) {
	return {
		type: types.CONTACTS.SET_REGISTERED,
		users
	};
}

export function setContacts(contacts) {
	return {
		type: types.CONTACTS.SET_CONTACTS,
		contacts
	};
}
