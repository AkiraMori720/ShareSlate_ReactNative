import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Touchable from 'react-native-platform-touchable';

import { CustomIcon } from '../../lib/Icons';
import { withTheme } from '../../theme';
import { themes } from '../../constants/colors';
import sharedStyles from '../../views/Styles';
import { VectorIcon } from '../../presentation/VectorIcon';

export const BUTTON_HIT_SLOP = {
	top: 5, right: 5, bottom: 5, left: 5
};

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 6
	},
	title: {
		...Platform.select({
			android: {
				fontSize: 14
			},
			default: {
				fontSize: 17
			}
		}),
		...sharedStyles.textRegular
	}
});

const Item = ({
	title, titleStyle, iconName, onPress, testID, theme, badge, vector
}) => (
	<Touchable onPress={onPress} testID={testID} hitSlop={BUTTON_HIT_SLOP} style={styles.container}>
		<>
			{
				iconName
					? (vector ? <VectorIcon type={vector} name={iconName} size={32} color={titleStyle ? themes[theme].headerTitleColor : themes[theme].headerTintColor} />:<CustomIcon name={iconName} size={24} color={titleStyle ? themes[theme].headerTitleColor : themes[theme].headerTintColor} />)
					: <Text style={[styles.title, { color: titleStyle ? themes[theme].headerTitleColor : themes[theme].headerTintColor }, titleStyle ?? {}]}>{title}</Text>
			}
			{badge ? badge() : null}
		</>
	</Touchable>
);

Item.propTypes = {
	onPress: PropTypes.func.isRequired,
	title: PropTypes.string,
	titleStyle: PropTypes.object,
	vector: PropTypes.string,
	iconName: PropTypes.string,
	testID: PropTypes.string,
	theme: PropTypes.string,
	badge: PropTypes.func
};

Item.displayName = 'HeaderButton.Item';

export default withTheme(Item);
