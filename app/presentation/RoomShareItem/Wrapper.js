import React from 'react';
import { View, Image } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import { themes } from '../../constants/colors';
import Status from '../../containers/Status/Status';

const Wrapper = ({
	avatar,
	theme,
	children,
	status,
	isContact
}) => (
	<View
		style={styles.container}
	>
		<View style={styles.avatarContainer}>
			<Image
				source={{ uri: avatar }}
				style={styles.avatar}
			/>
			{ isContact ? <Status style={styles.status} size={14} status={status} /> : null}
		</View>
		<View
			style={[
				styles.centerContainer,
				{
					borderColor: themes[theme].separatorColor
				}
			]}
		>
			{children}
		</View>
	</View>
);

Wrapper.propTypes = {
	avatar: PropTypes.string,
	status: PropTypes.string,
	isContact: PropTypes.bool,
	children: PropTypes.element,
	theme: PropTypes.string
};

export default Wrapper;
