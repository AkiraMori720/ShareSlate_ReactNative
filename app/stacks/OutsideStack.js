import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ThemeContext } from '../theme';
import {
	defaultHeader, themedHeader, StackAnimation, ModalAnimation
} from '../utils/navigation';

// Outside Stack
import LoginView from '../views/LoginView';
import ForgotPasswordView from '../views/ForgotPasswordView';
import RegisterView from '../views/RegisterView';
import LegalView from '../views/LegalView';
import AuthenticationWebView from '../views/AuthenticationWebView';
import { ROOT_OUTSIDE } from '../actions/app';
import OnboardingView from '../views/OnboardingView';

// Outside
const Outside = createStackNavigator();
const _OutsideStack = ({ root }) => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<Outside.Navigator screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...StackAnimation }}>
			{root === ROOT_OUTSIDE ? (
				<Outside.Screen
					name='OnboardingView'
					component={OnboardingView}
					options={OnboardingView.navigationOptions}
				/>
			) : null}
			<Outside.Screen
				name='LoginView'
				component={LoginView}
				options={{ headerShown: false }}
			/>
			<Outside.Screen
				name='RegisterView'
				component={RegisterView}
				options={{ headerShown: false }}
			/>
			<Outside.Screen
				name='ForgotPasswordView'
				component={ForgotPasswordView}
				options={ForgotPasswordView.navigationOptions}
			/>
			<Outside.Screen
				name='LegalView'
				component={LegalView}
				options={LegalView.navigationOptions}
			/>
		</Outside.Navigator>
	);
};

const mapStateToProps = state => ({
	root: state.app.root
});

_OutsideStack.propTypes = {
	root: PropTypes.string
};

const OutsideStack = connect(mapStateToProps)(_OutsideStack);

// OutsideStackModal
const OutsideModal = createStackNavigator();
const OutsideStackModal = () => {
	const { theme } = React.useContext(ThemeContext);

	return (
		<OutsideModal.Navigator mode='modal' screenOptions={{ ...defaultHeader, ...themedHeader(theme), ...ModalAnimation }}>
			<OutsideModal.Screen
				name='OutsideStack'
				component={OutsideStack}
				options={{ headerShown: false }}
			/>
			<OutsideModal.Screen
				name='AuthenticationWebView'
				component={AuthenticationWebView}
				options={AuthenticationWebView.navigationOptions}
			/>
		</OutsideModal.Navigator>
	);
};

export default OutsideStackModal;
