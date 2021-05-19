import React from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView, Image, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import KeyboardView from '../../presentation/KeyboardView';
import sharedStyles from '../Styles';
import styles from './styles';
import scrollPersistTaps from '../../utils/scrollPersistTaps';
import I18n from '../../i18n';
import Button from '../../containers/Button';
import { logout as logoutAction, setUser as setUserAction } from '../../actions/login';
import * as HeaderButton from '../../containers/HeaderButton';
import StatusBar from '../../containers/StatusBar';
import { STATUS_COLORS, themes } from '../../constants/colors';
import { withTheme } from '../../theme';
import { getShareUserSelector, getUserSelector } from '../../selectors/login';
import SafeAreaView from '../../containers/SafeAreaView';
import TextInput from '../../containers/TextInput';
import { EDIT_PROFILE_URL } from '../../constants/links';
import openLink from '../../utils/openLink';
import { showConfirmationAlert } from '../../utils/info';
import database from '../../lib/database';
import CookieManager from '@react-native-community/cookies';
import ShareSlate from '../../lib/shareslate';

class ProfileView extends React.Component {
	static navigationOptions = ({ navigation, isMasterDetail }) => ({
		headerLeft: () => (
			<HeaderButton.Drawer navigation={navigation}
									  testID='profile-view-drawer'/>
		),
		headerTitleAlign: 'left',
		title: I18n.t('Profile'),
		headerRight: () => (
			<HeaderButton.Preferences onPress={ () => navigation.navigate('UserPreferencesView') }
									  testID='preferences-view-open'/>
		)
	});

	static propTypes = {
		baseUrl: PropTypes.string,
		user: PropTypes.object,
		shareUser: PropTypes.object,
		theme: PropTypes.string
	}

	state = {
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (!isEqual(nextState, this.state)) {
			return true;
		}
		if (!isEqual(nextProps, this.props)) {
			return true;
		}
		return false;
	}

	logout = () => {
		showConfirmationAlert({
			message: I18n.t('You_will_be_logged_out_of_this_application'),
			confirmationText: I18n.t('Logout'),
			onPress: this.checkCookiesAndLogout
		});
	}

	checkCookiesAndLogout = async() => {
		const { logout, user } = this.props;
		const db = database.servers;
		const usersCollection = db.collections.get('users');
		try {
			const userRecord = await usersCollection.find(user.id);
			if (!userRecord.loginEmailPassword) {
				showConfirmationAlert({
					title: I18n.t('Clear_cookies_alert'),
					message: I18n.t('Clear_cookies_desc'),
					confirmationText: I18n.t('Clear_cookies_yes'),
					dismissText: I18n.t('Clear_cookies_no'),
					onPress: async() => {
						await CookieManager.clearAll(true);
						logout();
					},
					onCancel: () => {
						logout();
					}
				});
			} else {
				logout();
			}
		} catch {
			// Do nothing: user not found
		}
	}

	onEditProfile = () => {
		openLink(EDIT_PROFILE_URL);
	}

	render() {
		const {
			user, shareUser, theme
		} = this.props;

		const fullName = ShareSlate.getFullName(shareUser);
		const location = ShareSlate.getLocation(shareUser);

		return (
			<KeyboardView
				style={{ backgroundColor: themes[theme].auxiliaryBackground }}
				contentContainerStyle={sharedStyles.container}
				keyboardVerticalOffset={128}
			>
				<StatusBar />
				<SafeAreaView testID='profile-view'>
					<ScrollView
						contentContainerStyle={sharedStyles.containerScrollView}
						testID='profile-view-list'
						{...scrollPersistTaps}
					>
						<View style={styles.avatarContainer} testID='profile-view-avatar'>
							<TouchableOpacity onPress={this.onEditProfile} style={styles.editProfile}>
								<Image style={styles.profileEditIcon} source={require('../../images/icon_edit.png')}/>
							</TouchableOpacity>
							<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
								<Image style={styles.avatar} source={{ uri: shareUser.profile_img }}/>
								<View style={[styles.status, {backgroundColor: STATUS_COLORS[user.status] ?? STATUS_COLORS.offline}]}/>
							</View>
							<Text style={styles.fname}>{fullName}</Text>
						</View>
						<TextInput
							label='Name'
							required
							value={fullName}
							editable={false}
							containerStyle={styles.inputContainer}
							placeholder={''}
							returnKeyType='next'
							onChangeText={fname => this.setState({ fname })}
							onSubmitEditing={() => {this.lastNameInput.focus();}}
							testID='register-view-firstname'
							theme={theme}
						/>
						<TextInput
							label='Email'
							required
							value={shareUser.email}
							editable={false}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.lastNameInput = e; }}
							placeholder={''}
							returnKeyType='next'
							onChangeText={lname => this.setState({ lname })}
							onSubmitEditing={() => {this.nickNameInput.focus();}}
							testID='register-view-lastname'
							theme={theme}
						/>
						<TextInput
							label='Location'
							value={location}
							editable={false}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.nickNameInput = e; }}
							placeholder={''}
							returnKeyType='next'
							onChangeText={nickname => this.setState({ nickname })}
							onSubmitEditing={() => {this.locationInput.focus();}}
							testID='register-view-nickname'
							theme={theme}
						/>
						<TextInput
							label='Password'
							editable={false}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.locationInput = e; }}
							placeholder={'Sign in to shareslate.com to change your password'}
							returnKeyType='next'
							onChangeText={this.onChangeLocation}
							theme={theme}
						/>
						<Button
							title={I18n.t('Logout')}
							type='primary'
							onPress={this.logout}
							testID='profile-view-submit'
							style={styles.logoutBtn}
							theme={theme}
						/>
					</ScrollView>
				</SafeAreaView>
			</KeyboardView>
		);
	}
}

const mapStateToProps = state => ({
		user: getUserSelector(state),
		shareUser: getShareUserSelector(state),
		baseUrl: state.server.server
});

const mapDispatchToProps = dispatch => ({
	logout: () => dispatch(logoutAction())
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(ProfileView));
