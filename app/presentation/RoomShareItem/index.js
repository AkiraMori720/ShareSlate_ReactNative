import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ROW_HEIGHT } from './styles';
import RoomShareItem from './RoomShareItem';
import ShareSlate from '../../lib/shareslate';
import { showErrorAlert } from '../../utils/info';
import EventEmitter from '../../utils/events';
import { LISTENER } from '../../containers/Toast';
import { FRIEND_REQUEST_TYPE_RECEIVED, FRIEND_REQUEST_TYPE_SENT } from '../../constants/requests';
import { addRequest as addRequestAction, removeRequest as removeRequestAction } from '../../actions/requests';

export { ROW_HEIGHT };

const attrs = [
	'isSearching',
	'isContact',
	'connected',
	'theme',
	'status',
];

class RoomShareItemContainer extends React.Component {
	static propTypes = {
		id: PropTypes.string,
		shareUserId: PropTypes.string,
		item: PropTypes.object.isRequired,
		isFriend: PropTypes.bool,
		isSearching: PropTypes.bool,
		isContact: PropTypes.bool,
		connected: PropTypes.bool,
		onPress: PropTypes.func,
		onChat: PropTypes.func,
		addRequest: PropTypes.func,
		status: PropTypes.string,
		requests: PropTypes.array,
		theme: PropTypes.string,
	};

	static defaultProps = {
		onPress: () => {},
		onChat: () => {},
		status: 'online'
	}

	constructor(props) {
		super(props);
	}

	shouldComponentUpdate(nextProps) {
		const { props } = this;
		return !attrs.every(key => props[key] === nextProps[key]);
	}

	onPress = () => {
		const { item, onPress } = this.props;
		return onPress(item);
	}

	onAdd = () => {

	}

	onSend = async () => {
		const { shareUserId, id } = this.props;
		try{
			const result = await ShareSlate.sendFriendRequest(shareUserId, id);
			if(result && result.status === 'success'){
				EventEmitter.emit(LISTENER, { message: result.msg });
			} else if(result && result.msg) {
				showErrorAlert(result.msg, 'Oops');
			}
		} catch (e) {
			showErrorAlert('Sending request failed', 'Oops');
		}
	}

	onClose = async() => {
		const { shareUserId, id, item, removeRequest } = this.props;
		try{
			const result = await ShareSlate.declineFriendRequest(shareUserId, id);
			if(result && result.status === 'success'){
				removeRequest({ ...item, type: FRIEND_REQUEST_TYPE_RECEIVED });
				EventEmitter.emit(LISTENER, { message: result.msg });
			} else if(result && result.msg) {
				showErrorAlert(result.msg, 'Oops');
			}
		} catch (e) {
			showErrorAlert('Declining request failed', 'Oops');
		}
	}

	onReceive = async() => {
		const { shareUserId, id, item, removeRequest } = this.props;
		try{
			const result = await ShareSlate.acceptFriendRequest(shareUserId, id);
			if(result && result.status === 'success'){
				removeRequest({ ...item, type: FRIEND_REQUEST_TYPE_RECEIVED });
				EventEmitter.emit(LISTENER, { message: result.msg });
			} else if(result && result.msg) {
				showErrorAlert(result.msg, 'Oops');
			}
		} catch (e) {
			showErrorAlert('Receiving request failed', 'Oops');
		}
	}

	render() {
		const {
			id,
			item,
			theme,
			status,
			isFriend,
			isSearching,
			isContact,
			onChat,
			requests
		} = this.props;

		const name = isContact?`${item.fname} ${item.lname}`:item.name;
		const description = isContact?item.location: item.description;
		const avatar = isContact?item.profile: item.avatar;
		const isReceived = isSearching && !isFriend  && !!(requests.find(request => request.type === FRIEND_REQUEST_TYPE_RECEIVED && request.user_id === item.user_id));
		const isSent = isSearching && !isFriend  && !!(requests.find(request => request.type === FRIEND_REQUEST_TYPE_SENT && request.user_id === item.user_id))
		console.log('item', isReceived, isSent, isFriend, item.user_id, name);

		return (
			<RoomShareItem
				name={name}
				description={description}
				avatar={avatar}
				status={status}
				isContact={isContact}
				onPress={this.onPress}
				onAdd={this.onAdd}
				onChat={onChat}
				onSend={this.onSend}
				onClose={this.onClose}
				onReceive={this.onReceive}
				isAdding={ isSearching && !isFriend && !isReceived && !isSent }
				isChatting={ isSearching && item.isFriend }
				isReceiving={ isReceived }
				isSent={ isSent }
				theme={theme}
			/>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	let status = 'offline';
	// const { id, type, visitor = {} } = ownProps;
	// if (state.meteor.connected) {
	// 	if (type === 'd') {
	// 		status = state.activeUsers[id]?.status || 'offline';
	// 	} else if (type === 'l' && visitor?.status) {
	// 		({ status } = visitor);
	// 	}
	// }
	return {
		connected: state.meteor.connected,
		status,
		requests: state.requests
	};
};

const mapDispatchToProps = dispatch => ({
	addRequest: (request) => dispatch(addRequestAction(request)),
	removeRequest: (request) => dispatch(removeRequestAction(request))
});

export default connect(mapStateToProps, mapDispatchToProps)(RoomShareItemContainer);
