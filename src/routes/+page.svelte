<script>
	import Editor from '$lib/conponentes/editor/editor.svelte';
	import Header from '$lib/conponentes/header/header.svelte';
	import Visualizacion from '$lib/conponentes/visualizacion/visualización.svelte';
	import ConsoleNotifications from '$lib/conponentes/ConsoleNotifications.svelte';
	import { Toaster } from 'svelte-sonner';

	// Función para abrir la consola cuando se hace click en una notificación
	function openConsole() {
		// Disparar evento personalizado que el Header escuchará
		window.dispatchEvent(new CustomEvent('open-console'));
	}
</script>

<Toaster position="bottom-right" theme="dark" richColors />
<ConsoleNotifications onOpenConsole={openConsole} />

<main class="flex h-dvh w-dvw bg-zinc-950 max-sm:flex-col overflow-hidden">
	<Header />
	<div class="grid h-full w-full grid-cols-2 snap-x snap-mandatory overflow-hidden bg-neutral-800 max-md:grid-cols-[100%_100%]">
		<Editor />
		<Visualizacion />
	</div>
</main>
