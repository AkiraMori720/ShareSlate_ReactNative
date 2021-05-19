import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import styles from './styles';
import Wrapper from './Wrapper';
import Title from './Title';
import Touch from '../../utils/touch';
import Action from './Action';

const RoomShareItem = ({
	name,
	description,
	avatar,
	status,
	isContact,
	onPress,
	isAdding,
	isSent,
	isChatting,
	isReceiving,
	onClose,
	onReceive,
	onSend,
	onChat,
	theme,
}) => (
		<Wrapper
			avatar={avatar}
			status={status}
			isContact={isContact}
			theme={theme}
		>
			<View style={[styles.titleContainer, styles.flex]}>
				<Touch
					onPress={onPress}
					theme={theme}
					style={{flexGrow: 1}}
				>
					<Title
						name={name}
						description={description}
						theme={theme}
					/>
				</Touch>
				<Action
					isContact={isContact}
					isAdding={isAdding}
					isSent={isSent}
					isChatting={isChatting}
					isReceiving={isReceiving}
					onReceive={onReceive}
					onClose={onClose}
					onSend={onSend}
					onChat={onChat}
					theme={theme}
				/>
			</View>
		</Wrapper>
);

RoomShareItem.propTypes = {
	name: PropTypes.string.isRequired,
	description: PropTypes.string,
	avatar: PropTypes.string,
	status: PropTypes.string,
	onPress: PropTypes.func,
	isContact: PropTypes.bool,
	isAdding: PropTypes.bool,
	isSent: PropTypes.bool,
	isChatting: PropTypes.bool,
	isReceiving: PropTypes.bool,
	onClose: PropTypes.func,
	onReceive: PropTypes.func,
	onSend: PropTypes.func,
	onChat: PropTypes.func,
	theme: PropTypes.string,
};

RoomShareItem.defaultProps = {
	status: 'offline',
	isAdding: false,
	isSent: false,
	isChatting: false,
	isReceiving: false,
	isContact: false,
	onClose: () => {},
	onReceive: () => {},
	onSend: () => {},
	onChat: () => {},
};

export default RoomShareItem;
