import { StyleSheet } from 'react-native';

export default StyleSheet.create({
	disabled: {
		opacity: 0.3
	},
	avatarContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
		backgroundColor: '#59ADFF',
		borderRadius: 8,
		paddingTop: 32,
		paddingBottom: 16,
		position: 'relative'
	},
	editProfile: {
		position: 'absolute',
		top: 16,
		right: 16
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
		position: 'absolute',
		right: 3,
		bottom: 3
	},
	fname: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 20,
		marginTop: 12
	},
	inputContainer: {
		marginTop: 8
	},
	logoutBtn: {
		marginTop: 12,
		width: 140,
		alignSelf: 'center',
		backgroundColor: '#F8C822'
	},
	avatarButtons: {
		flexWrap: 'wrap',
		flexDirection: 'row',
		justifyContent: 'flex-start'
	},
	avatarButton: {
		backgroundColor: '#e1e5e8',
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 15,
		marginBottom: 15,
		borderRadius: 2
	},
	profileEditIcon: {
		width: 24,
		height: 24,
		tintColor: 'white'
	}
});
