import React from 'react';
import PropTypes from 'prop-types';
import {
	Text, View, StyleSheet, Keyboard, Alert, Image, TouchableOpacity, Linking
} from 'react-native';
import { connect } from 'react-redux';
import equal from 'deep-equal';

import sharedStyles from './Styles';
import Button from '../containers/Button';
import I18n from '../i18n';
import { themes } from '../constants/colors';
import { withTheme } from '../theme';
import FormContainer, { FormContainerInner } from '../containers/FormContainer';
import TextInput from '../containers/TextInput';
import { loginRequest as loginRequestAction } from '../actions/login';
import LoginServices from '../containers/LoginServices';
import { SIGN_IN_URL, SIGN_UP_URL } from '../constants/links';
import { showConfirmationAlert } from '../utils/info';
import CookieManager from '@react-native-community/cookies';
import openLink from '../utils/openLink';

const styles = StyleSheet.create({
	registerDisabled: {
		...sharedStyles.textRegular,
		...sharedStyles.textAlignCenter,
		fontSize: 16
	},
	logoContainer: {
		marginHorizontal: 24
	},
	logoImage: {
		resizeMode: 'contain',
		width: '100%',
		height: 160
	},
	logoBottom: {
		resizeMode: 'contain',
		width: '100%',
		height: 40
	},
	title: {
		...sharedStyles.textBold,
		marginBottom: 16,
		fontSize: 22
	},
	formContainer: {
		flexGrow: 1,
		borderRadius: 8,
		marginTop: 12,
		paddingTop: 8,
		paddingHorizontal: 24
	},
	inputContainer: {
		marginVertical: 16
	},
	bottomContainer: {
		flexDirection: 'row',
		alignSelf: 'center',
		marginTop: 12,
		marginBottom: 32
	},
	bottomContainerText: {
		...sharedStyles.textRegular,
		fontSize: 13
	},
	bottomContainerTextBold: {
		...sharedStyles.textSemibold,
		fontSize: 13
	},
	loginButton: {
		alignSelf: 'center',
		backgroundColor: '#59ADFF',
		borderRadius: 16,
		marginTop: 16,
		width: 120
	}
});

class LoginView extends React.Component {

	static propTypes = {
		navigation: PropTypes.object,
		route: PropTypes.object,
		Site_Name: PropTypes.string,
		Accounts_RegistrationForm: PropTypes.string,
		Accounts_RegistrationForm_LinkReplacementText: PropTypes.string,
		Accounts_EmailOrUsernamePlaceholder: PropTypes.string,
		Accounts_PasswordPlaceholder: PropTypes.string,
		Accounts_PasswordReset: PropTypes.bool,
		Accounts_ShowFormLogin: PropTypes.bool,
		isFetching: PropTypes.bool,
		error: PropTypes.object,
		failure: PropTypes.bool,
		theme: PropTypes.string,
		loginRequest: PropTypes.func,
		inviteLinkToken: PropTypes.string
	}

	constructor(props) {
		super(props);
		this.state = {
			user: props.route.params?.username ?? '',
			password: ''
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		const { error } = this.props;
		if (nextProps.failure && !equal(error, nextProps.error)) {
			if(nextProps.error?.message === 'credential_not_completed'){
				showConfirmationAlert({
					title: 'Registering is not completed',
					message: 'Please complete registering',
					confirmationText: 'Complete Registering',
					dismissText: 'Cancel',
					onPress: async() => {
						openLink(SIGN_IN_URL);
					},
					onCancel: () => {}
				});
			} else {
				Alert.alert(I18n.t('Oops'), I18n.t('Login_error'));
			}
		}
	}

	get showRegistrationButton() {
		const { Accounts_RegistrationForm, inviteLinkToken } = this.props;
		return Accounts_RegistrationForm === 'Public' || (Accounts_RegistrationForm === 'Secret URL' && inviteLinkToken?.length);
	}

	register = async () => {
		const { navigation } = this.props;
		navigation.navigate('RegisterView');
		// try {
		// 	await Linking.openURL(SIGN_UP_URL);
		// } catch {
		// }
	}

	forgotPassword = () => {
		const { navigation, Site_Name } = this.props;
		navigation.navigate('ForgotPasswordView', { title: Site_Name });
	}

	valid = () => {
		const { user, password } = this.state;
		return user.trim() && password.trim();
	}

	submit = () => {
		if (!this.valid()) {
			return;
		}

		const { user, password } = this.state;
		const { loginRequest } = this.props;
		Keyboard.dismiss();
		loginRequest({ user, password });
	}

	renderUserForm = () => {
		const { user } = this.state;
		const {
			Accounts_EmailOrUsernamePlaceholder, Accounts_PasswordPlaceholder, Accounts_PasswordReset, Accounts_RegistrationForm_LinkReplacementText, isFetching, theme, Accounts_ShowFormLogin
		} = this.props;

		return (
			<>
				<View style={styles.logoContainer}>
					<Image source={require('../images/logo.png')} style={[styles.logoImage]}/>
					<Image style={styles.logoBottom} source={require('../images/logo_bottom.png')} fadeDuration={0} />
				</View>
				<View style={{ ...styles.formContainer, backgroundColor: themes[theme].backgroundColor }}>
					<TextInput
						containerStyle={styles.inputContainer}
						placeholder={Accounts_EmailOrUsernamePlaceholder || I18n.t('Email')}
						keyboardType='email-address'
						returnKeyType='next'
						onChangeText={value => this.setState({ user: value })}
						onSubmitEditing={() => { this.passwordInput.focus(); }}
						testID='login-view-email'
						textContentType='username'
						autoCompleteType='username'
						theme={theme}
						value={user}
					/>
					<TextInput
						containerStyle={styles.inputContainer}
						inputRef={(e) => { this.passwordInput = e; }}
						placeholder={Accounts_PasswordPlaceholder || I18n.t('Password')}
						returnKeyType='send'
						secureTextEntry
						onSubmitEditing={this.submit}
						onChangeText={value => this.setState({ password: value })}
						testID='login-view-password'
						textContentType='password'
						autoCompleteType='password'
						theme={theme}
					/>
					<Button
						title={'Sign In'}
						type='primary'
						onPress={this.submit}
						testID='login-view-submit'
						loading={isFetching}
						disabled={!this.valid()}
						theme={theme}
						style={styles.loginButton}
					/>
					<TouchableOpacity onPress={this.forgotPassword} style={styles.bottomContainer}>
						<Text style={[styles.bottomContainerText, { color: themes[theme].auxiliaryText }]} >{I18n.t('Forgot_password')}</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity onPress={this.register} style={styles.bottomContainer}>
					<Text style={[styles.bottomContainerText, { color: themes[theme].auxiliaryText }]}>{I18n.t('Dont_Have_An_Account')}</Text>
					<Text
						style={[styles.bottomContainerTextBold, { color: themes[theme].auxiliaryText }]}
						testID='login-view-register'
					> Sign up
					</Text>
				</TouchableOpacity>
			</>
		);
	}

	render() {
		const { Accounts_ShowFormLogin, theme, navigation } = this.props;
		return (
			<FormContainer theme={theme} testID='login-view'>
				<FormContainerInner>
					<LoginServices separator={Accounts_ShowFormLogin} navigation={navigation} />
					{this.renderUserForm()}
				</FormContainerInner>
			</FormContainer>
		);
	}
}

const mapStateToProps = state => ({
	server: state.server.server,
	Site_Name: state.settings.Site_Name,
	Accounts_ShowFormLogin: state.settings.Accounts_ShowFormLogin,
	Accounts_RegistrationForm: state.settings.Accounts_RegistrationForm,
	Accounts_RegistrationForm_LinkReplacementText: state.settings.Accounts_RegistrationForm_LinkReplacementText,
	isFetching: state.login.isFetching,
	failure: state.login.failure,
	error: state.login.error && state.login.error.data,
	Accounts_EmailOrUsernamePlaceholder: state.settings.Accounts_EmailOrUsernamePlaceholder,
	Accounts_PasswordPlaceholder: state.settings.Accounts_PasswordPlaceholder,
	Accounts_PasswordReset: state.settings.Accounts_PasswordReset,
	inviteLinkToken: state.inviteLinks.token
});

const mapDispatchToProps = dispatch => ({
	loginRequest: params => dispatch(loginRequestAction(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(LoginView));
