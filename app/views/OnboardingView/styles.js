import { StyleSheet } from 'react-native';

import { verticalScale, moderateScale } from '../../utils/scaling';
import { isTablet } from '../../utils/deviceInfo';
import sharedStyles from '../Styles';

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		padding: 15
	},
	onboarding: {
		alignSelf: 'center',
		marginTop: isTablet ? 0 : verticalScale(40),
		maxHeight: verticalScale(150),
		resizeMode: 'contain',
		width: 160,
		height: 150
	},
	logoBottom: {
		alignSelf: 'center',
		resizeMode: 'contain',
		width: 330,
	},
	title: {
		...sharedStyles.textBold,
		letterSpacing: 0,
		fontSize: moderateScale(24),
		alignSelf: 'center',
		marginBottom: verticalScale(8)
	},
	subtitle: {
		marginTop: verticalScale(40),
		...sharedStyles.textRegular,
		fontSize: moderateScale(16),
		alignSelf: 'center',
		marginBottom: verticalScale(24)
	},
	description: {
		...sharedStyles.textRegular,
		...sharedStyles.textAlignCenter,
		fontSize: moderateScale(14),
		alignSelf: 'center',
		marginHorizontal: 20,
		flexGrow: 1
	},
	buttonsContainer: {
		marginBottom: verticalScale(40),
		marginTop: verticalScale(30),
	},
	loginBtn: {
		height: 44,
		alignSelf: 'center',
		backgroundColor: '#59ADFF',
		borderRadius: 16,
		width: 120
	}
});
