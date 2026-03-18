<script>
	import { src, compilar } from '../editor/app';
	import { onMount } from 'svelte';
	let live = $state($src)
	let url = $state('');
	onMount(() => {
		url = window.location.href;
	});
	function onload () {
		live = ""
setTimeout(()=> {
live = $src
},10)
	}
	$effect(()=> {
		$src;
		onload();
	})
</script>

<main class="grid h-full snap-start max-md:grid-rows-[auto_1fr]" id="visualizacion">
	<nav
		class="flex h-13 items-center gap-2 border-b border-b-zinc-700 bg-zinc-800 p-2 text-white md:hidden"
	>
		<a href="#html" class="" title="Volver a editores">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="icon icon-tabler icons-tabler-filled icon-tabler-arrow-big-left-line"
				><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
					d="M9.586 4l-6.586 6.586a2 2 0 0 0 0 2.828l6.586 6.586a2 2 0 0 0 2.18 .434l.145 -.068a2 2 0 0 0 1.089 -1.78v-2.586h5a1 1 0 0 0 1 -1v-6l-.007 -.117a1 1 0 0 0 -.993 -.883l-5 -.001v-2.585a2 2 0 0 0 -3.414 -1.414z"
				/><path
					d="M4.415 12l6.585 -6.586v3.586l.007 .117a1 1 0 0 0 .993 .883l5 -.001v4l-5 .001a1 1 0 0 0 -1 1v3.586l-6.585 -6.586z"
				/><path
					d="M21 8a1 1 0 0 1 .993 .883l.007 .117v6a1 1 0 0 1 -1.993 .117l-.007 -.117v-6a1 1 0 0 1 1 -1z"
				/></svg
			>
		</a>
		<button aria-label="reload"
			class=""
			onclick={() => {
				onload()
			}}
		>
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
				class="icon icon-tabler icons-tabler-outline icon-tabler-reload"
				><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
					d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747"
				/><path d="M20 4v5h-5" /></svg
			>
		</button>
		<input
			type="text"
			value={url}
			class="h-8 w-full rounded-md border-zinc-700 bg-zinc-700/50 ring-0 outline-0"
		/>
	</nav>
	<iframe
		srcdoc={live}
		placeholder="url de la visualizacion"
		title="preview"
		class="h-full w-full bg-white"
		frameborder="0"
	></iframe>
</main>
