import { Model } from '@nozbe/watermelondb';
import { field, json } from '@nozbe/watermelondb/decorators';

import { sanitizer } from '../../utils';

export default class ShareSlateUser extends Model {
	static table = 'shareslate_users';

	@field('user_id') user_id;

	@field('token') token;

	@field('fname') fname;

	@field('lname') lname;

	@field('email') email;

	@field('username') username;

	@field('contact') contact;

	@field('country_code') country_code;

	@field('gender') gender;

	@field('dob') dob;

	@field('profile_img') profile_img;

	@field('color') color;

	@field('country') country;

	@field('state') state;

	@field('city') city;

	@field('designation') designation;

	@field('school') school;

	@field('college') college;

	@field('employer') employer;

	@json('friends', sanitizer) friends;

}
