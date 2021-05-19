import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Avatar from '../../containers/Avatar';
import { themes } from '../../constants/colors';
import Status from '../../containers/Status/Status';
import { connect } from 'react-redux';

const styles = StyleSheet.create({
	container: {
		width: '25%'
	},
	avatarContainer: {
		alignItems: 'center',
		position: 'absolute',
		width: '100%',
		marginHorizontal: 6,
		zIndex: 1
	},
	avatar: {
		marginRight: 10,
	},
	status: {
		position: 'absolute',
		bottom: 4,
		right: 10
	},
	userContainer: {
		marginTop: 24,
		paddingTop: 30,
		paddingHorizontal: 12,
		paddingBottom: 14,
		marginHorizontal: 8,
		borderRadius: 8,
		alignItems: 'center'
	},
	userName: {
		height: 16
	}
});

const RecentDirectRoom = React.memo(({
	username, type, avatar, status, avatarSize, borderRadius, rid, onPress, theme
}) => {
	return (
		<TouchableOpacity onPress={onPress} style={ styles.container }>
			<View style={styles.avatarContainer}>
				<View>
					<Avatar
						text={avatar}
						size={avatarSize}
						borderRadius={borderRadius}
						type={type}
						style={styles.avatar}
						rid={rid}
					/>
					<Status style={styles.status} size={12} status={status} theme={theme}/>
				</View>
			</View>
			<View style={[styles.userContainer, {backgroundColor: themes[theme].searchboxBackground}]}>
				<Text style={[styles.userName, {color: themes[theme].bodyText}]}>{username}</Text>
			</View>
		</TouchableOpacity>
	);
});

const mapStateToProps = (state, ownProps) => {
	let status = 'offline';
	const { id, type, visitor = {} } = ownProps;
	if (state.meteor.connected) {
		if (type === 'd') {
			status = state.activeUsers[id]?.status || 'offline';
		} else if (type === 'l' && visitor?.status) {
			({ status } = visitor);
		}
	}
	return {
		connected: state.meteor.connected,
		status
	};
};

export default connect(mapStateToProps)(RecentDirectRoom);
