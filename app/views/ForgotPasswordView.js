import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';

import TextInput from '../containers/TextInput';
import Button from '../containers/Button';
import sharedStyles from './Styles';
import { showErrorAlert } from '../utils/info';
import isValidEmail from '../utils/isValidEmail';
import I18n from '../i18n';
import RocketChat from '../lib/rocketchat';
import { withTheme } from '../theme';
import { themes } from '../constants/colors';
import FormContainer, { FormContainerInner } from '../containers/FormContainer';
import { logEvent, events } from '../utils/log';

const styles = StyleSheet.create({
	logoContainer: {
		marginHorizontal: 24
	},
	logoImage: {
		resizeMode: 'contain',
		width: '100%',
		height: 160
	},
	title: {
		...sharedStyles.textBold,
		marginBottom: 8,
		fontSize: 22,
	},
	formContainer: {
		borderRadius: 8,
		marginTop: 12,
		padding: 24
	},
	noteContainer:{
		borderRadius: 8,
		backgroundColor: '#cdf7ec',
		marginBottom: 24
	},
	note: {
		paddingVertical: 16,
		paddingHorizontal: 36,
		textAlign: 'center',
		color: '#048060'
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
		width: 180
	}
});

class ForgotPasswordView extends React.Component {
	static navigationOptions = ({ route }) => ({
		title: I18n.t('Reset_password')
	})

	static propTypes = {
		navigation: PropTypes.object,
		theme: PropTypes.string
	}

	state = {
		email: '',
		invalidEmail: true,
		isFetching: false
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { email, invalidEmail, isFetching } = this.state;
		const { theme } = this.props;
		if (nextProps.theme !== theme) {
			return true;
		}
		if (nextState.email !== email) {
			return true;
		}
		if (nextState.invalidEmail !== invalidEmail) {
			return true;
		}
		if (nextState.isFetching !== isFetching) {
			return true;
		}
		return false;
	}

	validate = (email) => {
		if (!isValidEmail(email)) {
			this.setState({ invalidEmail: true });
			return;
		}
		this.setState({ email, invalidEmail: false });
	}

	login = () => {
		const { navigation } = this.props;
		navigation.navigate('LoginView');
	}

	resetPassword = async() => {
		logEvent(events.FP_FORGOT_PASSWORD);
		const { email, invalidEmail } = this.state;
		if (invalidEmail || !email) {
			return;
		}
		try {
			this.setState({ isFetching: true });
			const result = await RocketChat.forgotPassword(email);
			if (result.success) {
				const { navigation } = this.props;
				navigation.pop();
				showErrorAlert(I18n.t('Forgot_password_If_this_email_is_registered'), I18n.t('Alert'));
			}
		} catch (e) {
			logEvent(events.FP_FORGOT_PASSWORD_F);
			const msg = (e.data && e.data.error) || I18n.t('There_was_an_error_while_action', { action: I18n.t('resetting_password') });
			showErrorAlert(msg, I18n.t('Alert'));
		}
		this.setState({ isFetching: false });
	}

	render() {
		const { invalidEmail, isFetching } = this.state;
		const { theme } = this.props;

		return (
			<FormContainer theme={theme} testID='forgot-password-view'>
				<FormContainerInner>
					<View style={styles.logoContainer}>
						<Image source={require('../images/logo.png')} style={styles.logoImage}/>
					</View>
					<View style={{ alignItems: 'center' }}>
						<Text style={[sharedStyles.loginTitle, sharedStyles.textBold, { color: themes[theme].titleText }]}>{I18n.t('Forgot_password')}</Text>
					</View>
					<View style={{ ...styles.formContainer, backgroundColor: themes[theme].backgroundColor }}>
						<View style={styles.noteContainer}>
							<Text style={styles.note}>{I18n.t('Forgot_password_note')}</Text>
						</View>
						<TextInput
							label={'Email'}
							placeholder={I18n.t('Email')}
							keyboardType='email-address'
							returnKeyType='send'
							onChangeText={email => this.validate(email)}
							onSubmitEditing={this.resetPassword}
							testID='forgot-password-view-email'
							containerStyle={sharedStyles.inputLastChild}
							theme={theme}
						/>
						<Button
							title={I18n.t('Reset_password')}
							type='primary'
							onPress={this.resetPassword}
							testID='forgot-password-view-submit'
							loading={isFetching}
							disabled={invalidEmail}
							theme={theme}
							style={styles.loginButton}
						/>
					</View>
					<View style={styles.bottomContainer}>
						<Text style={[styles.bottomContainerText, { color: themes[theme].auxiliaryText }]}>{I18n.t('Remember_it')}</Text>
						<Text
							style={[styles.bottomContainerTextBold, { color: themes[theme].auxiliaryText }]}
							onPress={this.login}
						>{I18n.t('Login')}
						</Text>
					</View>
				</FormContainerInner>
			</FormContainer>
		);
	}
}

export default withTheme(ForgotPasswordView);
