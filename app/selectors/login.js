import { createSelector } from 'reselect';
import { isEmpty } from 'lodash';

const getUser = (state) => {
	if (!isEmpty(state.share?.user)) {
		return state.share.user;
	}
	return state.login?.user;
};
const getSsUser = (state) => {
	if (!isEmpty(state.share?.shareUser)) {
		return state.share.shareUser;
	}
	return state.login?.shareUser;
};

const getLoginServices = state => state.login.services || {};
const getShowFormLoginSetting = state => state.settings.Accounts_ShowFormLogin || false;
const getIframeEnabledSetting = state => state.settings.Accounts_iframe_enabled || false;

export const getUserSelector = createSelector(
	[getUser],
	user => user
);

export const getShareUserSelector = createSelector(
	[getSsUser],
	shareUser => shareUser
);

export const getShowLoginButton = createSelector(
	[getLoginServices, getShowFormLoginSetting, getIframeEnabledSetting],
	(loginServices, showFormLogin, iframeEnabled) => showFormLogin || Object.values(loginServices).length || iframeEnabled
);
