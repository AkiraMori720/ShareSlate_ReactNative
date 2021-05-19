import * as types from '../actions/actionsTypes';

const initialState = {
	isFetching: false,
	users: [],
	contacts: [],
	err: null
};

export default function contacts(state = initialState, action) {
	switch (action.type) {
		case types.APP.INIT:
			return initialState;
		case types.CONTACTS.FETCH:
			return {
				...state,
				isFetching: true,
			};
		case types.CONTACTS.FETCH_SUCCESS:
			return {
				...state,
				isFetching: false,
				contacts: action.contacts,
				users: action.users,
				err: null
			};
		case types.CONTACTS.FETCH_FAILURE:
			return {
				...state,
				isFetching: false,
				err: action.err
			};
		case types.CONTACTS.SET_REGISTERED:
			return {
				...state,
				users: action.users,
			};
		case types.CONTACTS.SET_CONTACTS:
			return {
				...state,
				contacts: action.contacts
			};
		default:
			return state;
	}
}
