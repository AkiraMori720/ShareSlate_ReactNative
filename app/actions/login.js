import * as types from './actionsTypes';

export function loginRequest(credentials, logoutOnError) {
	return {
		type: types.LOGIN.REQUEST,
		credentials,
		logoutOnError
	};
}

export function loginSuccess(user, shareUser) {
	return {
		type: types.LOGIN.SUCCESS,
		user,
		shareUser
	};
}

export function loginFailure(err) {
	return {
		type: types.LOGIN.FAILURE,
		err
	};
}

export function logout(forcedByServer = false) {
	return {
		type: types.LOGOUT,
		forcedByServer
	};
}

export function setUser(user) {
	return {
		type: types.USER.SET,
		user
	};
}

export function setShareUser(shareUser){
	return {
		type: types.USER.SHARE_SET,
		shareUser
	}
}

export function setLoginServices(data) {
	return {
		type: types.LOGIN.SET_SERVICES,
		data
	};
}

export function setPreference(preference) {
	return {
		type: types.LOGIN.SET_PREFERENCE,
		preference
	};
}

export function setLocalAuthenticated(isLocalAuthenticated) {
	return {
		type: types.LOGIN.SET_LOCAL_AUTHENTICATED,
		isLocalAuthenticated
	};
}

export function addShareFriend(id){
	return {
		type: types.USER.SHARE_ADD_FRIEND,
		id
	}
}