import { StyleSheet } from 'react-native';
import sharedStyles from '../Styles';

export default StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		paddingVertical: 12
	},
	header: {
		paddingVertical: 16,
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#59ADFF',
		borderRadius: 8,
		margin: 8,
		width: 300,
		alignSelf: 'center'
	},
	avatarContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-end',
		position: 'relative'
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50
	},
	status: {
		width: 25,
		height: 25,
		borderRadius: 13,
		marginLeft: 8,
		position: 'absolute',
		right: 3,
		bottom: 3
	},
	username: {
		marginTop: 12,
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
		...sharedStyles.textMedium
	},
	content: {

	},
	row: {
		flex: 1,
		flexDirection: 'row',
		marginHorizontal: 4,
		marginVertical: 4
	},
	btnContainer: {
		marginHorizontal: 8,
	},
	icon: {
		width: 24,
		height: 24
	},
	logoutBtn: {
		marginTop: 24,
		width: 180,
		height: 68,
		borderRadius: 8,
		alignSelf: 'flex-end',
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
	version: {
		color: 'white',
		fontSize: 12
	}
});
