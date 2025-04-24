<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import Auth from '$lib/components/Auth.svelte';
	import { user } from '$lib/stores/auth';
	import { getTodos, addTodo, updateTodo, deleteTodo, type Todo } from '$lib/services/todos';

	// Writable stores for todoText
	export let todoText = writable<string>('');

	// Writable store for todos
	export const todos = writable<Todo[]>([]);

	let showPopup = false;
	let error = '';

	onMount(async () => {
		// Load todos from database when authenticated
		if ($user) {
			await loadTodos();
			// Show welcome popup on first visit after login
			const hasVisited = localStorage.getItem('hasVisited');
			if (!hasVisited) {
				showPopup = true;
				localStorage.setItem('hasVisited', 'true');
			}
		}
	});

	// Subscribe to user changes to load todos
	$: if ($user) {
		loadTodos();
	}

	async function loadTodos() {
		try {
			const loadedTodos = await getTodos();
			todos.set(loadedTodos);
		} catch (error) {
			console.error('Error loading todos:', error);
			error = 'Failed to load todos';
		}
	}

	function closePopup() {
		showPopup = false;
	}

	// Function to capitalize first letter of a string
	function capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	}

	// Function to add a new todo
	async function handleAddTodo() {
		if ($todoText.trim() && $user) {
			try {
				error = '';
				let text = $todoText.trim();
				let category = 'global';

				// Check for category in the input
				if (text[0] === '!') {
					const newCategory = text.match(/^!\w+\s*/)?.[0]?.slice(1);
					if (newCategory) {
						category = capitalizeFirstLetter(newCategory);
						text = text.replace(/^!\w+\s*/, '');

						// Prevent adding todo if only category is provided
						if (text.trim() === '') {
							error = 'Please enter a todo text after the category';
							return;
						}
					}
				}

				const newTodo = await addTodo(text, category);
				todos.update((currentTodos) => [...currentTodos, newTodo]);
				todoText.set(''); // Clear the input field
			} catch (e: any) {
				console.error('Error adding todo:', e);
				error = e.message || 'Failed to add todo';
			}
		}
	}

	// Add this function to handle keydown events
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			if (!$todoText.trim()) {
				event.preventDefault(); // Prevent submission if input is empty
			} else {
				handleAddTodo(); // Call handleAddTodo when Enter is pressed on non-empty input
			}
		}
	}

	// Function to delete a todo
	async function handleDeleteTodo(id: string) {
		if ($user) {
			try {
				error = '';
				await deleteTodo(id);
				todos.update((currentTodos) => {
					const updatedTodos = currentTodos.filter((todo) => todo.id !== id);
					return updatedTodos;
				});
			} catch (e: any) {
				console.error('Error deleting todo:', e);
				error = e.message || 'Failed to delete todo';
			}
		}
	}

	// Function to toggle the completion status of a todo
	async function handleToggleTodo(todo: Todo) {
		if ($user) {
			try {
				error = '';
				const updatedTodo = await updateTodo(todo.id, { completed: !todo.completed });
				todos.update((currentTodos) =>
					currentTodos.map((t) => (t.id === todo.id ? updatedTodo : t))
				);
			} catch (e: any) {
				console.error('Error updating todo:', e);
				error = e.message || 'Failed to update todo';
			}
		}
	}

	// Group todos by category and sort them
	$: groupedTodos = $todos.reduce(
		(acc, todo) => {
			const category = todo.category.toLowerCase();
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(todo);
			return acc;
		},
		{} as Record<string, Todo[]>
	);

	// Sort categories to put 'global' first
	$: sortedCategories = Object.keys(groupedTodos).sort((a, b) => {
		if (a === 'global') return -1;
		if (b === 'global') return 1;
		return a.localeCompare(b);
	});
</script>

<div class="app-container">
	<div class="content">
		<h1>MINIMAL TODO APP</h1>
		<Auth />

		{#if $user}
			<input
				type="text"
				placeholder="Add a new todo"
				bind:value={$todoText}
				on:keydown={handleKeydown}
			/>
			<div>
				{#each sortedCategories as category}
					{#if category !== 'global'}
						<h1 class="category">{capitalizeFirstLetter(category)}</h1>
					{/if}
					{#each groupedTodos[category] as todo}
						<div class="todo">
							<p class:completed={todo.completed} on:click={() => handleToggleTodo(todo)}>
								{todo.title}
							</p>
							<button class="delete" on:click={() => handleDeleteTodo(todo.id)}>×</button>
						</div>
					{/each}
				{/each}
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		{/if}

		{#if showPopup && $user}
			<div class="popup">
				<h5>Welcome! Just start typing your todos above...</h5>
				<h5>
					In case you want to add categories, start your todo with an exclamation mark !, like this:
				</h5>
				<h5>!school finish history page 121/127</h5>
			</div>
			<button class="close" on:click={closePopup}>Close</button>
		{/if}
	</div>

	<footer>
		<h6 class="by">Provided by Fausto Zamparelli</h6>
	</footer>
</div>

<style>
	:global(body) {
		background-color: #000000;
		color: #ffffff;
		font-family: 'SF Pro Mono';
		font-size: 180%;
		margin: 0;
		padding: 0;
		min-height: 100vh;
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h1 {
		margin-top: 2.5rem;
		margin-bottom: 2.5rem;
	}

	h1.category {
		margin-top: 2.5rem;
		margin-bottom: 2.5rem;
	}

	input {
		font-size: 80%;
		margin-bottom: 3.5rem;
		width: 60%;
		max-width: 800px;
		padding: 0.5rem 1.5rem;
		background: transparent;
		border: 1px solid #ffffff;
		color: #ffffff;
		border-radius: 25px;
	}

	input::placeholder {
		text-align: center;
	}

	div {
		display: grid;
		place-items: center;
		font-size: 100%;
		width: 100%;
	}

	div.todo {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 0;
		margin-bottom: 2.5rem;
		line-height: 1;
		width: 80%;
		max-width: 600px;
		position: relative;
	}

	p {
		margin: 0;
		cursor: pointer;
		text-align: center;
		flex: 1;
		max-width: calc(100% - 30px);
		word-wrap: break-word;
		overflow-wrap: break-word;
		hyphens: auto;
	}

	p:hover {
		color: #cccccc;
	}

	p.completed {
		text-decoration: line-through;
		color: #cccccc;
	}

	button {
		cursor: pointer;
		background-color: #000000;
		color: #ffffff;
		border: 0.5px solid #ffffff;
		border-radius: 10%;
		font-size: 70%;
		margin-left: 10px;
		padding: 10px;
	}

	button.delete {
		position: absolute;
		right: 0;
		border-radius: 35%;
		display: flex;
		font-size: 1.4rem;
		justify-content: center;
		align-items: center;
		width: 18px;
		height: 18px;
		padding: 0;
	}

	button.delete:hover {
		background-color: #ffffff;
		color: #000000;
	}

	button.close {
		margin-top: 1rem;
		position: relative;
		left: 50%;
		transform: translateX(-50%);
	}

	.popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #000000;
		border: 1px solid #ffffff;
		padding: 2rem;
		text-align: center;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.error {
		color: #ff4444;
		margin-top: 1rem;
		font-size: 80%;
	}

	footer {
		text-align: center;
		padding: 1rem;
		margin-top: auto;
	}

	.by {
		margin: 0;
		font-size: 70%;
		color: #cccccc;
	}

	h6,
	h5 {
		margin: 1ex;
		font-weight: lighter;
	}
</style>
