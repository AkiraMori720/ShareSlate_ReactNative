import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';

import { themes } from '../constants/colors';
import sharedStyles from '../views/Styles';
import scrollPersistTaps from '../utils/scrollPersistTaps';
import KeyboardView from '../presentation/KeyboardView';
import StatusBar from './StatusBar';
import { isTablet } from '../utils/deviceInfo';
import SafeAreaView from './SafeAreaView';
import { FAQ_URL, PRIVACY_URL, TERMS_URL } from '../constants/links';

const styles = StyleSheet.create({
	scrollView: {
		minHeight: '100%'
	},
	bottomContainer: {
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	termsContainer: {
		flexDirection: 'row'
	}
});

export const FormContainerInner = ({ children }) => (
	<View style={[sharedStyles.container, isTablet && sharedStyles.tabletScreenContent]}>
		{children}
	</View>
);

const goToUrl = async (url) => {
	try {
		await Linking.openURL(url);
	} catch {
	}
}

const FormContainer = ({
	children, theme, testID, ...props
}) => (
	<KeyboardView
		style={{ backgroundColor: 'white' }}
		contentContainerStyle={sharedStyles.container}
		keyboardVerticalOffset={128}
	>
		<StatusBar />
		<ScrollView
			style={sharedStyles.container}
			contentContainerStyle={[sharedStyles.containerScrollView, styles.scrollView]}
			{...scrollPersistTaps}
			{...props}
		>
			<SafeAreaView testID={testID} style={{ backgroundColor: 'white' }}>
				{children}
				<View style={styles.bottomContainer}>
					<Text style={[styles.text, { color: themes[theme].auxiliaryText }]}>Share Slate © 2021</Text>
					<View style={styles.termsContainer}>
						<TouchableOpacity onPress={() => goToUrl(TERMS_URL)}><Text style={{ color: themes[theme].auxiliaryText }}>Terms  & Condition |</Text></TouchableOpacity>
						<TouchableOpacity onPress={() => goToUrl(PRIVACY_URL)}><Text style={{ color: themes[theme].auxiliaryText }}> Privacy Policies |</Text></TouchableOpacity>
						<TouchableOpacity onPress={() => goToUrl(FAQ_URL)}><Text style={{ color: themes[theme].auxiliaryText }}> FAQ</Text></TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</ScrollView>
	</KeyboardView>
);

FormContainer.propTypes = {
	theme: PropTypes.string,
	testID: PropTypes.string,
	children: PropTypes.element
};

FormContainerInner.propTypes = {
	children: PropTypes.element
};

export default FormContainer;
