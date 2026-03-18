<script>
	import Boton from '$lib/conponentes/botton/botton.svelte';
	import PanelAjustes from './PanelAjustes.svelte';
	import PanelConsola from './PanelConsola.svelte';
	import { logs, html, css, js } from '$lib/conponentes/editor/app';
	import { get } from 'svelte/store';
	import JSZip from 'jszip';
	import Botton from '$lib/conponentes/botton/botton.svelte';
	import { onMount } from 'svelte';
import { Toaster, toast } from 'svelte-sonner'
	let activePanel = $state('none'); // 'none', 'ajustes', 'consola'

	function togglePanel(panel) {
		if (activePanel === panel) {
			activePanel = 'none';
		} else {
			activePanel = panel;
		}
	}

	// Escuchar evento para abrir consola desde notificaciones
	onMount(() => {
		const handleOpenConsole = () => {
			activePanel = 'consola';
		};
		
		window.addEventListener('open-console', handleOpenConsole);
		
		return () => {
			window.removeEventListener('open-console', handleOpenConsole);
		};
	});

	let shareMessage = $state('');
	let showShareMessage = $state(false);

	async function compartirCodigo() {
		try {
			const url = window.location.href;
			await navigator.clipboard.writeText(url);
		
			toast.success('URL copiada al portapapeles')
		} catch (err) {
		
		toast.error(' Error al copiar URL')
	}
	}
	async function downloadZip() {
		const zip = new JSZip();
		const htmlContent = get(html);
		const cssContent = get(css);
		const jsContent = get(js);

		// Create a complete HTML file with the CSS and JS linked
		const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="style.css">
<\/head>
<body>
    ${htmlContent}
    <script src="script.js"><\/script>
<\/body>
<\/html>`;

		zip.file('index.html', fullHtml);
		zip.file('style.css', cssContent);
		zip.file('script.js', jsContent);

		const blob = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'project.zip';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<header class="flex">
	<nav
		class="grid h-full w-13 grid-rows-[1fr_auto] border-r border-r-zinc-700 bg-zinc-800 p-1 text-white max-sm:w-dvw max-sm:grid-cols-[1fr_auto] max-sm:border-b max-sm:border-b-zinc-700"
	>
		<div class="max-sm:justify-nd h-full pb-2 max-sm:flex max-sm:items-center max-sm:pb-0">
			<Boton titulo="Editores" onclick={() => activePanel = 'none'}>
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
					class="icon icon-tabler icons-tabler-outline icon-tabler-files mx-auto"
					><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
						d="M15 3v4a1 1 0 0 0 1 1h4"
					/><path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2" /><path
						d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2"
					/></svg
				>
			</Boton>

			<Boton titulo="Compartir código" onclick={compartirCodigo}>
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
					class="icon icon-tabler icons-tabler-outline icon-tabler-share mx-auto"
					><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg
				>
			</Boton>

			<Boton titulo="Descargar proyecto" onclick={downloadZip}>
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
					class="icon icon-tabler icons-tabler-outline icon-tabler-download mx-auto"
					><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
						d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"
					/><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg
				>
			</Boton>

			<Boton titulo="consola" onclick={() => togglePanel('consola')}>
				<div class="relative">
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
						class="icon icon-tabler icons-tabler-outline icon-tabler-terminal mx-auto"
						><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 7l5 5l-5 5" /><path
							d="M12 19l7 0"
						/></svg
					>
					{#if $logs.some((l) => l.type === 'error')}
						<span class="absolute -top-1 right-2 size-2 animate-pulse rounded-full bg-red-500"
						></span>
					{:else if $logs.length > 0}
						<span class="absolute -top-1 right-1 size-2 rounded-full bg-blue-500"></span>
					{/if}
				</div>
			</Boton>
		</div>
		<div class="max-sm:flex">
			<Boton
				titulo="Abrir en nueva pestaña"
				onclick={() => window.open('/live' + window.location.search, '_blank')}
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
					class="icon icon-tabler icons-tabler-outline icon-tabler-external-link mx-auto"
					><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
						d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"
					/><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg
				>
			</Boton>

			<Boton titulo="ajustes" onclick={() => togglePanel('ajustes')}>
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
					class="icon icon-tabler icons-tabler-outline icon-tabler-settings-2 mx-auto"
					><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
						d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033"
					/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /></svg
				>
			</Boton>
		</div>
	</nav>

	{#if activePanel === 'ajustes'}
		<PanelAjustes close={() => (activePanel = 'none')} />
	{:else if activePanel === 'consola'}
		<PanelConsola close={() => (activePanel = 'none')} />
	{/if}

	<!-- Mensaje de compartir -->
	{#if showShareMessage}
		<div class="fixed top-20 right-4 z-50 animate-fade-in">
			<div class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
				<span>{shareMessage}</span>
			</div>
		</div>
	{/if}
</header>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
</style>
