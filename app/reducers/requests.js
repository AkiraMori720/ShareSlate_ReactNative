import { REQUESTS } from '../actions/actionsTypes';

const initialState = [];

export default function requests(state = initialState, action) {
	switch (action.type) {
		case REQUESTS.SET:
			return action.requests??[];
		case REQUESTS.ADD:
			return [
				...state,
				action.request
			];
		case REQUESTS.REMOVE:
			return state.filter(request => request.type !== action.type && request.user_id !== action.request.user_id);
		default:
			return state;
	}
}
