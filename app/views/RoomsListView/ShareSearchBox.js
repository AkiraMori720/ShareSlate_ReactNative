import React, { PureComponent } from 'react';
import {
	View, Animated, Easing
} from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import TextInput from '../../presentation/TextInput';

const ANIMATION_DURATION = 1000;

class ShareSearchBox extends PureComponent {
	static propTypes = {
		theme: PropTypes.string,
		onChange: PropTypes.func
	}

	constructor(props) {
		super(props);
		this.animatedValue = new Animated.Value(0);
	}

	componentDidMount() {
		Animated.timing(
			this.animatedValue,
			{
				toValue: 1,
				duration: ANIMATION_DURATION,
				easing: Easing.inOut(Easing.quad),
				useNativeDriver: true
			}
		).start();
	}

	render() {
		const heightDestination =  0;
		const translateY = this.animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [-120, heightDestination]
		});
		const { onChange, theme } = this.props;

		return (
			<Animated.View
				style={[
					styles.searchDropdownContainer,
					{
						transform: [{ translateY }]
					}
				]}
			>
				<View style={styles.searchContainer}>
					<TextInput
						autoFocus
						style={styles.searchText}
						placeholder='Search'
						onChangeText={onChange}
						theme={theme}
						testID='rooms-list-view-search-input'
					/>
				</View>
			</Animated.View>
		);
	}
}

export default ShareSearchBox;
