import React from 'react';
import { View, Text, Keyboard, FlatList, RefreshControl } from 'react-native';
import { withTheme } from '../../theme';
import I18n from '../../i18n';
import * as HeaderButton from '../../containers/HeaderButton';
import sharedStyles from '../Styles';
import SafeAreaView from '../../containers/SafeAreaView';
import { themes } from '../../constants/colors';
import StatusBar from '../../containers/StatusBar';
import { goRoom } from '../../utils/goRoom';
import Header, { getHeaderTitlePosition } from '../../containers/Header';
import { withDimensions } from '../../dimensions';
import { withSafeAreaInsets } from 'react-native-safe-area-context';
import UserSearchBox from '../../containers/UserSearchBox';
import debounce from '../../utils/debounce';
import RocketChat from '../../lib/rocketchat';
import { animateNextTransition } from '../../utils/layoutAnimation';
import database from '../../lib/database';
import { Q } from '@nozbe/watermelondb';
import { isIOS, isTablet } from '../../utils/deviceInfo';
import EventEmitter from '../../utils/events';
import { KEY_COMMAND } from '../../commands';
import Orientation from 'react-native-orientation-locker';
import PropTypes from 'prop-types';
import ActivityIndicator from '../../containers/ActivityIndicator';
import styles from './styles';
import RoomItem, { ROW_HEIGHT } from '../../presentation/RoomItem';
import { getUserSelector } from '../../selectors/login';
import { connect } from 'react-redux';
import { MAX_SIDEBAR_WIDTH } from '../../constants/tablet';
import log, { events, logEvent } from '../../utils/log';

const INITIAL_NUM_TO_RENDER = isTablet ? 20 : 12;
const CHATS_HEADER = 'Chats';
const UNREAD_HEADER = 'Unread';
const FAVORITES_HEADER = 'Favorites';
const DISCUSSIONS_HEADER = 'Discussions';
const CHANNELS_HEADER = 'Channels';
const DM_HEADER = 'Direct_Messages';
const GROUPS_HEADER = 'Private_Groups';
const OMNICHANNEL_HEADER = 'Open_Livechats';
const QUERY_SIZE = 20;

const filterIsUnread = s => (s.unread > 0 || s.tunread?.length > 0 || s.alert) && !s.hideUnreadStatus;
const filterIsFavorite = s => s.f;
const filterIsOmnichannel = s => s.t === 'l';

const getItemLayout = (data, index) => ({
	length: ROW_HEIGHT,
	offset: ROW_HEIGHT * index,
	index
});
const keyExtractor = item => item.rid;


class HomeView extends React.Component{
	static propTypes = {
		navigation: PropTypes.object,
		user: PropTypes.shape({
			id: PropTypes.string,
			username: PropTypes.string,
			token: PropTypes.string,
			statusLivechat: PropTypes.string,
			roles: PropTypes.object
		}),
		server: PropTypes.string,
		loadingServer: PropTypes.bool,
		appState: PropTypes.string,
		StoreLastMessage: PropTypes.bool,
		connected: PropTypes.bool,
		isMasterDetail: PropTypes.bool,
		width: PropTypes.number,
		insets: PropTypes.object,
		theme: PropTypes.string
	};

	constructor(props) {
		super(props);
		this.gotSubscriptions = false;
		this.animated = false;
		this.count = 0;
		this.state = {
			searching: false,
			search: [],
			loading: true,
			chatsUpdate: [],
			chats: [],
			item: {},
			showNewGroupModal: false,
			userSearch: [],
		};
		//this.setHeader();
	}

	componentDidMount() {
		const {
			navigation, appState
		} = this.props;

		/**
		 * - When didMount is triggered and appState is foreground,
		 * it means the user is logging in and selectServer has ran, so we can getSubscriptions
		 *
		 * - When didMount is triggered and appState is background,
		 * it means the user has resumed the app, so selectServer needs to be triggered,
		 * which is going to change server and getSubscriptions will be triggered by componentWillReceiveProps
		 */
		if (appState === 'foreground') {
			this.getSubscriptions();
		}

		if (isTablet) {
			EventEmitter.addEventListener(KEY_COMMAND, this.handleCommands);
		}
		this.unsubscribeFocus = navigation.addListener('focus', () => {
			Orientation.unlockAllOrientations();
			this.animated = true;
			// Check if there were changes while not focused (it's set on sCU)
			if (this.shouldUpdate) {
				this.forceUpdate();
				this.shouldUpdate = false;
			}
		});
		this.unsubscribeBlur = navigation.addListener('blur', () => {
			this.animated = false;
			this.cancelSearch();
			if (this.backHandler && this.backHandler.remove) {
				this.backHandler.remove();
			}
		});
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		const { loadingServer, searchText, server } = this.props;

		if (nextProps.server && loadingServer !== nextProps.loadingServer) {
			if (nextProps.loadingServer) {
				this.setState({ loading: true });
			} else {
				this.getSubscriptions();
			}
		}
		if (server && server !== nextProps.server) {
			this.gotSubscriptions = false;
		}
	}

	componentDidUpdate(prevProps) {
		const {
			insets
		} = this.props;
		const { item } = this.state;

		// // Update current item in case of another action triggers an update on rooms reducer
		// if (isMasterDetail && item?.rid !== rooms[0] && !isEqual(rooms, prevProps.rooms)) {
		// 	// eslint-disable-next-line react/no-did-update-set-state
		// 	this.setState({ item: { rid: rooms[0] } });
		// }
		// if (insets.left !== prevProps.insets.left || insets.right !== prevProps.insets.right) {
		// 	this.setHeader();
		// }
	}

	// setHeader = () => {
	// 	const { navigation } = this.props;
	// 	const options = this.getHeader();
	// 	navigation.setOptions(options);
	// }

	internalSetState = (...args) => {
		if (this.animated) {
			animateNextTransition();
		}
		this.setState(...args);
	};

	addRoomsGroup = (data, header, allData) => {
		if (data.length > 0) {
			if (header) {
				allData.push({ rid: header, separator: true });
			}
			allData = allData.concat(data);
		}
		return allData;
	}

	getSubscriptions = async() => {
		this.unsubscribeQuery();

		const {
			sortBy,
			showUnread,
			showFavorites,
			groupByType,
			user
		} = this.props;

		const db = database.active;
		let observable;

		const defaultWhereClause = [
			Q.where('archived', false),
			Q.where('open', true),
			Q.or(
				Q.where('t', 'c'),
				Q.where('t', 'p')
			),
			Q.where('prid', null)
		];

		if (sortBy === 'alphabetical') {
			defaultWhereClause.push(Q.experimentalSortBy(`${ this.useRealName ? 'fname' : 'name' }`, Q.asc));
		} else {
			defaultWhereClause.push(Q.experimentalSortBy('room_updated_at', Q.desc));
		}

		// When we're grouping by something
		if (this.isGrouping) {
			observable = await db.collections
				.get('subscriptions')
				.query(...defaultWhereClause)
				.observeWithColumns(['alert']);

			// When we're NOT grouping
		} else {
			this.count += QUERY_SIZE;
			observable = await db.collections
				.get('subscriptions')
				.query(
					...defaultWhereClause,
					Q.experimentalSkip(0),
					Q.experimentalTake(this.count)
				)
				.observe();
		}

		this.querySubscription = observable.subscribe((data) => {
			let tempChats = [];
			let chats = data;

			let chatsUpdate = [];
			if (showUnread) {
				/**
				 * If unread on top, we trigger re-render based on order changes and sub.alert
				 * RoomItem handles its own re-render
				 */
				chatsUpdate = data.map(item => ({ rid: item.rid, alert: item.alert }));
			} else {
				/**
				 * Otherwise, we trigger re-render only when chats order changes
				 * RoomItem handles its own re-render
				 */
				chatsUpdate = data.map(item => item.rid);
			}

			const isOmnichannelAgent = user?.roles?.includes('livechat-agent');
			if (isOmnichannelAgent) {
				const omnichannel = chats.filter(s => filterIsOmnichannel(s));
				chats = chats.filter(s => !filterIsOmnichannel(s));
				tempChats = this.addRoomsGroup(omnichannel, OMNICHANNEL_HEADER, tempChats);
			}

			// unread
			if (showUnread) {
				const unread = chats.filter(s => filterIsUnread(s));
				chats = chats.filter(s => !filterIsUnread(s));
				tempChats = this.addRoomsGroup(unread, UNREAD_HEADER, tempChats);
			}

			// favorites
			if (showFavorites) {
				const favorites = chats.filter(s => filterIsFavorite(s));
				chats = chats.filter(s => !filterIsFavorite(s));
				tempChats = this.addRoomsGroup(favorites, FAVORITES_HEADER, tempChats);
			}

			// type
			if (groupByType) {
				const discussions = chats.filter(s => s.prid);
				const channels = chats.filter(s => s.t === 'c' && !s.prid);
				const privateGroup = chats.filter(s => s.t === 'p' && !s.prid);
				const direct = chats.filter(s => s.t === 'd' && !s.prid);
				tempChats = this.addRoomsGroup(discussions, DISCUSSIONS_HEADER, tempChats);
				tempChats = this.addRoomsGroup(channels, CHANNELS_HEADER, tempChats);
				tempChats = this.addRoomsGroup(privateGroup, GROUPS_HEADER, tempChats);
				tempChats = this.addRoomsGroup(direct, DM_HEADER, tempChats);
			} else if (showUnread || showFavorites || isOmnichannelAgent) {
				tempChats = this.addRoomsGroup(chats, CHATS_HEADER, tempChats);
			} else {
				tempChats = chats;
			}

			this.internalSetState({
				chats: tempChats,
				chatsUpdate,
				loading: false
			});
		});
	}

	unsubscribeQuery = () => {
		if (this.querySubscription && this.querySubscription.unsubscribe) {
			this.querySubscription.unsubscribe();
		}
	}

	cancelSearch = () => {
		const { searching } = this.state;

		if (!searching) {
			return;
		}

		Keyboard.dismiss();

		this.setState({ searching: false, search: [] }, () => {
			//this.setHeader();
			this.inputRef.clear();
			setTimeout(() => {
				this.scrollToTop();
			}, 200);
		});
	};

	getHeader = () => {
		const { searching } = this.state;
		const { insets } = this.props;
		const headerTitlePosition = getHeaderTitlePosition({ insets, numIconsRight: 3 });
		return {
			headerTitleAlign: 'left',
			headerLeft: () => (
				<HeaderButton.Container left>
					<HeaderButton.Item
						iconName='md-home'
						vector={ 'Ionicons' }
					/>
					<HeaderButton.Item
						title={I18n.t('Home')}
						titleStyle={sharedStyles.headerTitle}
					/>
				</HeaderButton.Container>
			),
			title: '',
			headerTitleContainerStyle: {
				left: headerTitlePosition.left,
				right: headerTitlePosition.right
			},
			headerRight: () => (searching ? null : (
				<HeaderButton.Container>
					<HeaderButton.Item
						iconName='plus-circle'
						vector={ 'MaterialCommunityIcons' }
						onPress={this.goToCreateNewGroup}
					/>
				</HeaderButton.Container>
			))
		};
	}

	renderHeader = () => {
		const options = this.getHeader();
		return (
			<Header
				{...options}
			/>
		);
	}

	goRoom = ({ item, isMasterDetail }) => {
		logEvent(events.RL_GO_ROOM);
		const { item: currentItem } = this.state;
		const { rooms } = this.props;
		if (currentItem?.rid === item.rid || rooms?.includes(item.rid)) {
			return;
		}
		// Only mark room as focused when in master detail layout
		if (isMasterDetail) {
			this.setState({ item });
		}
		goRoom({ item, isMasterDetail });
	}

	// eslint-disable-next-line react/sort-comp
	search = debounce(async(text) => {
		this.setState({searching: text.length > 0 });
		let result = await RocketChat.search({ text });
		result = result.filter(item => item.t !== 'd' && !item.prid);

		console.log('search', result);
		// if the search was cancelled before the promise is resolved
		const { searching } = this.state;
		if (!searching) {
			return;
		}
		this.internalSetState({
			search: result,
			searching: true
		});
		this.scrollToTop();
	}, 300);

	getRoomTitle = item => RocketChat.getRoomTitle(item)

	getRoomAvatar = item => RocketChat.getRoomAvatar(item)

	isGroupChat = item => RocketChat.isGroupChat(item)

	isRead = item => RocketChat.isRead(item)

	getUserPresence = uid => RocketChat.getUserPresence(uid)

	getUidDirectMessage = room => RocketChat.getUidDirectMessage(room);

	onPressItem = (item = {}) => {
		const { navigation, isMasterDetail } = this.props;
		if (!navigation.isFocused()) {
			return;
		}

		this.cancelSearch();
		this.goRoom({ item, isMasterDetail });
	};

	renderSearchBar = () => {
		return(
			<UserSearchBox
				testID='rooms-list-view-search'
				key='rooms-list-view-search'
			/>
		);
	};

	scrollToTop = () => {
		if (this.scroll?.scrollToOffset) {
			this.scroll.scrollToOffset({ offset: 0 });
		}
	}

	searchSubmit = (event) => {
		Keyboard.dismiss();
		this.search(event.nativeEvent.text);
	}

	toggleFav = async(rid, favorite) => {
		logEvent(favorite ? events.RL_UNFAVORITE_CHANNEL : events.RL_FAVORITE_CHANNEL);
		try {
			const db = database.active;
			const result = await RocketChat.toggleFavorite(rid, !favorite);
			if (result.success) {
				const subCollection = db.collections.get('subscriptions');
				await db.action(async() => {
					try {
						const subRecord = await subCollection.find(rid);
						await subRecord.update((sub) => {
							sub.f = !favorite;
						});
					} catch (e) {
						log(e);
					}
				});
			}
		} catch (e) {
			logEvent(events.RL_TOGGLE_FAVORITE_FAIL);
			log(e);
		}
	};

	toggleRead = async(rid, isRead) => {
		logEvent(isRead ? events.RL_UNREAD_CHANNEL : events.RL_READ_CHANNEL);
		try {
			const db = database.active;
			const result = await RocketChat.toggleRead(isRead, rid);
			if (result.success) {
				const subCollection = db.collections.get('subscriptions');
				await db.action(async() => {
					try {
						const subRecord = await subCollection.find(rid);
						await subRecord.update((sub) => {
							sub.alert = isRead;
						});
					} catch (e) {
						log(e);
					}
				});
			}
		} catch (e) {
			logEvent(events.RL_TOGGLE_READ_F);
			log(e);
		}
	};

	hideChannel = async(rid, type) => {
		logEvent(events.RL_HIDE_CHANNEL);
		try {
			const db = database.active;
			const result = await RocketChat.hideRoom(rid, type);
			if (result.success) {
				const subCollection = db.collections.get('subscriptions');
				await db.action(async() => {
					try {
						const subRecord = await subCollection.find(rid);
						await subRecord.destroyPermanently();
					} catch (e) {
						log(e);
					}
				});
			}
		} catch (e) {
			logEvent(events.RL_HIDE_CHANNEL_F);
			log(e);
		}
	};

	goToCreateNewGroup = () => {
		const { navigation } = this.props;
		navigation.navigate('NewMessageStackNavigator', { screen: 'NewMessageView' });
	};

	renderSectionHeader = (header) => {
		const { theme } = this.props;
		return (
			<View style={[styles.groupTitleContainer, { backgroundColor: themes[theme].backgroundColor }]}>
				<Text style={[styles.groupTitle, { color: themes[theme].controlText }]}>{I18n.t(header)}</Text>
			</View>
		);
	}

	renderItem = ({ item }) => {
		if (item.separator) {
			return this.renderSectionHeader(item.rid);
		}

		const { item: currentItem } = this.state;
		const {
			user: { username },
			StoreLastMessage,
			useRealName,
			theme,
			isMasterDetail,
			width
		} = this.props;
		const id = this.getUidDirectMessage(item);

		return (
			<RoomItem
				item={item}
				theme={theme}
				id={id}
				type={item.t}
				username={username}
				showLastMessage={StoreLastMessage}
				onPress={this.onPressItem}
				testID={`groups-list-view-item-${ item.name }`}
				width={isMasterDetail ? MAX_SIDEBAR_WIDTH : width}
				toggleFav={this.toggleFav}
				toggleRead={this.toggleRead}
				hideChannel={this.hideChannel}
				useRealName={useRealName}
				getUserPresence={this.getUserPresence}
				getRoomTitle={this.getRoomTitle}
				getRoomAvatar={this.getRoomAvatar}
				getIsGroupChat={this.isGroupChat}
				getIsRead={this.isRead}
				visitor={item.visitor}
				isFocused={currentItem?.rid === item.rid}
			/>
		);
	};

	renderScroll = () => {
		const {
			loading, chats, search, searching
		} = this.state;
		const { theme, refreshing } = this.props;

		if (loading) {
			return <ActivityIndicator theme={theme} />;
		}

		return (
			<FlatList
				ref={this.getScrollRef}
				data={searching ? search : chats}
				extraData={searching ? search : chats}
				keyExtractor={keyExtractor}
				style={[styles.list, { backgroundColor: themes[theme].backgroundColor }]}
				renderItem={this.renderItem}
				getItemLayout={getItemLayout}
				removeClippedSubviews={isIOS}
				keyboardShouldPersistTaps='always'
				initialNumToRender={INITIAL_NUM_TO_RENDER}
				refreshControl={(
					<RefreshControl
						refreshing={refreshing}
						onRefresh={this.onRefresh}
						tintColor={themes[theme].auxiliaryText}
					/>
				)}
				windowSize={9}
				onEndReached={this.onEndReached}
				onEndReachedThreshold={0.5}
			/>
		);
	};

	render = () => {
		console.count(`${ this.constructor.name }.render calls`);
		const { theme } = this.props;

		return (
			<SafeAreaView testID='groups-list-view' style={{ backgroundColor: themes[theme].backgroundColor }}>
				<StatusBar />
				{this.renderSearchBar()}
				{this.renderHeader()}
				{this.renderScroll()}
			</SafeAreaView>
		);
	};
}

const mapStateToProps = state => ({
	user: getUserSelector(state),
	isMasterDetail: state.app.isMasterDetail,
	server: state.server.server,
	connected: state.server.connected,
	loadingServer: state.server.loading,
	refreshing: state.rooms.refreshing,
	appState: state.app.ready && state.app.foreground ? 'foreground' : 'background',
	StoreLastMessage: state.settings.Store_Last_Message,
});

export default connect(mapStateToProps, null) (withDimensions(withTheme(withSafeAreaInsets(HomeView))));
