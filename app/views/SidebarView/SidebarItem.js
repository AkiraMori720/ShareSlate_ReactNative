import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import Touchable from 'react-native-platform-touchable';
import { themes } from '../../constants/colors';
import { withTheme } from '../../theme';
import sharedStyles from '../Styles';

const Item = React.memo(({
	left, right, text, onPress, testID, current, theme
}) => (
	<Touchable
		key={testID}
		testID={testID}
		onPress={onPress}
		style={[styles.item,  sharedStyles.shadow, { backgroundColor: current?'#91A3B5':'white' }]}
		theme={theme}
	>
		<View style={[styles.itemContent]}>
			<View style={styles.itemHorizontal}>
				{left}
			</View>
			<View style={styles.itemCenter}>
				<Text style={[styles.itemText, { color: current?'white':themes[theme].grayColor }]} numberOfLines={1}>
					{text}
				</Text>
			</View>
			{right ? <View style={styles.itemHorizontal}>
				{right}
			</View>: null }
		</View>
	</Touchable>
));

Item.propTypes = {
	left: PropTypes.element,
	right: PropTypes.element,
	text: PropTypes.string,
	current: PropTypes.bool,
	onPress: PropTypes.func,
	testID: PropTypes.string,
	theme: PropTypes.string
};

export default withTheme(Item);
