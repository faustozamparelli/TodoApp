import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get the current user
export async function getCurrentUser() {
	const {
		data: { user },
		error
	} = await supabase.auth.getUser();
	if (error) throw error;
	return user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
	const user = await getCurrentUser();
	return !!user;
}
