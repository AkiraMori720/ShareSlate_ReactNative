import { StyleSheet, PixelRatio } from 'react-native';

import sharedStyles from '../../views/Styles';

export const ROW_HEIGHT = 75 * PixelRatio.getFontScale();
export const ACTION_WIDTH = 80;
export const SMALL_SWIPE = ACTION_WIDTH / 2;
export const LONG_SWIPE = ACTION_WIDTH * 3;

export default StyleSheet.create({
	flex: {
		flex: 1
	},
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 14,
		height: ROW_HEIGHT
	},
	centerContainer: {
		flex: 1,
		paddingVertical: 10,
		paddingRight: 14,
		borderBottomWidth: StyleSheet.hairlineWidth
	},
	avatarContainer: {
		position: 'relative'
	},
	title: {
		fontSize: 17,
		marginVertical: 4,
		...sharedStyles.textMedium
	},
	subTitle: {
		fontSize: 14,
		marginVertical: 4,
		fontStyle: 'italic',
		...sharedStyles.textRegular
	},
	row: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-start'
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	date: {
		fontSize: 13,
		marginLeft: 4,
		...sharedStyles.textRegular
	},
	updateAlert: {
		...sharedStyles.textSemibold
	},
	status: {
		position: 'absolute',
		bottom: 2,
		right: 8
	},
	markdownText: {
		flex: 1,
		fontSize: 14,
		lineHeight: 17,
		...sharedStyles.textRegular
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 10
	},
	upperContainer: {
		overflow: 'hidden'
	},
	actionsContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		height: ROW_HEIGHT
	},
	actionLeftButtonContainer: {
		position: 'absolute',
		height: ROW_HEIGHT,
		justifyContent: 'center',
		top: 0,
		right: 0
	},
	actionRightButtonContainer: {
		position: 'absolute',
		height: ROW_HEIGHT,
		justifyContent: 'center',
		top: 0
	},
	actionButton: {
		width: ACTION_WIDTH,
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'center',
		width: 80
	},
	actionItem: {
	},
	actionText: {
		fontSize: 12,
		justifyContent: 'center',
		marginTop: 4,
		...sharedStyles.textSemibold
	},
	actionIcon: {
		width: 24,
		height: 24,
		margin: 12
	}
});
