import React from 'react';
import PropTypes from 'prop-types';

import Sort from './Sort';
import Encryption from './Encryption';

import OmnichannelStatus from '../../../ee/omnichannel/containers/OmnichannelStatus';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import styles from '../styles';
import { themes } from '../../../constants/colors';

const Item = React.memo(({
	onPress, image, isActive, theme
}) => (
	<TouchableOpacity onPress={onPress} style={[styles.listItem, { backgroundColor: isActive?themes[theme].tintColor: null }]}>
		<Image source={image} style={[styles.icon, { tintColor: isActive?'white':themes[theme].grayColor }]} />
	</TouchableOpacity>
));

const ListHeader = React.memo(({
	searching,
	isDirectory,
	sortBy,
	toggleSort,
	goEncryption,
	goQueue,
	queueSize,
	inquiryEnabled,
	encryptionBanner,
	user,
	goToNewMessage,
	initSearching,
	goDirectory,
	theme
}) => (
	<View style={[styles.listHeaderContainer, {borderColor: themes[theme].separatorColor}]}>
		<View style={{ flex:1, flexDirection: 'row', justifyContent: 'space-around', marginVertical: 4 }}>
			<Item
				onPress={goToNewMessage}
				image={require('../../../images/icon_new.png')}
				isActive={false}
				theme={theme}
			/>
			<Item
				onPress={initSearching}
				image={require('../../../images/icon_search.png')}
				isActive={searching}
				theme={theme}
			/>
			<Item
				onPress={goDirectory}
				image={require('../../../images/icon_channel.png')}
				isActive={isDirectory}
				theme={theme}
			/>
			<Sort searching={searching} sortBy={sortBy} toggleSort={toggleSort} />
		</View>
	</View>
));

ListHeader.propTypes = {
	searching: PropTypes.bool,
	isDirectory: PropTypes.bool,
	sortBy: PropTypes.string,
	toggleSort: PropTypes.func,
	goEncryption: PropTypes.func,
	goQueue: PropTypes.func,
	queueSize: PropTypes.number,
	inquiryEnabled: PropTypes.bool,
	encryptionBanner: PropTypes.string,
	user: PropTypes.object,
	goToNewMessage: PropTypes.func,
	initSearch: PropTypes.func,
	goDirectory: PropTypes.func,
	theme: PropTypes.string
};

export default ListHeader;
