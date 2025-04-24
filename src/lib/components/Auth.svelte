<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { user } from '$lib/stores/auth';

	let email = '';
	let loading = false;
	let error = '';

	async function handleSignIn() {
		try {
			loading = true;
			error = '';
			const { error: signInError } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: window.location.origin + window.location.pathname
				}
			});
			if (signInError) throw signInError;
			alert('Check your email for the login link!');
			window.close();
		} catch (e: any) {
			error = e.message || 'An error occurred during sign in';
		} finally {
			loading = false;
		}
	}

	async function handleSignOut() {
		try {
			loading = true;
			error = '';
			const { error: signOutError } = await supabase.auth.signOut();
			if (signOutError) throw signOutError;
		} catch (e: any) {
			error = e.message || 'An error occurred during sign out';
		} finally {
			loading = false;
		}
	}

	// Handle the magic link redirect
	async function handleMagicLink() {
		const {
			data: { session },
			error
		} = await supabase.auth.getSession();
		if (error) {
			console.error('Error getting session:', error);
		}
	}

	// Check for magic link on mount
	onMount(() => {
		handleMagicLink();
	});
</script>

{#if $user}
	<div class="auth-container">
		<button on:click={handleSignOut} disabled={loading}>
			{loading ? 'Signing out...' : 'Sign out'}
		</button>
	</div>
{:else}
	<div class="sign-in-container">
		<h2>Sign in to start planning your life</h2>
		<form on:submit|preventDefault={handleSignIn}>
			<input type="email" bind:value={email} placeholder="Enter your email" required />
			<button type="submit" disabled={loading}>
				{loading ? 'Sending link...' : 'Sign in'}
			</button>
		</form>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</div>
{/if}

<style>
	.auth-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 100;
		font-size: 50%;
	}

	.auth-container button {
		padding: 0.25rem 0.5rem;
		background: transparent;
		color: #ffffff;
		border: 1px solid #ffffff;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
		font-size: 1rem;
	}

	.sign-in-container {
		text-align: center;
		width: 100%;
		max-width: 500px;
		margin-top: 2rem;
	}

	h2 {
		font-size: 2rem;
		margin-bottom: 2rem;
		font-weight: normal;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: center;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #ffffff;
		border-radius: 4px;
		background: transparent;
		color: #ffffff;
		width: 100%;
		font-size: 1.5rem;
	}

	.sign-in-container button {
		padding: 0.75rem 2rem;
		background: transparent;
		color: #ffffff;
		border: 1px solid #ffffff;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
		font-size: 1.5rem;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.error {
		color: #ff4444;
		margin-top: 1rem;
		font-size: 80%;
	}
</style>
