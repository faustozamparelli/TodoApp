import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase';

export const user = writable<User | null>(null);
export const loading = writable(true);

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
	if (event === 'SIGNED_IN') {
		user.set(session?.user ?? null);
	} else if (event === 'SIGNED_OUT') {
		user.set(null);
	}
	loading.set(false);
});

// Check for existing session on page load
supabase.auth.getSession().then(({ data: { session } }) => {
	user.set(session?.user ?? null);
	loading.set(false);
});
