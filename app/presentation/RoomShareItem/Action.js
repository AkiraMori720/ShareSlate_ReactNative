import React from 'react';
import { Text, View, Image } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import { themes } from '../../constants/colors';
import Touchable from 'react-native-platform-touchable';

const Item = React.memo(({
	icon, onPress, text, color, theme
}) => (
	<Touchable
		onPress={onPress}
		style={styles.actionItem}
		theme={theme}
	>
		{
			text? <Text style={styles.actionText}>{text}</Text>
				: <Image source={icon} style={[ styles.actionIcon, {tintColor: color?color:themes[theme].grayColor }]}/>
		}
	</Touchable>
))

const Action = React.memo(({
	isContact, isAdding, isSent, isReceiving, isChatting, onClose, onReceive, onSend, onChat, theme
}) => (
	<View style={styles.actions}>
		{
			isAdding ?
				<Item
					icon={isContact?require('../../images/icon_add.png'): require('../../images/icon_add_circle.png')}
					onPress={onSend}
					theme={theme}
				/>
			: null
		}
		{
			isSent ?
				<Item
					text={'Request Sent'}
					onPress={() => {}}
					theme={theme}
				/>
				: null
		}
		{
			isReceiving ?
				[<Item
					icon={require('../../images/icon_check.png')}
					color={'green'}
					onPress={onReceive}
					theme={theme}
				/>,
				<Item
					icon={require('../../images/icon_close.png')}
					color={'red'}
					onPress={onClose}
					theme={theme}
				/>]
				: null
		}
		{
			isChatting ?
				<Item
					icon={require('../../images/icon_chat.png')}
					onPress={onChat}
					theme={theme}
				/>
				: null
		}
	</View>
));

Action.propTypes = {
	isContact: PropTypes.string,
	isAdding: PropTypes.bool,
	isSent: PropTypes.bool,
	isChatting: PropTypes.bool,
	isReceiving: PropTypes.bool,
	onClose: PropTypes.func,
	onReceive: PropTypes.func,
	onSend: PropTypes.func,
	onChat: PropTypes.func,
	theme: PropTypes.string
};

export default Action;
