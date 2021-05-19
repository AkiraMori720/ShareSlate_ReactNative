import React from 'react';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import { themes } from '../../constants/colors';

const Title = React.memo(({
	name, theme, description
}) => (
	<View style={{ justifyContent: 'center' }}>
		<Text
			style={[
				styles.title,
				{ color: themes[theme].titleText }
			]}
			ellipsizeMode='tail'
			numberOfLines={1}
		>
			{name}
		</Text>
		<Text
			style={[
				styles.subTitle,
				{ color: themes[theme].auxiliaryText }
			]}
			ellipsizeMode='tail'
			numberOfLines={1}
		>
			{description}
		</Text>
	</View>
));

Title.propTypes = {
	name: PropTypes.string,
	description: PropTypes.string,
	theme: PropTypes.string
};

export default Title;
