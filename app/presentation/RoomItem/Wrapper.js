import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import { themes } from '../../constants/colors';
import Avatar from '../../containers/Avatar';
import TypeIcon from './TypeIcon';

const Wrapper = ({
	accessibilityLabel,
	avatar,
	avatarSize,
	type,
	theme,
	rid,
	children,
	status,
	prid,
	isGroupChat
}) => (
	<View
		style={styles.container}
		accessibilityLabel={accessibilityLabel}
	>
		<View>
			<Avatar
				text={avatar}
				size={avatarSize}
				borderRadius={avatarSize/2}
				type={type}
				style={styles.avatar}
				rid={rid}
			/>
			{ type === 'd' ?
				<TypeIcon
					type={type}
					prid={prid}
					status={status}
					isGroupChat={isGroupChat}
					theme={theme}
				/>
			: null}
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
	accessibilityLabel: PropTypes.string,
	avatar: PropTypes.string,
	avatarSize: PropTypes.number,
	type: PropTypes.string,
	theme: PropTypes.string,
	rid: PropTypes.string,
	children: PropTypes.element
};

export default Wrapper;
