import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import Touch from '../../../utils/touch';
import { CustomIcon } from '../../../lib/Icons';
import I18n from '../../../i18n';
import styles from '../styles';
import { themes } from '../../../constants/colors';
import { withTheme } from '../../../theme';


const Sort = React.memo(({
	searching, sortBy, toggleSort, theme
}) => {
	// if (searching > 0) {
	// 	return null;
	// }
	return (
		<Touch
			onPress={toggleSort}
			theme={theme}
			style={{ marginHorizontal: 12, padding: 4, borderRadius: 4, backgroundColor: themes[theme].headerSecondaryBackground }}
		>
			<CustomIcon style={[styles.sortIcon, { color: themes[theme].grayColor }]} size={24} name='sort' />
		</Touch>
	);
});

Sort.propTypes = {
	searching: PropTypes.bool,
	sortBy: PropTypes.string,
	theme: PropTypes.string,
	toggleSort: PropTypes.func
};

export default withTheme(Sort);
