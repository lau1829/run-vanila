<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { css, html, Ajustes } from '$lib/conponentes/editor/app';

	let { children } = $props();

	$effect(() => {
		if (typeof window !== 'undefined') {
			// Enforce dark mode always
			document.documentElement.classList.add('dark');
			document.documentElement.style.colorScheme = 'dark';
		}
	});
</script>

<svelte:head
	><link rel="icon" href={favicon} />
	<title>run-vanila</title>
</svelte:head>
{@render children()}
