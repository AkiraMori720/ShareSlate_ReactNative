import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Touchable from 'react-native-platform-touchable';

import MessageContext from './Context';

import User from './User';
import styles from './styles';
import RepliedThread from './RepliedThread';
import MessageAvatar from './MessageAvatar';
import Attachments from './Attachments';
import Urls from './Urls';
import Thread from './Thread';
import Blocks from './Blocks';
import Reactions from './Reactions';
import Broadcast from './Broadcast';
import Discussion from './Discussion';
import Content from './Content';
import ReadReceipt from './ReadReceipt';
import CallButton from './CallButton';

const MessageInner = React.memo((props) => {
	if (props.type === 'discussion-created') {
		return (
			<>
				<User {...props} />
				<Discussion {...props} />
			</>
		);
	}
	if (props.type === 'jitsi_call_started') {
		return (
			<>
				<User {...props} />
				<Content {...props} isInfo />
				<CallButton {...props} />
			</>
		);
	}
	if (props.blocks && props.blocks.length) {
		return (
			<>
				<User {...props} />
				<Blocks {...props} />
				<Thread {...props} />
				<Reactions {...props} />
			</>
		);
	}
	return (
		<>
			<User {...props} />
			<Content {...props} />
			<Attachments {...props} />
			<Urls {...props} />
			<Thread {...props} />
			<Reactions {...props} />
			<Broadcast {...props} />
		</>
	);
});
MessageInner.displayName = 'MessageInner';

const Message = React.memo((props) => {
	if (props.isThreadReply || props.isThreadSequential || props.isInfo || props.isIgnored) {
		const thread = props.isThreadReply ? <RepliedThread {...props} /> : null;
		if(props.isOwner) {
			return (
				<View style={ [styles.ownerContainer, props.style] }>
					{ thread }
					<View style={ styles.flex }>
						<View
							style={ [
								styles.ownerMessageContent,
								props.isHeader && styles.ownerMessageContentWithHeader
							] }
						>
							<Content { ...props } />
						</View>
						<MessageAvatar small { ...props } />
					</View>
				</View>
			);
		} else {
			return (
				<View style={[styles.container, props.style]}>
					{thread}
					<View style={styles.flex}>
						<MessageAvatar small {...props} />
						<View
							style={[
								styles.messageContent,
								props.isHeader && styles.messageContentWithHeader
							]}
						>
							<Content {...props} />
						</View>
					</View>
				</View>
			);
		}
	}

	if(props.isOwner){
		return (
			<View style={[styles.container, props.style]}>
				<View style={styles.flex}>
					<View
						style={[
							styles.ownerMessageContent,
							props.isHeader && styles.ownerMessageContentWithHeader
						]}
					>
						<MessageInner {...props} />
					</View>
					<MessageAvatar {...props} />
				</View>
			</View>
		);
	}
	else {
		return (
			<View style={[styles.container, props.style]}>
				<View style={styles.flex}>
					<MessageAvatar {...props} />
					<View
						style={[
							styles.messageContent,
							props.isHeader && styles.messageContentWithHeader
						]}
					>
						<MessageInner {...props} />
					</View>
				</View>
			</View>
		)
	}
});
Message.displayName = 'Message';

const MessageTouchable = React.memo((props) => {
	if (props.hasError) {
		return (
			<View>
				<Message {...props} />
			</View>
		);
	}
	const { onPress, onLongPress } = useContext(MessageContext);
	return (
		<Touchable
			onLongPress={onLongPress}
			onPress={onPress}
			disabled={props.isInfo || props.archived || props.isTemp}
		>
			<View>
				<Message {...props} />
			</View>
		</Touchable>
	);
});
MessageTouchable.displayName = 'MessageTouchable';

MessageTouchable.propTypes = {
	hasError: PropTypes.bool,
	isInfo: PropTypes.bool,
	isTemp: PropTypes.bool,
	archived: PropTypes.bool
};

Message.propTypes = {
	isThreadReply: PropTypes.bool,
	isThreadSequential: PropTypes.bool,
	isInfo: PropTypes.bool,
	isTemp: PropTypes.bool,
	isHeader: PropTypes.bool,
	hasError: PropTypes.bool,
	style: PropTypes.any,
	onLongPress: PropTypes.func,
	isReadReceiptEnabled: PropTypes.bool,
	unread: PropTypes.bool,
	theme: PropTypes.string,
	isIgnored: PropTypes.bool
};

MessageInner.propTypes = {
	type: PropTypes.string,
	blocks: PropTypes.array
};

export default MessageTouchable;
