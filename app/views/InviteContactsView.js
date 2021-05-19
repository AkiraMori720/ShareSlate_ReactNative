import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
	View, Text, ScrollView, StyleSheet, FlatList, Alert
} from 'react-native';

import TextInput from '../presentation/TextInput';
import Loading from '../containers/Loading';
import sharedStyles from './Styles';
import KeyboardView from '../presentation/KeyboardView';
import scrollPersistTaps from '../utils/scrollPersistTaps';
import I18n from '../i18n';
import StatusBar from '../containers/StatusBar';
import { themes } from '../constants/colors';
import { withTheme } from '../theme';
import { getUserSelector } from '../selectors/login';
import SafeAreaView from '../containers/SafeAreaView';
import ContactItem from '../presentation/ContactItem';
import Button from '../containers/Button';
import RocketChat from '../lib/rocketchat';

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	list: {
		width: '100%'
	},
	separator: {
		marginLeft: 60
	},
	formSeparator: {
		marginLeft: 15
	},
	messageTitle: {
		marginHorizontal: 15,
		fontSize: 18,
		...sharedStyles.textSemibold,
		lineHeight: 41
	},
	input: {
		height: 160,
		textAlignVertical: 'top',
		paddingHorizontal: 18,
		fontSize: 17,
		...sharedStyles.textRegular
	},
	switchContainer: {
		height: 54,
		alignItems: 'center',
		justifyContent: 'space-between',
		flexDirection: 'row',
		paddingHorizontal: 18
	},
	label: {
		fontSize: 17,
		...sharedStyles.textMedium
	},
	invitedHeader: {
		marginTop: 18,
		marginHorizontal: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	invitedTitle: {
		fontSize: 18,
		...sharedStyles.textSemibold,
		lineHeight: 41
	},
	invitedCount: {
		fontSize: 14,
		...sharedStyles.textRegular
	},
	buttonContainer: {
		marginTop: 16,
		paddingHorizontal: 24
	}
});

class InviteContactsView extends React.Component {
	static navigationOptions = () => ({
		title: I18n.t('Invite')
	});

	static propTypes = {
		navigation: PropTypes.object,
		baseUrl: PropTypes.string,
		user: PropTypes.shape({
			id: PropTypes.string,
			token: PropTypes.string
		}),
		theme: PropTypes.string
	};

	constructor(props) {
		super(props);
		let contacts = props.route.params?.contacts;

		this.state = {
			message: '',
			contacts,
			inviting: false
		}
	}


	shouldComponentUpdate(nextProps, nextState) {
		const {
			message, inviting
		} = this.state;
		const {
			theme
		} = this.props;
		if (nextProps.theme !== theme) {
			return true;
		}
		if (nextState.message !== message) {
			return true;
		}
		return nextState.inviting !== inviting;
	}


	onChangeText = (message) => {
		this.setState({ message });
	}

	submit = async () => {
		const {
			contacts, message
		} = this.state;
		const {
			navigation
		} = this.props;

		if (!message.trim()) {
			return;
		}
		this.setState({ inviting: true });
		const emails = contacts.map(contact => contact.emailAddresses[0].email);
		try{
			await RocketChat.inviteByEmails(emails, message);
			Alert.alert( I18n.t('Invalid_success'));
			navigation.navigate('ContactsListView');
		} catch (e) {
			Alert.alert(I18n.t('Oops'), I18n.t('Invite_failed'));
		}
		this.setState({ inviting: false });
	}


	renderSeparator = () => <View style={[sharedStyles.separator, styles.separator]} />

	renderItem = ({ item }) => {
		const { theme } = this.props;

		return (
			<ContactItem
				contact={item}
				onPress={() => {}}
				testID={`select-contacts-view-item-${ item.rawContactId }`}
				theme={theme}
			/>
		);
	}

	renderInvitedList = () => {
		const { theme } = this.props;
		const { contacts } = this.state;
		console.log('renderItem', contacts);

		return (
			<FlatList
				data={contacts}
				extraData={contacts}
				keyExtractor={item => item.rawContactId}
				style={[
					styles.list,
					sharedStyles.separatorVertical,
					{
						backgroundColor: themes[theme].focusedBackground,
						borderColor: themes[theme].separatorColor
					}
				]}
				renderItem={this.renderItem}
				ItemSeparatorComponent={this.renderSeparator}
				enableEmptySections
				keyboardShouldPersistTaps='always'
			/>
		);
	}

	render() {
		const { message, contacts, inviting } = this.state;
		const { theme } = this.props;
		const count = contacts.length;

		return (
			<KeyboardView
				style={{ backgroundColor: themes[theme].auxiliaryBackground }}
				contentContainerStyle={[sharedStyles.container, styles.container]}
				keyboardVerticalOffset={128}
			>
				<StatusBar />
				<SafeAreaView testID='create-channel-view'>
					<ScrollView {...scrollPersistTaps}>
						<View style={[sharedStyles.separatorVertical, { borderColor: themes[theme].separatorColor }]}>
							<Text style={[styles.messageTitle, { color: themes[theme].titleText }]}>{I18n.t('Invite_Message')}</Text>
							<TextInput
								autoFocus
								style={[styles.input, { backgroundColor: themes[theme].backgroundColor }]}
								label={I18n.t('Message')}
								value={message}
								onChangeText={this.onChangeText}
								placeholder={I18n.t('Message')}
								returnKeyType='done'
								testID='invite_message'
								autoCorrect={true}
								autoCapitalize='none'
								theme={theme}
								underlineColorAndroid='transparent'
								multiline={true}
								numberOfLines={12}
							/>
						</View>
						<View style={styles.invitedHeader}>
							<Text style={[styles.invitedTitle, { color: themes[theme].titleText }]}>{I18n.t('Invite')}</Text>
							<Text style={[styles.invitedCount, { color: themes[theme].auxiliaryText }]}>{count === 1 ? I18n.t('1_contact') : I18n.t('N_contacts', { n: count })}</Text>
						</View>
						{this.renderInvitedList()}
						<View style={styles.buttonContainer}>
							<Button
								title={I18n.t('Invite')}
								type='primary'
								onPress={this.submit}
								loading={inviting}
								theme={theme}
							/>
						</View>
					</ScrollView>
				</SafeAreaView>
			</KeyboardView>
		);
	}
}

const mapStateToProps = state => ({
	baseUrl: state.server.server,
	user: getUserSelector(state)
});

export default connect(mapStateToProps, null)(withTheme(InviteContactsView));
