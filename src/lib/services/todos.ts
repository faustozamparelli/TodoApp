import { supabase } from '$lib/supabase';

export interface Todo {
	id: string;
	title: string;
	category: string;
	completed: boolean;
	created_at: string;
	updated_at: string;
	user_id: string;
	user_email?: string;
}

export async function getTodos() {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) throw new Error('User not authenticated');

	const query = supabase.from('todos').select('*').order('created_at', { ascending: false });

	const { data, error } = await query;

	if (error) throw error;
	return data as Todo[];
}

export async function getAdminTodos() {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) throw new Error('User not authenticated');

	// Get all todos with user details
	const { data: todos, error: todosError } = await supabase
		.from('todos')
		.select('*')
		.order('created_at', { ascending: false });

	if (todosError) throw todosError;

	// Since we can't easily join with the auth users,
	// we'll just attach the current user's email to their todos
	// and mark others as 'Other user'
	return todos.map((todo) => ({
		...todo,
		user_email: todo.user_id === user.id ? user.email : `User (${todo.user_id.substring(0, 6)}...)`
	}));
}

export async function addTodo(title: string, category: string = 'global') {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) throw new Error('User not authenticated');

	const { data, error } = await supabase
		.from('todos')
		.insert([
			{
				title,
				category,
				user_id: user.id
			}
		])
		.select()
		.single();

	if (error) throw error;
	return data as Todo;
}

export async function updateTodo(id: string, updates: Partial<Todo>) {
	const { data, error } = await supabase
		.from('todos')
		.update(updates)
		.eq('id', id)
		.select()
		.single();

	if (error) throw error;
	return data as Todo;
}

export async function deleteTodo(id: string) {
	const { error } = await supabase.from('todos').delete().eq('id', id);

	if (error) throw error;
}
