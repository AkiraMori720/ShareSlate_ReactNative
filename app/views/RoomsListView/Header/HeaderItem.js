import React from 'react';
import {
	Text, View, TouchableOpacity, StyleSheet, Image
} from 'react-native';
import PropTypes from 'prop-types';

import TextInput from '../../../presentation/TextInput';
import I18n from '../../../i18n';
import sharedStyles from '../../Styles';
import { themes } from '../../../constants/colors';
import { CustomIcon } from '../../../lib/Icons';
import { isTablet, isIOS } from '../../../utils/deviceInfo';
import { useOrientation } from '../../../dimensions';
import Touchable from 'react-native-platform-touchable';
import { withTheme } from '../../../theme';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		borderRadius: 4
	},
	title: {
		paddingVertical: 4,
		paddingHorizontal: 4,
		alignSelf: 'center',
		fontSize: 12,
		...sharedStyles.textSemibold
	},
	item: {
		flex: 1,
		marginHorizontal: 8,
		marginTop: 4,
		marginBottom: 12,
		borderRadius: 8
	},
	itemContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemHorizontal: {
		marginLeft: 12,
		width: 60,
		alignItems: 'center'
	},
	itemCenter: {
		flex: 1
	},
	itemText: {
		marginVertical: 16,
		fontSize: 16,
		...sharedStyles.textSemibold
	}
});

export const HeaderItem = React.memo(({
	title, onPress, isActive, theme
}) => (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.container, { backgroundColor: isActive?themes[theme].activeTabColor:null}]}>
			<Text style={[styles.title, { color: isActive?'white':themes[theme].grayColor }]} numberOfLines={1}>{title}</Text>
		</TouchableOpacity>
	)
);

HeaderItem.propTypes = {
	title: PropTypes.string,
	isActive: PropTypes.bool,
	onPress: PropTypes.func.isRequired,
	theme: PropTypes.string
};

export const HeaderIconButton = React.memo(({
	left, text, onPress, testID, current, theme
}) => (
	<Touchable
		key={testID}
		testID={testID}
		onPress={onPress}
		style={[styles.item,  sharedStyles.shadow, { backgroundColor: current?themes[theme].activeTabColor:'white' }]}
		theme={theme}
	>
		<View style={[styles.itemContent]}>
			<View style={styles.itemHorizontal}>
				{left}
			</View>
			<View style={styles.itemCenter}>
				<Text style={[styles.itemText, { color:current?'white':themes[theme].grayColor }]} numberOfLines={1}>
					{text}
				</Text>
			</View>
		</View>
	</Touchable>
));

HeaderIconButton.propTypes = {
	left: PropTypes.element,
	right: PropTypes.element,
	text: PropTypes.string,
	current: PropTypes.bool,
	onPress: PropTypes.func,
	testID: PropTypes.string,
	theme: PropTypes.string
};
