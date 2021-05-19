import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView, StyleSheet, Image, View, Text } from 'react-native';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import { isEqual } from 'lodash';

import Touch from '../utils/touch';
import KeyboardView from '../presentation/KeyboardView';
import sharedStyles from './Styles';
import scrollPersistTaps from '../utils/scrollPersistTaps';
import { showErrorAlert } from '../utils/info';
import log, { logEvent, events } from '../utils/log';
import I18n from '../i18n';
import Button from '../containers/Button';
import Avatar from '../containers/Avatar';
import { loginRequest as loginRequestAction } from '../actions/login';
import StatusBar from '../containers/StatusBar';
import { themes } from '../constants/colors';
import { withTheme } from '../theme';
import { getUserSelector } from '../selectors/login';
import SafeAreaView from '../containers/SafeAreaView';
import TextInput from '../containers/TextInput';
import { isTablet } from '../utils/deviceInfo';
import Orientation from 'react-native-orientation-locker';
import { VectorIcon } from '../presentation/VectorIcon';
import ShareSlate from '../lib/shareslate';
import Collapsible from '../containers/Collapsible';
import { Select } from '../containers/UIKit/Select';
import debounce from '../utils/debounce';
import EventEmitter from '../utils/events';
import { LISTENER } from '../containers/Toast';

const styles = StyleSheet.create({
	title: {
		fontSize: 24,
		marginTop: 12,
		marginBottom: 8,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	inputContainer: {
		marginVertical: 8
	},
	disabled: {
		opacity: 0.3
	},
	avatarContainer: {
		alignItems: 'center',
		justifyContent: 'center'
	},
	avatarButtons: {
		flexWrap: 'wrap',
		flexDirection: 'row',
		justifyContent: 'flex-start'
	},
	avatarButton: {
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 15,
		marginBottom: 15,
		borderRadius: 2
	},
	cameraAlt: {
		position: 'absolute',
		bottom: 8,
		right: 8,
		padding: 2,
		borderRadius: 12,
		backgroundColor: 'gray'
	},
	textTitles:{
		marginTop: 16,
		marginBottom: 10,
		fontSize: 14,
		...sharedStyles.textSemibold
	},
	saveButton:{
		alignSelf: 'center',
		backgroundColor: '#59ADFF',
		borderRadius: 16,
		marginTop: 16,
		width: 160
	}
});

class FirstProfileSetView extends React.Component {
	static propTypes = {
		navigation: PropTypes.object,
		server: PropTypes.string,
		shareUser: PropTypes.object,
		loginRequest: PropTypes.func,
		token: PropTypes.string,
		theme: PropTypes.string
	}

	constructor(props) {
		super(props);
		this.state = {
			saving: false,
			fname: null,
			lname: null,
			nickname: null,
			location: null,
			designation: 'Student',
			school: null,
			college: null,
			employer: null,
			avatar: {},
			recommend_locations: [],
			designations: [
				{ text: { text: 'Student' }, value: 'Student' },
				{ text: { text: 'Professional' }, value: 'Professional' },
				{ text: { text: 'CEO-Founder' }, value: 'CEO-Founder' },
				{ text: { text: 'CEO-CO-Founder' }, value: 'CEO-CO-Founder' },
				{ text: { text: 'Founder' }, value: 'Founder' },
				{ text: { text: 'CEO' }, value: 'CEO' },
				{ text: { text: 'Others' }, value: 'Others' }
			]
		}
		if (!isTablet) {
			Orientation.lockToPortrait();
		}
	}

	async componentDidMount() {
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (!isEqual(nextState, this.state)) {
			return true;
		}
		if (!isEqual(nextProps, this.props)) {
			return true;
		}
		return false;
	}

	submit = async() => {
		const { fname, lname, nickname, location, designation, school, college, employer, avatar } = this.state;
		const { loginRequest, token, shareUser } = this.props;

		if (!fname.trim() || !lname.trim()) {
			return;
		}

		this.setState({ saving: true });
		try {
			let fields = { fname, lname };
			if(nickname && nickname.length){
				fields.nickname = nickname;
			}
			if(designation && designation.length){
				fields.designation = designation;
			}
			if(school && school.length){
				fields.school = school;
			}
			if(college && college.length){
				fields.college = college;
			}
			if(employer && employer.length){
				fields.employer = employer;
			}
			if(location && location.length){
				fields.location = location;
			}
			if(avatar && avatar.url){
				fields.file = avatar;
			}

			const result = await ShareSlate.saveProfile(fields);

			EventEmitter.emit(LISTENER, { message: result });

			const ss_user = {
				user_id: shareUser.user_id,
				token: shareUser.token
			}

			await loginRequest({ resume: token, ss_user });
		} catch (e) {
			showErrorAlert(e.message, I18n.t('Oops'));
		}
		this.setState({ saving: false });
	}

	pickImage = async() => {
		const options = {
			cropping: true,
			compressImageQuality: 0.8,
			freeStyleCropEnabled: true,
			cropperAvoidEmptySpaceAroundImage: false,
			cropperChooseText: I18n.t('Choose'),
			cropperCancelText: I18n.t('Cancel'),
			includeBase64: true
		};
		try {
			logEvent(events.PROFILE_PICK_AVATAR);
			const response = await ImagePicker.openPicker(options);

			this.setState({
				avatar: { url: response.path, name: response.filename, data: `data:image/jpeg;base64,${ response.data }`, type: response.mime }
			});
		} catch (error) {
			logEvent(events.PROFILE_PICK_AVATAR_F);
			console.warn(error);
		}
	}

	onChangeLocation = debounce( async(text) => {
		try {
			const recommend_locations = await ShareSlate.fetchAddress({text});
			this.setState({ recommend_locations });
		} catch (e) {
			console.log('error', e);
		}
	}, 300);

	render() {
		const {
			fname, lname, nickname, location, designations, designation, school, college, employer, avatar, saving, recommend_locations
		} = this.state;
		const {
			shareUser, theme
		} = this.props;

		return (
			<KeyboardView
				style={{ backgroundColor: themes[theme].auxiliaryBackground }}
				contentContainerStyle={sharedStyles.container}
				keyboardVerticalOffset={128}
			>
				<StatusBar />
				<SafeAreaView testID='first-profile-view'>
					<ScrollView
						contentContainerStyle={sharedStyles.containerScrollView}
						testID='first-profile-set-view'
						{...scrollPersistTaps}
					>
						<Text style={{ ...styles.title, color: themes[theme].titleText }}>Complete Profile</Text>
						<View style={styles.avatarContainer}>
							<Touch
								onPress={this.pickImage}
								theme={theme}
							>
								{
									avatar?.url ?
										<Avatar
											avatar={avatar?.url}
											isStatic={true}
											borderRadius={60}
											size={120}
										/>
										:
										<Image source={{ uri: shareUser.profile_img }} style={{ width: 120, height: 120, borderRadius: 60 }}/>
								}
								<VectorIcon type={'MaterialIcons'} size={18} name={'camera-alt'} color={'white'} style={ styles.cameraAlt }/>
							</Touch>
							<Text style={{ fontSize: 16, marginVertical: 4, fontWeight: 'bold', color: themes[theme].bodyText }}>{shareUser.email}</Text>
							<Text style={{ fontSize: 16, fontWeight: 'bold', color: themes[theme].bodyText }}>{shareUser.username}</Text>
						</View>
						<TextInput
							label='First Name'
							required
							value={fname}
							containerStyle={styles.inputContainer}
							placeholder={I18n.t('First_Name')}
							returnKeyType='next'
							onChangeText={fname => this.setState({ fname })}
							onSubmitEditing={() => {this.lastNameInput.focus();}}
							testID='register-view-firstname'
							theme={theme}
						/>
						<TextInput
							label='Last Name'
							required
							value={lname}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.lastNameInput = e; }}
							placeholder={I18n.t('Last_Name')}
							returnKeyType='next'
							onChangeText={lname => this.setState({ lname })}
							onSubmitEditing={() => {this.nickNameInput.focus();}}
							testID='register-view-lastname'
							theme={theme}
						/>
						<TextInput
							label='Nickname'
							value={nickname}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.nickNameInput = e; }}
							placeholder={I18n.t('Nickname')}
							returnKeyType='next'
							onChangeText={nickname => this.setState({ nickname })}
							onSubmitEditing={() => {this.locationInput.focus();}}
							testID='register-view-nickname'
							theme={theme}
						/>
						<TextInput
							label='Location'
							value={location}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.locationInput = e; }}
							placeholder={'City, State, Country'}
							returnKeyType='next'
							onChangeText={location => {this.setState({ location }); this.onChangeLocation(location);}}
							theme={theme}
						/>
						<Collapsible collapsed={recommend_locations.length > 0}>
							<ScrollView style={styles.scrollView}>
								{
									recommend_locations.map((m) => (
											<View style={{ backgroundColor: themes[theme].bannerBackground }} key={`recommend-location-list-${ m.id }`}>
												<Text style={{ color: themes[theme].bodyText }} numberOfLines={1}>{m.name}</Text>
											</View>
										))
								}
							</ScrollView>
						</Collapsible>
						<Text style={[styles.textTitles, {color: themes[theme].titleText}]}>Designation</Text>
						<Select
							options={designations}
							value={designation}
							placeholder={{text: I18n.t('Please_select_designation')}}
							onChange={designation => this.setState({ designation })}
							theme={theme}
						/>
						<TextInput
							label='School Attended'
							value={school}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.schoolInput = e; }}
							returnKeyType='next'
							onChangeText={school => this.setState({ school })}
							onSubmitEditing={() => {this.collegeInput.focus();}}
							theme={theme}
						/>
						<TextInput
							label='College-University Attended'
							value={college}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.collegeInput = e; }}
							returnKeyType='next'
							onChangeText={college => this.setState({ college })}
							onSubmitEditing={() => {this.professionInput.focus();}}
							theme={theme}
						/>
						<TextInput
							label='Current Profession'
							value={employer}
							containerStyle={styles.inputContainer}
							inputRef={(e) => { this.professionInput = e; }}
							returnKeyType='next'
							onChangeText={employer => this.setState({ employer })}
							onSubmitEditing={() => {this.submit()}}
							theme={theme}
						/>
						<Button
							title={I18n.t('Save_Profile')}
							type='primary'
							onPress={this.submit}
							testID='profile-view-submit'
							loading={saving}
							theme={theme}
							style={styles.saveButton}
						/>
					</ScrollView>
				</SafeAreaView>
			</KeyboardView>
		);
	}
}

const mapStateToProps = state => ({
	server: state.server.server,
	shareUser: state.login.shareUser,
	token: getUserSelector(state).token
});

const mapDispatchToProps = dispatch => ({
	loginRequest: params => dispatch(loginRequestAction(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(FirstProfileSetView));
