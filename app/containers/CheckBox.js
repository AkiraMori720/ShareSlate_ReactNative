import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';

import FontAwesome from "react-native-vector-icons/FontAwesome";

const CheckBox = React.memo(({ title, checked, checkedColor,unCheckedColor, checkedIcon, uncheckedIcon, textStyle, containerStyle, onPress }) => (
	<TouchableOpacity
		style={{ ...containerStyle, flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 }}
		onPress={onPress}
	>
		<FontAwesome name={checked ? checkedIcon : uncheckedIcon} size={24} color={checked?checkedColor:unCheckedColor} />
		{ title ? <Text style={{ marginLeft: 8, ...textStyle }}>{title}</Text> : null }
	</TouchableOpacity>));

CheckBox.propTypes = {
	title: PropTypes.string,
	checked: PropTypes.bool,
	checkedColor: PropTypes.string,
	unCheckedColor: PropTypes.string,
	checkedIcon: PropTypes.string,
	uncheckedIcon: PropTypes.string,
	textStyle: PropTypes.object,
	containerStyle: PropTypes.object,
	onPress: PropTypes.func
};

export default CheckBox;
