import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Remove /todo from the path if it exists
	if (event.url.pathname.startsWith('/todo')) {
		event.url.pathname = event.url.pathname.replace('/todo', '');
	}

	return resolve(event);
};
