import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
	migrations: [
		{
			toVersion: 3,
			steps: [
				addColumns({
					table: 'users',
					columns: [
						{ name: 'statusText', type: 'string', isOptional: true }
					]
				})
			]
		},
		{
			toVersion: 4,
			steps: [
				addColumns({
					table: 'servers',
					columns: [
						{ name: 'last_local_authenticated_session', type: 'number', isOptional: true },
						{ name: 'auto_lock', type: 'boolean', isOptional: true },
						{ name: 'auto_lock_time', type: 'number', isOptional: true },
						{ name: 'biometry', type: 'boolean', isOptional: true }
					]
				})
			]
		},
		{
			toVersion: 5,
			steps: [
				addColumns({
					table: 'servers',
					columns: [
						{ name: 'unique_id', type: 'string', isOptional: true }
					]
				})
			]
		},
		{
			toVersion: 6,
			steps: [
				addColumns({
					table: 'servers',
					columns: [
						{ name: 'enterprise_modules', type: 'string', isOptional: true }
					]
				})
			]
		},
		{
			toVersion: 7,
			steps: [
				addColumns({
					table: 'users',
					columns: [
						{ name: 'login_email_password', type: 'boolean', isOptional: true }
					]
				})
			]
		},
		{
			toVersion: 8,
			steps: [
				addColumns({
					table: 'servers',
					columns: [
						{ name: 'e2e_enable', type: 'boolean', isOptional: true }
					]
				})
			]
		},
		{
			toVersion: 9,
			steps: [
				createTable({
					name: 'servers_history',
					columns: [
						{ name: 'url', type: 'string', isIndexed: true },
						{ name: 'username', type: 'string', isOptional: true },
						{ name: 'updated_at', type: 'number' }
					]
				})
			]
		},
		{
			toVersion: 10,
			steps: [
				addColumns({
					table: 'users',
					columns: [
						{ name: 'show_message_in_main_thread', type: 'boolean', isOptional: true },
						{ name: 'avatar_etag', type: 'string', isOptional: true }
					]
				})
			]
		},
		{
			toVersion: 11,
			steps: [
				createTable({
					name: 'shareslate_users',
					columns: [
						{ name: 'user_id', type: 'string', isIndexed: true },
						{ name: 'token', type: 'string' },
						{ name: 'fname', type: 'string', isOptional: true },
						{ name: 'lname', type: 'string', isOptional: true },
						{ name: 'email', type: 'string', isOptional: true },
						{ name: 'username', type: 'string', isOptional: true },
						{ name: 'contact', type: 'string', isOptional: true },
						{ name: 'country_code', type: 'string', isOptional: true },
						{ name: 'gender', type: 'string', isOptional: true },
						{ name: 'dob', type: 'string', isOptional: true },
						{ name: 'profile_img', type: 'string', isOptional: true },
						{ name: 'color', type: 'string', isOptional: true },
						{ name: 'country', type: 'string', isOptional: true },
						{ name: 'state', type: 'string', isOptional: true },
						{ name: 'city', type: 'string', isOptional: true },
						{ name: 'designation', type: 'string', isOptional: true },
						{ name: 'school', type: 'string', isOptional: true },
						{ name: 'college', type: 'string', isOptional: true },
						{ name: 'employer', type: 'string', isOptional: true },
						{ name: 'friends', type: 'string', isOptional: true }
					]
				})
			]
		}
	]
});
