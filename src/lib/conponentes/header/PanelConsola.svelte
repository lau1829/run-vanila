<script>
	import { logs } from '$lib/conponentes/editor/app';
	import { tick } from 'svelte';
	import ObjectExplorer from './ObjectExplorer.svelte';

	let { close } = $props();

	let container = $state();

	$effect(() => {
		$logs;
		tick().then(() => {
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		});
	});

	function clearLogs() {
		logs.set([]);
	}
</script>

<aside
	class="z-30 h-full w-80 border-r border-r-zinc-700 bg-zinc-800 p-1 max-sm:fixed max-md:absolute max-md:w-[calc(100dvw-52px)] max-md:right-0 max-sm:w-dvw overflow-auto"
>
	<header class="flex items-center justify-between border-b border-b-zinc-700 p-1.5 px-2">
		<h2 class="text-lg font-bold text-white">Consola</h2>
		<div class="flex items-center gap-2">
			<button
				onclick={clearLogs}
				class="rounded-md p-1 text-neutral-500 transition-colors hover:bg-zinc-700 hover:text-white"
				title="Limpiar consola"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
						d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
					/><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg
				>
			</button>
			<button
				onclick={close}
				class="rounded-md p-1 text-neutral-500 transition-colors hover:bg-zinc-700 hover:text-white md:hidden"
				title="Cerrar panel"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="icon icon-tabler icons-tabler-outline icon-tabler-x"
					><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path
						d="M6 6l12 12"
					/></svg
				>
			</button>
		</div>
	</header>

	<div bind:this={container} class="flex-1 overflow-y-auto p-2 font-mono text-xs">
		{#if $logs.length === 0}
			<div class="py-4 text-center text-neutral-500">No hay registros</div>
		{:else}
			{#each $logs as log}
				<div class="mb-1 flex gap-2 border-b border-zinc-700/50 py-1 last:border-0">
					<span class="shrink-0 text-neutral-500">[{log.timestamp}]</span>
					<div class="flex w-full flex-col gap-1 overflow-hidden">
						{#if log.args}
							{#each log.args as arg}
								<ObjectExplorer value={arg} />
							{/each}
						{:else}
					
							<span
								class="break-all {log.type === 'error'
									? 'text-red-400'
									: log.type === 'warn'
										? 'text-yellow-400'
										: 'text-neutral-300'}"
							>
								{log.message}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</aside>
