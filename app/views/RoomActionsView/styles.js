import { StyleSheet, I18nManager } from 'react-native';
import { PADDING_HORIZONTAL } from '../../containers/List/constants';

import sharedStyles from '../Styles';

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		paddingVertical: 12
	},
	header: {
		backgroundColor: '#91A3B5',
		borderRadius: 8,
		margin: 16
	},
	roomInfo: {
		paddingVertical: 12,
		paddingHorizontal: 8
	},
	roomInfoContainer: {
		paddingHorizontal: PADDING_HORIZONTAL,
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
		marginVertical: 24
	},
	roomInfoContent: {
		alignItems: 'center'
	},
	backBtn: {
		tintColor: 'white'
	},
	removeRoom: {
		position: 'absolute',
		width: 40,
		height: 40,
		backgroundColor: '#D3D3D3',
		right: 8,
		top: 8,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center'
	},
	avatarContainer: {
		position: 'relative'
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50
	},
	roomTitleContainer: {
		alignItems: 'center',
		marginLeft: 16
	},
	roomTitle: {
		marginTop: 8,
		fontSize: 18,
		color: 'white',
		...sharedStyles.textMedium
	},
	roomDescription: {
		fontSize: 13,
		...sharedStyles.textRegular
	},
	titleInfoItem: {
		flexDirection: 'row',
		paddingTop: 8
	},
	titleIcon: {
		width: 24,
		height: 24
	},
	roomTitleRow: {
		paddingRight: 16,
		flexDirection: 'row',
		alignItems: 'center'
	},
	actionIndicator: {
		...I18nManager.isRTL
			? { transform: [{ rotate: '180deg' }] }
			: {}
	},
	status: {
		position: 'absolute',
		right: 4,
		bottom: 4
	},
	jitsi: {
		alignSelf: 'center',
		justifyContent: 'space-around',
		flexDirection: 'row',
		backgroundColor: '#8A9AA9',
		width: '100%',
		borderBottomRightRadius: 8,
		borderBottomLeftRadius: 8
	},
	jitsiBtnContainer: {
		borderRadius: 8,
		paddingVertical: 8
	},
	jitsiBtn: {
		width: 28,
		height: 28,
		tintColor: 'white'
	},
	content: {

	},
	row: {
		flex: 1,
		flexDirection: 'row',
		marginHorizontal: 4,
		marginBottom: 4
	},
	icon: {
		width: 24,
		height: 24
	},
	actionBtn: {
		marginTop: 12,
		marginBottom: 24,
		width: 180,
		height: 40,
		borderRadius: 8,
		alignSelf: 'center',
		justifyContent: 'center',
		backgroundColor: '#C16E15'
	},
	btnContent: {
		alignItems: 'center',
	},
	btnLabel: {
		fontSize: 20,
		color: 'white'

	},
});
