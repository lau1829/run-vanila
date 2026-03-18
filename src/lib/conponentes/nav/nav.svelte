<script>
	import { onMount } from 'svelte';
	let active = 'html';
	onMount(() => {
		const validateHash = () => {
			let hash = window.location.hash.slice(1);
			if (['html', 'css', 'js', 'visualizacion'].includes(hash)) {
				active = hash;
			} else {
				window.location.hash = '#html';
				active = 'html';
			}
		};

		// Validar al montar
		validateHash();

		addEventListener('hashchange', validateHash);

		return () => removeEventListener('hashchange', validateHash);
	});
</script>

<nav class="flex w-full items-center justify-between">
	<a
		href="#html"
		class="w-full border-b {active === 'html'
			? 'border-b-amber-700 bg-zinc-900'
			: 'border-b-transparent'} p-2 text-center text-white transition-all">index.html</a
	>
	<a
		href="#css"
		class="w-full border-b {active === 'css'
			? 'border-b-blue-700 bg-zinc-900'
			: 'border-b-transparent'}  ransition-all p-2 text-center text-white">style.css</a
	>
	<a
		href="#js"
		class="w-full border-b {active === 'js'
			? 'border-b-yellow-700 bg-zinc-900'
			: 'border-b-transparent'}  ransition-all p-2 text-center text-white">app.js</a
	>
	<a href="#visualizacion" class="w-30 p-2 text-white hover:bg-zinc-900/40 md:hidden" title="Ver visualización">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.25"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-right mx-auto"
			><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 7l5 5l-5 5" /><path
				d="M13 7l5 5l-5 5"
			/></svg
		>
	</a>
</nav>
