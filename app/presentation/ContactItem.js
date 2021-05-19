import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ContactAvatar from '../utils/contactAvatar';
import { themes } from '../constants/colors';
import { CustomIcon } from '../lib/Icons';


const ContactItem = React.memo (({
	onPress, theme, contact, icon
}) => (
	<TouchableOpacity
		onPress={onPress}
	>
		<View style={styles.container}>
			<ContactAvatar
				img={
					contact.hasThumbnail
						? { uri: contact.thumbnailPath }
						: undefined
				}
				placeholder={getAvatarInitials(
					`${contact.givenName} ${contact.familyName}`
				)}
				width={48}
				height={48}
			/>
			<View style={{ ...styles.titleContainer }}>
				<Text style={{ ...styles.contactName, color: themes[theme].bodyText}}>{`${contact.displayName}`}</Text>
			</View>
			{icon ? <CustomIcon name={icon} size={22} style={[styles.icon, { color: themes[theme].actionTintColor }]} /> : null}
		</View>
	</TouchableOpacity>
));

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: "center",
		paddingHorizontal: 12
	},
	titleContainer: {
		flexGrow: 1,
		marginLeft: 12,
		paddingVertical: 8,
		justifyContent: 'center'
	},
	contactName: {
		fontSize: 16,
		paddingVertical: 12
	},
	icon: {
		marginHorizontal: 15,
		alignSelf: 'center'
	}
});

const getAvatarInitials = (textString) => {
	if (!textString) return "";

	const text = textString.trim();

	const textSplit = text.split(" ");

	if (textSplit.length <= 1) return text.charAt(0);

	return textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0);
};

export default ContactItem;
