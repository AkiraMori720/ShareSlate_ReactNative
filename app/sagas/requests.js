import {
	put, takeLatest
} from 'redux-saga/effects';

import { REQUESTS } from '../actions/actionsTypes';
import ShareSlate from '../lib/shareslate';
import log from '../utils/log';
import { setRequests } from '../actions/requests';

const handleFetchRequests = function* handleFetchRequests({ user_id }) {
	try {
		const requests = yield ShareSlate.fetchRequests(user_id);
		yield put(setRequests(requests));
	} catch (e) {
		log(e);
	}
};

const root = function* root() {
	yield takeLatest(REQUESTS.FETCH, handleFetchRequests);
};

export default root;
