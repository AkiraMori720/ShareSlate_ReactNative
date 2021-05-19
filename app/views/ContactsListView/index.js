import React from 'react';
import { View, Text, Keyboard, FlatList, RefreshControl, PermissionsAndroid } from 'react-native';
import { withTheme } from '../../theme';
import I18n from '../../i18n';
import * as HeaderButton from '../../containers/HeaderButton';
import sharedStyles from '../Styles';
import SafeAreaView from '../../containers/SafeAreaView';
import { themes } from '../../constants/colors';
import StatusBar from '../../containers/StatusBar';
import Header, { getHeaderTitlePosition } from '../../containers/Header';
import { withDimensions } from '../../dimensions';
import { withSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBox from '../../containers/SearchBox';
import debounce from '../../utils/debounce';
import { animateNextTransition } from '../../utils/layoutAnimation';
import { isIOS, isTablet } from '../../utils/deviceInfo';
import EventEmitter from '../../utils/events';
import { KEY_COMMAND } from '../../commands';
import Orientation from 'react-native-orientation-locker';
import PropTypes from 'prop-types';
import equal from 'deep-equal';
import styles from './styles';
import { ROW_HEIGHT } from '../../presentation/RoomItem';
import { getUserSelector } from '../../selectors/login';
import { connect } from 'react-redux';
import Contacts from "react-native-contacts";
import ContactItem from '../../presentation/ContactItem';
import { fetchContacts as fetchContactsAction } from '../../actions/contacts';
import UserSearchBox from '../../containers/UserSearchBox';

const INITIAL_NUM_TO_RENDER = isTablet ? 20 : 12;

const getItemLayout = (data, index) => ({
	length: ROW_HEIGHT,
	offset: ROW_HEIGHT * index,
	index
});

class ContactsListView extends React.Component{
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
		fetchContacts: PropTypes.func,
		isFetching: PropTypes.bool,
		contacts: PropTypes.array,
		contactUsers: PropTypes.array,
		error: PropTypes.object,
		width: PropTypes.number,
		insets: PropTypes.object,
		theme: PropTypes.string
	};

	constructor(props) {
		super(props);
		this.animated = false;
		this.count = 0;
		this.state = {
			searching: false,
			search: [],
			loading: true,
			item: {},
			contactUsers: []
		};
		//this.setHeader();
		setTimeout(() => this.init(), 100);
	}

	componentDidMount() {
		const {
			navigation
		} = this.props;

		/**
		 * - When didMount is triggered and appState is foreground,
		 * it means the user is logging in and selectServer has ran, so we can getSubscriptions
		 *
		 * - When didMount is triggered and appState is background,
		 * it means the user has resumed the app, so selectServer needs to be triggered,
		 * which is going to change server and getSubscriptions will be triggered by componentWillReceiveProps
		 */
		if (Platform.OS === "android") {
			PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
				title: "Contacts",
				message: "This app would like to view your contacts."
			}).then(() => {
				this.loadContacts();
			});
		} else {
			this.loadContacts();
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
		});
		console.timeEnd(`${ this.constructor.name } mount`);
	}


	componentDidUpdate(prevProps) {
		const {
			insets, contactUsers
		} = this.props;

		// // Update current item in case of another action triggers an update on rooms reducer
		// if (isMasterDetail && item?.rid !== rooms[0] && !isEqual(rooms, prevProps.rooms)) {
		// 	// eslint-disable-next-line react/no-did-update-set-state
		// 	this.setState({ item: { rid: rooms[0] } });
		// }
		// if (insets.left !== prevProps.insets.left || insets.right !== prevProps.insets.right) {
		// 	this.setHeader();
		// }
		if(!equal( prevProps.contactUsers, contactUsers)){
			this.init();
		}
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

	init = () => {
		let { contactUsers } = this.props;
		let renderContacts = [];
		if(contactUsers){
			let firstCharacter = null
			contactUsers.forEach(user => {
				const groupCharater = user.contact.displayName[0];
				if(firstCharacter !== groupCharater){
					firstCharacter = groupCharater;
					renderContacts.push({ header: groupCharater, separator: true });
				}
				renderContacts.push(user);
			})
		}
		this.setState({contactUsers: renderContacts});
	}

	loadContacts() {
		const { fetchContacts } = this.props;
		fetchContacts();
	}

	cancelSearch = () => {
		const { searching } = this.state;
		const { closeSearchHeader } = this.props;

		if (!searching) {
			return;
		}

		Keyboard.dismiss();

		this.setState({ searching: false, search: [] }, () => {
			//this.setHeader();
			closeSearchHeader();
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
						iconName='address-book'
						vector={ 'FontAwesome' }
					/>
					<HeaderButton.Item
						title={I18n.t('Contacts')}
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
						iconName='email-send'
						vector={ 'MaterialCommunityIcons' }
						onPress={this.inviteFromContact}
					/>
				</HeaderButton.Container>
			))
		};
	}

	inviteFromContact = () => {
		const { navigation } = this.props;

		navigation.navigate('InviteContactStackNavigator', { screen: 'SelectContactsView'});
	}

	renderHeader = () => {
		const options = this.getHeader();
		return (
			<Header
				{...options}
			/>
		);
	}

	// eslint-disable-next-line react/sort-comp
	search = debounce(async(text) => {
		const { contactUsers } = this.props;
		if (text === "" || text === null) {
			this.loadContacts();
			this.internalSetState({
				searching: false
			});
		} else if(contactUsers && contactUsers.length){
			const search = contactUsers.filter(user => user.username.includes(text) ||
				user.contact.phoneNumbers.find(number => number.number.includes(text)) ||
				user.contact.emailAddresses.find(address => address.email.includes(text)));
			this.internalSetState({
				search,
				searching: true
			});
			this.scrollToTop();
		}
	}, 300);

	onPressItem = (contact = {}) => {
		const { navigation } = this.props;
		if (!navigation.isFocused()) {
			return;
		}

		this.cancelSearch();
		Contacts.openExistingContact(contact)
	};

	renderSearchUserBar = () => {
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

	renderSeparator = () => {
		const { theme } = this.props;
		return <View style={[sharedStyles.separator, styles.separator, { backgroundColor: themes[theme].separatorColor }]} />;
	}

	renderSectionHeader = (header) => {
		const { theme } = this.props;
		return (
			<View style={[styles.groupTitleContainer, { backgroundColor: themes[theme].backgroundColor }]}>
				<Text style={[styles.groupTitle, { color: themes[theme].controlText }]}>{header}</Text>
			</View>
		);
	}

	renderItem = ({ item }) => {
		if (item.separator) {
			return this.renderSectionHeader(item.header);
		}

		const {
			theme,
		} = this.props;

		return (
			<ContactItem
				contact={item.contact}
				onPress={() => this.onPressItem(item.contact)}
				testID={`contacts-list-view-item-${ item.username }`}
				theme={theme}
			/>
		);
	};

	onRefresh = () => {
		this.loadContacts();
	}

	renderScroll = () => {
		const {
			search, searching, contactUsers
		} = this.state;
		const { theme, isFetching } = this.props;

		return (
			<FlatList
				ref={(r) => this.scroll = r}
				data={searching ? search : contactUsers}
				extraData={searching ? search : contactUsers}
				keyExtractor={item => item._id}
				style={[styles.list, { backgroundColor: themes[theme].backgroundColor }]}
				renderItem={this.renderItem}
				ItemSeparatorComponent={this.renderSeparator}
				getItemLayout={getItemLayout}
				removeClippedSubviews={isIOS}
				keyboardShouldPersistTaps='always'
				initialNumToRender={INITIAL_NUM_TO_RENDER}
				refreshControl={(
					<RefreshControl
						refreshing={isFetching}
						onRefresh={this.onRefresh}
						tintColor={themes[theme].auxiliaryText}
					/>
				)}
				windowSize={9}
				onEndReachedThreshold={0.5}
			/>
		);
	};

	render = () => {
		console.count(`${ this.constructor.name }.render calls`);
		const { theme } = this.props;

		return (
			<SafeAreaView testID='contacts-list-view' style={{ backgroundColor: themes[theme].backgroundColor }}>
				<StatusBar />
				{this.renderSearchUserBar()}
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
	isFetching: state.contacts.isFetching,
	contacts: state.contacts.contacts,
	contactUsers: state.contacts.users,
	error: state.contacts.error
});

const mapDispatchToProps = dispatch => ({
	fetchContacts: () => dispatch(fetchContactsAction())
});

export default connect(mapStateToProps, mapDispatchToProps) (withDimensions(withTheme(withSafeAreaInsets(ContactsListView))));
