UPDATE auth.users SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{is_admin}', 'true') WHERE email = 'nicolasquinteros@gmail.com';
