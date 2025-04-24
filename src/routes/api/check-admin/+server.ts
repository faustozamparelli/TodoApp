import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

const ADMIN_EMAIL = 'fausto.zamparelli@gmail.com';

export async function GET({ request, cookies }) {
	try {
		// First, try to get token from Authorization header
		const authHeader = request.headers.get('Authorization');
		let token = null;

		if (authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7);
			console.log('SERVER: Token from auth header exists');
		} else {
			// Fallback to cookie
			token = cookies.get('sb-access-token') || '';
			console.log('SERVER: Token from cookie exists:', !!token);
		}

		if (!token) {
			console.log('SERVER: No token found, trying session');
			// Last resort - try to get session directly
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (!session) {
				return json({ isAdmin: false, reason: 'No authentication found' });
			}

			token = session.access_token;
		}

		// Get user with the token
		const {
			data: { user },
			error
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			console.error('SERVER: Error getting user:', error);
			return json({ isAdmin: false, reason: 'Invalid token or user not found' });
		}

		console.log('SERVER: User email:', user.email);
		console.log('SERVER: Admin email:', ADMIN_EMAIL);
		console.log('SERVER: Email match:', user.email === ADMIN_EMAIL);

		const isAdmin = user.email === ADMIN_EMAIL;
		return json({ isAdmin, email: user.email });
	} catch (error: any) {
		console.error('Error checking admin status:', error);
		return json({ isAdmin: false, reason: 'Error: ' + error.message });
	}
}
