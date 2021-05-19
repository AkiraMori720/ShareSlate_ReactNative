import React from 'react';
import { View, StyleSheet, Text, Keyboard, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import Touchable from 'react-native-platform-touchable';
import FastImage from '@rocket.chat/react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import TextInput from '../presentation/TextInput';
import I18n from '../i18n';
import { CustomIcon } from '../lib/Icons';
import sharedStyles from '../views/Styles';
import { withTheme } from '../theme';
import { themes } from '../constants/colors';
import debounce from '../utils/debounce';
import ShareSlate from '../lib/shareslate';
import Collapsible from './Collapsible';
import { VectorIcon } from '../presentation/VectorIcon';
import { verticalScale } from '../utils/scaling';
import Status from './Status/Status';
import { isIOS } from '../utils/deviceInfo';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	searchBox: {
		alignItems: 'center',
		borderRadius: 10,
		flexDirection: 'row',
		fontSize: 17,
		height: 36,
		margin: 16,
		marginVertical: 10,
		paddingHorizontal: 10,
		flex: 1
	},
	input: {
		flex: 1,
		fontSize: 17,
		marginLeft: 8,
		paddingTop: 0,
		paddingBottom: 0,
		...sharedStyles.textRegular
	},
	cancel: {
		marginRight: 15
	},
	cancelText: {
		...sharedStyles.textRegular,
		fontSize: 17
	},
	scrollView: {
		maxHeight: verticalScale(300)
	},
	itemContainer: {
		width: '100%',
		paddingVertical: 8,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1
	},
	userImage: {
		width: 40,
		height: 40,
		borderRadius: 20
	},
	titleContainer: {
		justifyContent: 'center',
		flexGrow: 1
	},
	name: {
		...sharedStyles.textSemibold,
		fontSize: 18,
		paddingLeft: 15
	},
	location: {
		...sharedStyles.textSemibold,
		fontSize: 18,
		paddingLeft: 15
	},
	status: {
		position: 'absolute',
		bottom: 0,
		right: 0
	},
});

const CancelButton = (onCancelPress, theme) => (
	<Touchable onPress={onCancelPress} style={styles.cancel}>
		<Text style={[styles.cancelText, { color: themes[theme].headerTintColor }]}>{I18n.t('Cancel')}</Text>
	</Touchable>
);

class UserSearchBox extends React.Component {

	static propTypes = {
		onChangeText: PropTypes.func.isRequired,
		onSubmitEditing: PropTypes.func,
		hasCancel: PropTypes.bool,
		onCancelPress: PropTypes.func,
		theme: PropTypes.string,
		inputRef: PropTypes.func,
		testID: PropTypes.string
	};

	constructor(props) {
		super(props);
		this.state = {
			search: [],
		}
	}

	// eslint-disable-next-line react/sort-comp
	search = debounce(async(text) => {
		this.setState({searching: text.length > 0 });
		let result = await ShareSlate.search({ text });

		console.log('search', result);

		this.setState({ search: result });
	}, 300);

	searchSubmit = (event) => {
		Keyboard.dismiss();
		this.search(event.nativeEvent.text);
	}

	cancelSearch = () => {
		Keyboard.dismiss();

		this.setState({ search: [] }, () => {
			this.inputRef.clear();
		});
	};

	renderSearchItem = () => {
		const { theme } = this.props;
		const { search } = this.state;
		const rows = [];
		if (search && search.length) {
			const fontSize = 15;

			search.forEach((m) => {
				rows.push(
					<View style={{ ...styles.itemContainer, backgroundColor: themes[theme].bannerBackground }} key={`group-member-list-${ m._id }`}>
						<View>
							<FastImage
								source={{ uri: m.profile }}
								style={styles.userImage}
							/>
							<Status style={styles.status} size={12} status={m.status??'offline'} />
						</View>
						<View style={styles.titleContainer}>
							<Text style={[styles.name, { fontSize, color: themes[theme].bodyText }]} numberOfLines={1}>{`${m.fname} ${m.lname}`}</Text>
							<Text style={[styles.location, { fontSize, color: themes[theme].auxiliaryText }]} numberOfLines={1}>{m.location}</Text>
						</View>
						<VectorIcon
							type={'Ionicons'}
							name={'person-add-outline'}
							size={20}
							color={themes[theme].auxiliaryText} />
					</View>
				);
			});
		}
		return rows;
	};

	render(){
		const {
			testID, hasCancel, onCancelPress, inputRef, theme, ...props
		} = this.props;
		const { search } = this.state;

		return (
			<SafeAreaView style={{ backgroundColor: themes[theme].headerBackground }} edges={['top', 'left', 'right']}>
				<View
					style={[
						styles.container,
						{ backgroundColor: themes[theme].headerBackground }
					]}
				>
					<View style={[styles.searchBox, { backgroundColor: themes[theme].searchboxBackground }]}>
						<CustomIcon name='search' size={14} color={themes[theme].auxiliaryText} />
						<TextInput
							ref={ref => this.inputRef = ref}
							autoCapitalize='none'
							autoCorrect={false}
							blurOnSubmit
							clearButtonMode='while-editing'
							placeholder={I18n.t('Search_User')}
							returnKeyType='search'
							style={styles.input}
							testID={testID}
							underlineColorAndroid='transparent'
							onChangeText={this.search}
							onSubmitEditing={this.searchSubmit}
							theme={theme}
							{...props}
						/>
					</View>
					{ hasCancel ? CancelButton(this.cancelSearch, theme) : null }
				</View>
				<View style={{ zIndex: 100, width: '100%' }}>
					<Collapsible collapsed={!(search && search.length)}>
						<ScrollView style={styles.scrollView}>
							{this.renderSearchItem()}
						</ScrollView>
					</Collapsible>
				</View>
			</SafeAreaView>
		);
	}
}

export default withTheme(UserSearchBox);
