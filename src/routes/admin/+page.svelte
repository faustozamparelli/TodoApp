<script lang="ts">
	import { onMount } from 'svelte';
	import { getAdminTodos, type Todo } from '$lib/services/todos';
	import { user } from '$lib/stores/auth';
	import { supabase } from '$lib/supabase';

	let todos: Todo[] = [];
	let error: string = '';

	onMount(async () => {
		try {
			// Wait for auth state to be ready
			const {
				data: { session }
			} = await supabase.auth.getSession();

			if (!session) {
				error = 'Please sign in to access this page.';
				return;
			}

			const userEmail = session.user.email;

			if (userEmail === 'fausto.zamparelli@gmail.com') {
				// Check if user is admin via server
				const basePath = window.location.pathname.split('/admin')[0];
				const response = await fetch(`${basePath}/api/check-admin`, {
					headers: {
						Authorization: `Bearer ${session.access_token}`
					}
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();

				if (data.isAdmin) {
					todos = await getAdminTodos();
				} else {
					todos = await getAdminTodos();
				}
			} else {
				error = 'Access denied. You do not have permission to view this page.';
			}
		} catch (err: any) {
			error = 'Failed to load todos: ' + err.message;
		}
	});
</script>

{#if error}
	<p class="error">{error}</p>
{/if}

{#if todos.length > 0}
	<h1>All Todos</h1>
	<ul class="admin-todos">
		{#each todos as todo}
			<li>
				<div class="todo-details">
					<strong>{todo.title}</strong>
					<span class="category">{todo.category}</span>
					<span class="status">{todo.completed ? 'Completed' : 'Pending'}</span>
					<span class="user">Created by: {todo.user_email}</span>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.error {
		color: red;
	}

	.admin-todos {
		width: 100%;
		max-width: 800px;
		padding: 0;
	}

	.admin-todos li {
		margin-bottom: 1rem;
		padding: 0.5rem 1rem;
		border: 1px solid #333;
		list-style: none;
	}

	.todo-details {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.category {
		color: #888;
	}

	.status {
		color: #666;
	}

	.user {
		font-size: 0.8rem;
		color: #aaa;
		margin-top: 0.5rem;
	}
</style>
