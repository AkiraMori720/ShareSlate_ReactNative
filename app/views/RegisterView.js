import React from 'react';
import PropTypes from 'prop-types';
import {
	Text, View, StyleSheet, Keyboard, Image, TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import { logEvent, events } from '../utils/log';
import sharedStyles from './Styles';
import Button from '../containers/Button';
import I18n from '../i18n';
import { themes } from '../constants/colors';
import { withTheme } from '../theme';
import FormContainer, { FormContainerInner } from '../containers/FormContainer';
import TextInput from '../containers/TextInput';
import isValidEmail from '../utils/isValidEmail';
import { showErrorAlert } from '../utils/info';
import RocketChat from '../lib/rocketchat';
import { loginRequest as loginRequestAction } from '../actions/login';
import openLink from '../utils/openLink';
import LoginServices from '../containers/LoginServices';
import { getShowLoginButton } from '../selectors/login';
import PhoneInput from 'react-native-phone-number-input';
import { Select } from '../containers/UIKit/Select';
import { DatePicker } from '../containers/UIKit/DatePicker';
import { BLOCK_CONTEXT } from '@rocket.chat/ui-kit';
import CheckBox from '../containers/CheckBox';

const styles = StyleSheet.create({
	logoContainer: {
		flex: 1,
		marginHorizontal: 24
	},
	logoImage: {
		resizeMode: 'contain',
		width: '100%',
		height: 160
	},
	title: {
		...sharedStyles.textBold,
		fontSize: 22
	},
	label: {
		marginTop: 10,
		marginBottom: 10,
		fontSize: 14,
		...sharedStyles.textSemibold
	},
	formContainer: {
		borderRadius: 8,
		marginTop: 12,
		paddingHorizontal: 12
	},
	inputContainer: {
		marginVertical: 16
	},
	phoneNumberContainer: {
		borderRadius: 8,
		borderWidth: StyleSheet.hairlineWidth,
		height: 40,
		width: '100%'
	},
	phoneInputContainer: {
		borderRadius: 8,
		padding: 0
	},
	phoneInput: {
		flex: 1,
		height: 40,
		fontSize: 16,
		margin: 0
	},
	bottomContainer: {
		flexDirection: 'row',
		alignSelf: 'center',
		marginVertical: 16,
		marginHorizontal: 30
	},
	bottomContainerText: {
		...sharedStyles.textRegular,
		fontSize: 13
	},
	bottomContainerTextBold: {
		...sharedStyles.textSemibold,
		fontSize: 13
	},
	registerButton: {
		alignSelf: 'center',
		backgroundColor: '#59ADFF',
		borderRadius: 16,
		marginTop: 16,
		width: 120
	}
});

class RegisterView extends React.Component {
	static propTypes = {
		navigation: PropTypes.object,
		server: PropTypes.string,
		Accounts_EmailVerification: PropTypes.bool,
		Accounts_ManuallyApproveNewUsers: PropTypes.bool,
		theme: PropTypes.string,
		Site_Name: PropTypes.string,
		loginRequest: PropTypes.func,
		showLoginButton: PropTypes.bool
	}

	constructor(props) {
		super(props);
		this.state = {
			username: '',
			email: '',
			phoneNumber: '',
			password: '',
			confirmPassword: '',
			gender: 'M',
			dob: new Date(),
			nameError: false,
			emailError: false,
			phoneNumberError: false,
			passwordMatchError: false,
			genderError: false,
			dobError: false,
			saving: false,
			agree: false,
		};
	}

	login = () => {
		const { navigation, Site_Name } = this.props;
		navigation.navigate('LoginView', { title: Site_Name });
	}

	valid = () => {
		const {
			phoneNumber, email, password, username, confirmPassword, gender
		} = this.state;
		return phoneNumber.trim() && email.trim() && password.trim() && confirmPassword.trim() && (password === confirmPassword) && gender && username.trim() && isValidEmail(email);
	}

	submit = async() => {
		logEvent(events.REGISTER_DEFAULT_SIGN_UP);
		const {
			phoneNumber, email, password, username, confirmPassword, gender, dob, agree
		} = this.state;
		this.setState({
			nameError: false,
			emailError: false,
			phoneNumberError: false,
			passwordMatchError: false,
			genderError: false,
		});

		if (!isValidEmail(email)){
			this.setState({emailError: {error: true, reason: I18n.t('error-invalid-email-address')}});
			return;
		}
		if (!this.phoneInput.isValidNumber(phoneNumber)){
			this.setState({phoneNumberError: true});
			return;
		}
		if (password !== confirmPassword){
			this.setState({passwordMatchError: {error: true, reason: I18n.t('error-invalid-password')}});
			return;
		}

		if (!agree){
			showErrorAlert('Please agree to our Term & Conditions and Privacy Policy', 'ShareSlate');
			return
		}

		this.setState({ saving: true });
		Keyboard.dismiss();
3
		const {
			navigation
		} = this.props;

		try {
			await RocketChat.register({
				phone: phoneNumber, email, password: password, username, gender, dob
			});

			await navigation.goBack();
			showErrorAlert(I18n.t('Verify_email_desc'), I18n.t('Registration_Succeeded'));

		} catch (e) {
			if(e){
				logEvent(events.REGISTER_DEFAULT_SIGN_UP_F);
				showErrorAlert(e, I18n.t('Oops'));
			}
		}
		this.setState({ saving: false });
	}

	openContract = (route) => {
		const { server, theme } = this.props;
		if (!server) {
			return;
		}
		openLink(`${ server }/${ route }`, theme);
	}

	toggleAgree = () => {
		const { agree } = this.state;
		this.setState({ agree: !agree });
	}

	render() {
		const { username, email, password, confirmPassword, gender, dob, saving, nameError, emailError, phoneNumberError, passwordMatchError, genderError, dobError, agree } = this.state;
		const { theme, navigation } = this.props;
		const genders = [
			{text: { text: 'Male'}, value: 'M'},
			{text: { text: 'Female'}, value: 'F'},
			{text: { text: 'Others'}, value: 'O'}
			];
		return (
			<FormContainer theme={theme} testID='register-view'>
				<FormContainerInner>
					<LoginServices navigation={navigation} />
					<View style={styles.logoContainer}>
						<Image source={require('../images/logo.png')} style={styles.logoImage}/>
					</View>
					<View style={{ alignItems: 'center' }}>
						<Text style={[styles.title, sharedStyles.textBold, { color: themes[theme].titleText }]}>{I18n.t('Sign_Up')}</Text>
					</View>
					<View style={{ ...styles.formContainer, backgroundColor: themes[theme].backgroundColor }}>
						<TextInput
							label='Username'
							value={username}
							error={nameError}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.userNameInput = e; }}
							placeholder={I18n.t('Username')}
							returnKeyType='next'
							onChangeText={username => this.setState({ username })}
							onSubmitEditing={() => {
								const {username} = this.state;
								this.emailInput.focus();
								if(!username.trim()){
									this.setState({nameError: {error: true, reason: I18n.t('error-invalid-name')}});
								} else {
									this.setState({nameError: false});
								}
							}}
							testID='register-view-username'
							theme={theme}
						/>
						<TextInput
							label='Email'
							value={email}
							error={emailError}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.emailInput = e; }}
							placeholder={I18n.t('Email')}
							returnKeyType='next'
							keyboardType='email-address'
							onChangeText={email => this.setState({ email })}
							onSubmitEditing={() => {
								const {email} = this.state;
								this.phoneNumberInput.focus();
								if(!isValidEmail(email)){
									this.setState({emailError: {error: true, reason: I18n.t('error-invalid-email-address')}});
								} else {
									this.setState({emailError: false});
								}
								}}
							testID='register-view-email'
							theme={theme}
						/>
						<Text
							contentDescription={null}
							accessibilityLabel={null}
							style={[
								styles.label,
								{ color: themes[theme].titleText },
							]}
						>
							{'Phone Number'}
						</Text>
						<PhoneInput
							ref={(e) => { this.phoneInput = e; }}
							defaultCode={'US'}
							iconLeft='phone'
							layout={'first'}
							containerStyle={{ ...styles.phoneNumberContainer, backgroundColor: themes[theme].backgroundColor, color: themes[theme].bodyText, borderColor: phoneNumberError?themes[theme].dangerColor:themes[theme].separatorColor }}
							textContainerStyle={{ ...styles.phoneInputContainer, backgroundColor: themes[theme].auxiliaryBackground}}
							codeTextStyle={{color: themes[theme].bodyText, fontSize: 16, lineHeight: 15 }}
							textInputStyle={{ ...styles.phoneInput, color: themes[theme].bodyText }}
							placeholder={I18n.t('Phone_Number')}
							onChangeText={ phoneNumber => this.setState({ phoneNumber: `${this.phoneInput.getCallingCode()}${phoneNumber}` })}
							textInputProps={{
								ref : (e) => { this.phoneNumberInput = e; },
								onSubmitEditing: () => {
									const {phoneNumber} = this.state;
									this.passwordInput.focus();
									this.setState({phoneNumberError: !this.phoneInput.isValidNumber(phoneNumber) });
								},
								placeholderTextColor: themes[theme].auxiliaryText
							}}
							testID='register-view-phone-number'
							withDarkTheme={theme!=='light'}
						/>
						<TextInput
							label='Password'
							error={passwordMatchError}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.passwordInput = e; }}
							value={password}
							placeholder={I18n.t('Password')}
							returnKeyType='next'
							secureTextEntry
							onChangeText={value => this.setState({ password: value })}
							onSubmitEditing={() => { this.confirmPasswordInput.focus(); }}
							testID='register-view-password'
							theme={theme}
						/>
						<TextInput
							label='Confirm Password'
							error={passwordMatchError}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.confirmPasswordInput = e; }}
							value={confirmPassword}
							placeholder={I18n.t('Confirm_Password')}
							returnKeyType='send'
							secureTextEntry
							onChangeText={value => {

								this.setState({ confirmPassword: value });

							}}
							onSubmitEditing={() => {
								const { password, confirmPassword } = this.state;
								if(!confirmPassword || confirmPassword !== password){
									this.setState({ passwordMatchError: { error: true, reason: I18n.t('error-invalid-password')} });
								} else {
									this.setState({passwordMatchError: false});
								}
							}}
							testID='register-view-confirm-password'
							theme={theme}
						/>
						<Text
							contentDescription={null}
							accessibilityLabel={null}
							style={[
								styles.label,
								{ color: genderError?themes[theme].dangerColor: themes[theme].titleText },
							]}
						>
							{'Gender'}
						</Text>
						<Select
							options={genders}
							value={gender}
							error={genderError}
							placeholder={{text: I18n.t('Please_select_gender')}}
							onChange={gender => this.setState({ gender })}
							testID='register-view-gender'
							theme={theme}
						/>
						<Text
							contentDescription={null}
							accessibilityLabel={null}
							style={[
								styles.label,
								{ color: genderError?themes[theme].dangerColor: themes[theme].titleText },
							]}
						>
							{'DOB'}
						</Text>
						<DatePicker
							element={{ initial_date: dob, placeholder: { text: 'Please_select_birthday'}}}
							action={(dob) => this.setState({dob})}
							context={BLOCK_CONTEXT.FORM}
							error={dobError}
							theme={theme}
						/>
						<CheckBox
							title={'I agree to Term & Conditions and Privacy Policy'}
							checked={agree}
							onPress={this.toggleAgree}
							onIconPress={this.toggleAgree}
							checkedIcon='check-square-o'
							uncheckedIcon='square-o'
							checkedColor={themes[theme].actionTintColor}
							unCheckedColor={themes[theme].bodyText}
							textStyle={{ color: themes[theme].bodyText }}
							containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, marginTop: 8 }}
						/>
						<Button
							title={I18n.t('Register')}
							type='primary'
							onPress={this.submit}
							testID='register-view-submit'
							disabled={!this.valid()}
							loading={saving}
							theme={theme}
							style={styles.registerButton}
						/>
					</View>

					<View style={styles.bottomContainer}>
						<Text style={[styles.bottomContainerText, { color: themes[theme].auxiliaryText }]}>{I18n.t('Do_you_have_an_account')}</Text>
						<Text
							style={[styles.bottomContainerTextBold, { color: themes[theme].auxiliaryText }]}
							onPress={this.login}
						> {I18n.t('Login')}</Text>
					</View>
				</FormContainerInner>
			</FormContainer>
		);
	}
}

const mapStateToProps = state => ({
	server: state.server.server,
	Site_Name: state.settings.Site_Name,
	Gitlab_URL: state.settings.API_Gitlab_URL,
	CAS_enabled: state.settings.CAS_enabled,
	CAS_login_url: state.settings.CAS_login_url,
	Accounts_EmailVerification: state.settings.Accounts_EmailVerification,
	Accounts_ManuallyApproveNewUsers: state.settings.Accounts_ManuallyApproveNewUsers,
	showLoginButton: getShowLoginButton(state)
});

const mapDispatchToProps = dispatch => ({
	loginRequest: params => dispatch(loginRequestAction(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(RegisterView));
