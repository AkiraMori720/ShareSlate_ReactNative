import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, FlatList, Keyboard, Text } from 'react-native';
import { connect } from 'react-redux';
import equal from 'deep-equal';
import { orderBy } from 'lodash';
import { Q } from '@nozbe/watermelondb';

import database from '../lib/database';
import RocketChat from '../lib/rocketchat';
import UserItem from '../presentation/UserItem';
import Loading from '../containers/Loading';
import I18n from '../i18n';
import log, { logEvent, events } from '../utils/log';
import SearchBox from '../containers/SearchBox';
import sharedStyles from './Styles';
import * as HeaderButton from '../containers/HeaderButton';
import StatusBar from '../containers/StatusBar';
import { themes } from '../constants/colors';
import { animateNextTransition } from '../utils/layoutAnimation';
import { withTheme } from '../theme';
import { getUserSelector } from '../selectors/login';
import SafeAreaView from '../containers/SafeAreaView';
import ContactItem from '../presentation/ContactItem';
import debounce from '../utils/debounce';

const styles = StyleSheet.create({
	separator: {
		marginLeft: 60
	},
	groupTitleContainer: {
		paddingHorizontal: 12,
		paddingTop: 17,
		paddingBottom: 10
	},
	groupTitle: {
		fontSize: 16,
		letterSpacing: 0.27,
		flex: 1,
		lineHeight: 24,
		...sharedStyles.textBold
	}
});

class SelectedContactsView extends React.Component {
	static propTypes = {
		baseUrl: PropTypes.string,
		user: PropTypes.shape({
			id: PropTypes.string,
			token: PropTypes.string,
			username: PropTypes.string,
			name: PropTypes.string
		}),
		navigation: PropTypes.object,
		route: PropTypes.object,
		contacts: PropTypes.func,
		theme: PropTypes.string
	};

	constructor(props) {
		super(props);

		this.state = {
			renderContacts: [],
			selectContacts: [],
			search: [],
			searchText: ''
		};

		this.setHeader(props.route.params?.showButton);
		setTimeout(() => this.init(), 100);
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { search, renderContacts, selectContacts, searchText } = this.state;
		const { contacts, loading, theme } = this.props;
		if (nextProps.theme !== theme) {
			return true;
		}
		if (nextProps.loading !== loading) {
			return true;
		}
		if (!equal(nextProps.contacts, contacts)){
			return true;
		}
		if (!equal(nextState.search, search)) {
			return true;
		}
		if (!equal(nextState.renderContacts, renderContacts)){
			return true;
		}
		if (!equal(nextState.selectContacts, selectContacts)){
			return true;
		}
		if (nextState.searchText !== searchText){
			return true;
		}
		return false;
	}

	componentDidUpdate(prevProps, prevStates) {
		const { selectContacts } = this.state;
		const { contacts } = this.props;
		if (prevStates.selectContacts.length !== selectContacts.length) {
			this.setHeader(selectContacts.length > 0);
		}
		if (!equal(prevProps.contacts !== contacts)){
			this.init();
		}
	}

	// showButton can be sent as route params or updated by the component
	setHeader = (showButton) => {
		const { navigation, route } = this.props;
		const title = route.params?.title ?? I18n.t('Select_Contacts');
		const buttonText = route.params?.buttonText ?? I18n.t('Next');
		const options = {
			title,
			headerRight: () => (
				(showButton) && (
					<HeaderButton.Container>
						<HeaderButton.Item title={buttonText} onPress={this.onInviteNext} testID='selected-contacts-view-submit' />
					</HeaderButton.Container>
				)
			)
		};
		navigation.setOptions(options);
	}

	init = () => {
		let { contacts } = this.props;
		let renderContacts = [];
		if(contacts){
			let firstCharacter = null
			contacts.forEach(contact => {
				const groupCharater = contact.displayName[0];
				if(firstCharacter !== groupCharater){
					firstCharacter = groupCharater;
					renderContacts.push({ header: groupCharater, separator: true });
				}
				renderContacts.push(contact);
			})
		}
		this.setState({renderContacts});
	}

	search = debounce(async(text) => {
		const { renderContacts } = this.state;
		if (text === "" || text === null) {
			this.setState({
				search: [],
				searchText: ''
			});
		} else if(renderContacts && renderContacts.length){
			const search = renderContacts.filter(contact => !contact.separator && (contact.phoneNumbers.find(number => number.number.includes(text)) ||
				contact.emailAddresses.find(address => address.email.includes(text))));
			this.setState({
				search, searchText: text
			});
			this.scrollToTop();
		}
	}, 300);

	scrollToTop = () => {
		if (this.scroll?.scrollToOffset) {
			this.scroll.scrollToOffset({ offset: 0 });
		}
	}

	isChecked = (id) => {
		const { selectContacts } = this.state;
		return selectContacts.findIndex(el => el.rawContactId === id) !== -1;
	}

	toggleContact = (contact) => {
		const { selectContacts } = this.state;

		animateNextTransition();
		if (!this.isChecked(contact.rawContactId)) {
			this.setState({selectContacts: [...selectContacts, contact]})
		} else {
			this.setState({selectContacts: selectContacts.filter(item => item.rawContactId !== contact.rawContactId) });
		}
	}

	onInviteNext = () => {
		const { navigation } = this.props;
		const { selectContacts } = this.state;

		navigation.navigate('InviteContactsView', { contacts : selectContacts });
	}

	_onPressItem = (item = {}) => {
		this.toggleContact(item);
	}

	_onPressSelectedItem = item => this.toggleContact(item);

	renderHeader = () => {
		const { theme } = this.props;
		return (
			<View style={{ backgroundColor: themes[theme].backgroundColor }}>
				<SearchBox onChangeText={this.search} onSubmitEditing={this.searchSubmit} testID='select-contacts-view-search' />
				{this.renderSelected()}
			</View>
		);
	}

	searchSubmit = (event) => {
		Keyboard.dismiss();
		this.search(event.nativeEvent.text);
	}

	renderSelected = () => {
		const { theme } = this.props;
		const { selectContacts } = this.state;

		if (selectContacts.length === 0) {
			return null;
		}
		return (
			<FlatList
				data={selectContacts}
				keyExtractor={item => item.rawContactId}
				style={[sharedStyles.separatorTop, { borderColor: themes[theme].separatorColor }]}
				contentContainerStyle={{ marginVertical: 5 }}
				renderItem={this.renderSelectedItem}
				enableEmptySections
				keyboardShouldPersistTaps='always'
				horizontal
			/>
		);
	}

	renderSelectedItem = ({ item }) => {
		const { theme } = this.props;
		return (
			<ContactItem
				contact={item}
				onPress={() => this._onPressSelectedItem(item)}
				testID={`selected-contact-${ item.rawContactId }`}
				style={{ paddingRight: 15 }}
				theme={theme}
			/>
		);
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

	renderItem = ({ item, index }) => {
		if (item.separator) {
			return this.renderSectionHeader(item.header);
		}

		const { search, renderContacts } = this.state;
		const { theme } = this.props;

		let style = { borderColor: themes[theme].separatorColor };
		if (index === 0) {
			style = { ...style, ...sharedStyles.separatorTop };
		}
		if (search.length > 0 && index === search.length - 1) {
			style = { ...style, ...sharedStyles.separatorBottom };
		}
		if (search.length === 0 && index === renderContacts.length - 1) {
			style = { ...style, ...sharedStyles.separatorBottom };
		}
		return (
			<ContactItem
				contact={item}
				onPress={() => this._onPressItem(item)}
				testID={`select-contacts-view-item-${ item.rawContactId }`}
				icon={this.isChecked(item.rawContactId) ? 'check' : null}
				style={style}
				theme={theme}
			/>
		);
	}

	renderList = () => {
		const { search, renderContacts, searchText } = this.state;
		const { theme } = this.props;

		const data = (searchText && searchText.length > 0) ? search : renderContacts;

		console.log('select contact data', data, renderContacts, searchText);
		return (
			<FlatList
				ref={(r) => this.scroll = r}
				data={data}
				extraData={this.props}
				keyExtractor={item => item.rawContactId}
				renderItem={this.renderItem}
				ItemSeparatorComponent={this.renderSeparator}
				ListHeaderComponent={this.renderHeader}
				contentContainerStyle={{ backgroundColor: themes[theme].backgroundColor }}
				enableEmptySections
				keyboardShouldPersistTaps='always'
			/>
		);
	}

	render = () => {
		return (
			<SafeAreaView testID='select-contacts-view'>
				<StatusBar />
				{this.renderList()}
			</SafeAreaView>
		);
	}
}

const mapStateToProps = state => ({
	baseUrl: state.server.server,
	user: getUserSelector(state),
	contacts: state.contacts.contacts
});

export default connect(mapStateToProps, null)(withTheme(SelectedContactsView));
