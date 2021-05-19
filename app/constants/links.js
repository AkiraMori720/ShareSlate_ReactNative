import { getBundleId, isIOS } from '../utils/deviceInfo';

const APP_STORE_ID = '1272915472';

export const PLAY_MARKET_LINK = `https://play.google.com/store/apps/details?id=${ getBundleId }`;
export const FDROID_MARKET_LINK = 'https://f-droid.org/en/packages/chat.rocket.android';
export const APP_STORE_LINK = `https://itunes.apple.com/app/id${ APP_STORE_ID }`;
export const LICENSE_LINK = 'https://github.com/RocketChat/Rocket.Chat.ReactNative/blob/develop/LICENSE';
export const STORE_REVIEW_LINK = isIOS ? `itms-apps://itunes.apple.com/app/id${ APP_STORE_ID }?action=write-review` : `market://details?id=${ getBundleId }`;

// ShareSlate
export const TERMS_URL = 'https://www.shareslate.com/terms.php';
export const PRIVACY_URL = 'https://www.shareslate.com/privacy.php';
export const FAQ_URL = 'https://www.shareslate.com/new_faq.php';
export const SIGN_IN_URL = 'https://sandbox.shareslate.com/login.php';
export const SIGN_UP_URL = 'https://sandbox.shareslate.com/register.php';
export const EDIT_PROFILE_URL = 'https://sandbox.shareslate.com/edit.php';
export const HELP_URL = 'https://sandbox.shareslate.com/help.php';