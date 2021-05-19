import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	I18nManager
} from 'react-native';
import PropTypes from 'prop-types';

import Touch from '../../utils/touch';
import { themes } from '../../constants/colors';
import sharedStyles from '../../views/Styles';
import { withTheme } from '../../theme';
import I18n from '../../i18n';

const styles = StyleSheet.create({
	touchContainer: {
		flex: 1,
		backgroundColor: '#F7F7F7',
		borderRadius: 8,
		margin: 8,
		height: 68
	},
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: '#DBDBDB',
		borderRadius: 8,
		paddingHorizontal: 8
	},
	leftContainer: {
		marginLeft: 8
	},
	disabled: {
		opacity: 0.3
	},
	textContainer: {
		flex: 1,
		justifyContent: 'center'
	},
	title: {
		fontSize: 14,
		alignSelf: 'center',
		...sharedStyles.textRegular
	},
	subtitle: {
		fontSize: 14,
		...sharedStyles.textRegular
	},
	actionIndicator: {
		...I18nManager.isRTL
			? { transform: [{ rotate: '180deg' }] }
			: {}
	}
});

const Content = React.memo(({
	title, subtitle, disabled, testID, left, color, theme, translateTitle, translateSubtitle, fontScale
}) => (
	<View style={[styles.container, disabled && styles.disabled]} testID={testID}>
		{left
			? (
				<View style={styles.leftContainer}>
					{left}
				</View>
			)
			: null}
		<View style={styles.textContainer}>
			<Text style={[styles.title, { color: color || themes[theme].titleText }]}>{translateTitle ? I18n.t(title) : title}</Text>
		</View>
	</View>
));

const SettingItem = React.memo(({ onPress, ...props }) => (
	<Touch
		onPress={() => onPress(props.title)}
		style={styles.touchContainer}
		enabled={!props.disabled}
		theme={props.theme}
	>
		<Content {...props} />
	</Touch>
));

SettingItem.propTypes = {
	onPress: PropTypes.func,
	theme: PropTypes.string
};

Content.propTypes = {
	title: PropTypes.string.isRequired,
	subtitle: PropTypes.string,
	left: PropTypes.element,
	right: PropTypes.func,
	disabled: PropTypes.bool,
	testID: PropTypes.string,
	theme: PropTypes.string,
	color: PropTypes.string,
	translateTitle: PropTypes.bool,
	translateSubtitle: PropTypes.bool,
	fontScale: PropTypes.number
};

Content.defaultProps = {
	translateTitle: true,
	translateSubtitle: true
};

export default withTheme(SettingItem);
