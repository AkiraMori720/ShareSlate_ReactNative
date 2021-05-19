import React from 'react';
import {
	View, Text, Image, BackHandler, Linking
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Orientation from 'react-native-orientation-locker';

import { appStart as appStartAction, ROOT_BACKGROUND } from '../../actions/app';
import I18n from '../../i18n';
import Button from '../../containers/Button';
import styles from './styles';
import { isTablet } from '../../utils/deviceInfo';
import { themes } from '../../constants/colors';
import { withTheme } from '../../theme';
import FormContainer, { FormContainerInner } from '../../containers/FormContainer';
import { logEvent, events } from '../../utils/log';


class OnboardingView extends React.Component {
	static navigationOptions = {
		headerShown: false
	};

	static propTypes = {
		navigation: PropTypes.object,
		appStart: PropTypes.func,
		theme: PropTypes.string
	}

	constructor(props) {
		super(props);
		if (!isTablet) {
			Orientation.lockToPortrait();
		}
	}

	componentDidMount() {
		const { navigation } = this.props;
		this.unsubscribeFocus = navigation.addListener('focus', () => {
			this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
		});
		this.unsubscribeBlur = navigation.addListener('blur', () => {
			if (this.backHandler && this.backHandler.remove) {
				this.backHandler.remove();
			}
		});
	}

	shouldComponentUpdate(nextProps) {
		const { theme } = this.props;
		if (theme !== nextProps.theme) {
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		if (this.unsubscribeFocus) {
			this.unsubscribeFocus();
		}
		if (this.unsubscribeBlur) {
			this.unsubscribeBlur();
		}
	}

	handleBackPress = () => {
		const { appStart } = this.props;
		appStart({ root: ROOT_BACKGROUND });
		return false;
	}

	goToLogin = () => {
		const { navigation } = this.props;
		navigation.navigate('LoginView');
	}

	createWorkspace = async() => {
		logEvent(events.ONBOARD_CREATE_NEW_WORKSPACE);
		try {
			await Linking.openURL('https://cloud.rocket.chat/trial');
		} catch {
			logEvent(events.ONBOARD_CREATE_NEW_WORKSPACE_F);
		}
	}


	render() {
		const { theme } = this.props;
		return (
			<FormContainer theme={theme} testID='onboarding-view'>
				<FormContainerInner>
					<Image style={styles.onboarding} source={require('../../images/logo.png')} fadeDuration={0} />
					<Image style={styles.logoBottom} source={require('../../images/logo_bottom.png')} fadeDuration={0} />
					<Text style={[styles.subtitle, { color: themes[theme].controlText }]}>{I18n.t('Onboarding_subtitle')}</Text>
					<Text style={[styles.description, { color: themes[theme].auxiliaryText }]}>{I18n.t('Onboarding_description')}</Text>
					<View style={styles.buttonsContainer}>
						<Button
							title={'Sign In'}
							type='primary'
							onPress={this.goToLogin}
							style={styles.loginBtn}
							theme={theme}
							testID='join-workspace'
						/>
					</View>
				</FormContainerInner>
			</FormContainer>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	appStart: params => dispatch(appStartAction(params))
});

export default connect(null, mapDispatchToProps)(withTheme(OnboardingView));
