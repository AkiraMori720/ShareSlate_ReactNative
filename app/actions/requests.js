import { REQUESTS } from './actionsTypes';

export function fetchRequests(user_id) {
	return {
		type: REQUESTS.FETCH,
		user_id
	};
}

export function setRequests(requests) {
	return {
		type: REQUESTS.SET,
		requests
	};
}

export function addRequest(request, request_type) {
	return {
		type: REQUESTS.ADD,
		request,
		request_type
	};
}

export function removeRequest(request, request_type) {
	return {
		type: REQUESTS.REMOVE,
		request,
		request_type
	};
}
