import { StyleSheet } from 'react-native';

import sharedStyles from '../Styles';

export default StyleSheet.create({
	container: {
		flex: 1,
		padding: 8
	},
	item: {
		marginHorizontal: 8,
		marginTop: 4,
		marginBottom: 12
	},
	itemContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemCurrent: {
		backgroundColor: '#E1E5E8'
	},
	itemHorizontal: {
		marginLeft: 20,
		width: 80,
		alignItems: 'center'
	},
	itemCenter: {
		flex: 1
	},
	itemText: {
		marginVertical: 16,
		fontSize: 14,
		...sharedStyles.textSemibold
	},
	separator: {
		marginVertical: 6
	},
	header: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#AFAAAA',
		borderRadius: 8,
		margin: 8
	},
	headerTop: {
		height: 90,
		width: '100%',
		backgroundColor: '#EBE4E4',
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8
	},
	avatarContainer: {
		marginTop: 30,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-end',
		position: 'absolute'
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50
	},
	statusContainer: {
		backgroundColor: 'white',
		width: '100%',
		paddingVertical: 12,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8
	},
	userStatus: {
		alignSelf: 'center',
		...sharedStyles.textSemibold
	},
	status: {
		width: 25,
		height: 25,
		borderRadius: 13,
		position: 'absolute',
		bottom: 3,
		right: 3
	},
	headerTextContainer: {
		marginTop: 40,
		marginBottom: 16,
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center'
	},
	username: {
		marginTop: 12,
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
		...sharedStyles.textMedium
	},
	currentServerText: {
		fontSize: 14,
		paddingTop: 8,
		color: 'white',
		...sharedStyles.textRegular
	},
	version: {
		marginHorizontal: 10,
		marginBottom: 10,
		fontSize: 13,
		...sharedStyles.textSemibold
	},
	inverted: {
		transform: [{ scaleY: -1 }]
	},
	icon: {
		width: 24,
		height: 24
	}
});
