<script>
	import { Ajustes } from '$lib/conponentes/editor/app';
	import { AjustesEditor } from '$lib/conponentes/editor/ajustes_app';
	import { themeNames } from 'svelte-monaco';
	import { deviceType } from '$lib/conponentes/editor/app';

	const darkThemes = [
		'active4d',
		'all-hallows-eve',
		'amy',
		'birds-of-paradise',
		'blackboard',
		'brilliance-black',
		'brilliance-dull',
		'cobalt',
		'clouds-midnight',
		'espresso-libre',
		'idle',
		'katzenmilch',
		'lazy',
		'magicwb-amiga',
		'merbivore-soft',
		'merbivore',
		'monokai',
		'monokai-bright',
		'night-owl',
		'oceanic-next',
		'pastels-on-dark',
		'slush-and-poppies',
		'solarized-dark',
		'spacecadet',
		'sunburst',
		'tomorrow-night',
		'tomorrow-night-blue',
		'tomorrow-night-bright',
		'tomorrow-night-eighties',
		'twilight',
		'upstream-sunburst',
		'vibrant-ink',
		'zenburnesque',
		'vs-dark'
	];

	// Temas disponibles para Ace Editor
	const aceThemes = [
		'merbivore',
		'monokai',
		'github'
	];

	import { Toaster, toast } from 'svelte-sonner'
	let { close } = $props();

	// Filter available themes to only include those in our dark list
	let availableThemes = $derived(themeNames.filter((t) => darkThemes.includes(t)));
	
	// Determinar qué editor se está usando actualmente (basado en deviceType y preferencia)
	let editorActual = $derived.by(() => {
		const preferencia = $AjustesEditor.editorPredeterminado;
		
		// Si es automático, decidir según el dispositivo
		if (preferencia === 'automatico') {
			return $deviceType === 'android-touch' ? 'monaco' : 'ace';
		}
		
		// Si es Android táctil, siempre usar Monaco (Ace no funciona bien)
		if ($deviceType === 'android-touch' && preferencia === 'ace') {
			return 'monaco';
		}
		
		// Usar la preferencia del usuario
		return preferencia;
	});
	
	// Mostrar solo ajustes del editor activo
	let mostrarAjustesAce = $derived(editorActual === 'ace');
	let mostrarAjustesMonaco = $derived(editorActual === 'monaco');
	let mostrarAjustesCodeMirror = $derived(editorActual === 'codemirror');

</script>

<aside
	class="z-30 h-full w-80 border-r border-r-zinc-700 bg-zinc-800 p-4 max-sm:fixed max-md:absolute max-md:w-[calc(100dvw-52px)] max-md:right-0 max-sm:w-dvw overflow-auto"
>
	<nav class="flex items-center justify-between">
		<h2 class="mb-4 text-lg font-bold text-white">Configuración</h2>
		<button
			onclick={close}
			class="-mt-4 rounded-md p-1 text-neutral-500 transition-colors hover:bg-zinc-700 hover:text-white xl:hidden"
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
				class="icon icon-tabler icons-tabler-outline icon-tabler-circle-dashed-x"
				><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
					d="M8.56 3.69a9 9 0 0 0 -2.92 1.95"
				/><path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" /><path
					d="M3.69 15.44a9 9 0 0 0 1.95 2.92"
				/><path d="M8.56 20.31a9 9 0 0 0 3.44 .69" /><path
					d="M15.44 20.31a9 9 0 0 0 2.92 -1.95"
				/><path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" /><path
					d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92"
				/><path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" /><path d="M14 14l-4 -4" /><path
					d="M10 14l4 -4"
				/></svg
			>
		</button>
	</nav>
	<div class="flex flex-col gap-6">
		<!-- Editor Predeterminado (solo si no es Android) -->
		{#if $deviceType !== 'android-touch'}
		<article class="flex flex-col gap-2">
			<label for="editorPredeterminado" class="text-xs font-bold text-neutral-500 uppercase">
				Editor Predeterminado
			</label>
			<select
				id="editorPredeterminado"
				bind:value={$AjustesEditor.editorPredeterminado}
				class="w-full rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
			>
				<option value="automatico">Automático (recomendado)</option>
				<option value="ace">Ace Editor</option>
				<option value="monaco">Monaco Editor</option>
				<option value="codemirror">CodeMirror</option>
			</select>
			<span class="text-xs text-neutral-400">
				{#if $AjustesEditor.editorPredeterminado === 'automatico'}
					Usando: {editorActual === 'ace' ? 'Ace' : editorActual === 'monaco' ? 'Monaco' : 'CodeMirror'} (detectado automáticamente)
				{:else}
					Usando: {editorActual === 'ace' ? 'Ace' : editorActual === 'monaco' ? 'Monaco' : 'CodeMirror'}
				{/if}
			</span>
		</article>
		{:else}
		<article class="flex flex-col gap-2">
			<label class="text-xs font-bold text-neutral-500 uppercase">
				Editor Actual
			</label>
			<div class="w-full rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-neutral-400">
				Monaco Editor (Android)
			</div>
			<span class="text-xs text-neutral-400">
				En dispositivos Android se usa Monaco automáticamente
			</span>
		</article>
		{/if}

		<!-- Ajustes para Ace Editor -->
		{#if mostrarAjustesAce}
		<article class="flex flex-col gap-3 border-t border-zinc-700 pt-4">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-bold text-white">Ajustes de Ace Editor</h3>
				{#if $AjustesEditor.editorPredeterminado === 'automatico'}
					<span class="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
						Auto-detectado
					</span>
				{/if}
			</div>
			
			<!-- Tema del Editor Ace -->
			<div class="flex flex-col gap-2">
				<label for="aceTheme" class="text-xs font-bold text-neutral-500 uppercase">Tema</label>
				<select
					id="aceTheme"
					bind:value={$AjustesEditor.ace.theme}
					class="w-full rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
				>
					{#each aceThemes as theme}
						<option value={theme}>{theme}</option>
					{/each}
				</select>
			</div>

			<!-- Tamaño de Fuente Ace -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<label for="aceFontSize" class="text-xs font-bold text-neutral-500 uppercase">
						Tamaño de Fuente
					</label>
					<span class="text-xs text-neutral-400">{$AjustesEditor.ace.fontSize}px</span>
				</div>
				<input
					id="aceFontSize"
					type="range"
					min="10"
					max="30"
					step="1"
					bind:value={$AjustesEditor.ace.fontSize}
					class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-500"
				/>
			</div>

			<!-- Tamaño de Tab Ace -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<label for="aceTabSize" class="text-xs font-bold text-neutral-500 uppercase">
						Tamaño de Tab
					</label>
					<span class="text-xs text-neutral-400">{$AjustesEditor.ace.tabSize}</span>
				</div>
				<input
					id="aceTabSize"
					type="range"
					min="2"
					max="8"
					step="1"
					bind:value={$AjustesEditor.ace.tabSize}
					class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-500"
				/>
			</div>

			<!-- Opciones Ace -->
			<div class="flex flex-col gap-2">
				<label class="text-xs font-bold text-neutral-500 uppercase">Opciones</label>
				
				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Ajuste de línea</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.ace.wordWrap}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Números de línea</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.ace.showLineNumbers}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Resaltar línea activa</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.ace.highlightActiveLine}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Autocompletado en vivo</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.ace.enableLiveAutocompletion}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Snippets</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.ace.enableSnippets}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Emmet</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.ace.enableEmmet}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>
			</div>
		</article>
		{/if}

		<!-- Ajustes para Monaco Editor -->
		{#if mostrarAjustesMonaco}
		<article class="flex flex-col gap-3 border-t border-zinc-700 pt-4">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-bold text-white">Ajustes de Monaco Editor</h3>
				{#if $AjustesEditor.editorPredeterminado === 'automatico'}
					<span class="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
						Auto-detectado
					</span>
				{/if}
			</div>
			
			<!-- Tema del Editor Monaco -->
			<div class="flex flex-col gap-2">
				<label for="monacoTheme" class="text-xs font-bold text-neutral-500 uppercase">Tema</label>
				<select
					id="monacoTheme"
					bind:value={$AjustesEditor.monaco.theme}
					class="w-full rounded-md border border-zinc-700 bg-zinc-900 p-2 text-sm text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
				>
					{#each availableThemes as theme}
						<option value={theme}>{theme}</option>
					{/each}
				</select>
			</div>

			<!-- Tamaño de Fuente Monaco -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<label for="monacoFontSize" class="text-xs font-bold text-neutral-500 uppercase">
						Tamaño de Fuente
					</label>
					<span class="text-xs text-neutral-400">{$AjustesEditor.monaco.fontSize}px</span>
				</div>
				<input
					id="monacoFontSize"
					type="range"
					min="10"
					max="30"
					step="1"
					bind:value={$AjustesEditor.monaco.fontSize}
					class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-500"
				/>
			</div>

			<!-- Tamaño de Tab Monaco -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<label for="monacoTabSize" class="text-xs font-bold text-neutral-500 uppercase">
						Tamaño de Tab
					</label>
					<span class="text-xs text-neutral-400">{$AjustesEditor.monaco.tabSize}</span>
				</div>
				<input
					id="monacoTabSize"
					type="range"
					min="2"
					max="8"
					step="1"
					bind:value={$AjustesEditor.monaco.tabSize}
					class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-500"
				/>
			</div>

			<!-- Opciones del Cursor Monaco -->
			<div class="flex flex-col gap-2">
				<label class="text-xs font-bold text-neutral-500 uppercase">Cursor</label>
				
				<label
					for="cursorStyle"
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Estilo</span>
					<select
						id="cursorStyle"
						bind:value={$AjustesEditor.monaco.cursorStyle}
						class="bg-transparent text-xs text-amber-500 outline-none"
					>
						<option value="line">Línea</option>
						<option value="block">Bloque</option>
						<option value="underline">Subrayado</option>
						<option value="line-thin">Línea Fina</option>
						<option value="block-outline">Contorno</option>
						<option value="underline-thin">Subrayado Fino</option>
					</select>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Animación Suave</span>
					<select
						bind:value={$AjustesEditor.monaco.cursorSmoothCaretAnimation}
						class="bg-transparent text-xs text-amber-500 outline-none"
					>
						<option value="on">Activada</option>
						<option value="off">Desactivada</option>
					</select>
				</label>
			</div>

			<!-- Opciones Monaco -->
			<div class="flex flex-col gap-2">
				<label class="text-xs font-bold text-neutral-500 uppercase">Opciones</label>
				
				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Minimapa</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.monaco.minimap.enabled}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Ajuste de línea</span>
					<select
						bind:value={$AjustesEditor.monaco.wordWrap}
						class="bg-transparent w-28 text-xs text-amber-500 outline-none"
					>
						<option value="on">Activado</option>
						<option value="off">Desactivado</option>
					</select>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Números de línea</span>
					<select
						bind:value={$AjustesEditor.monaco.lineNumbers}
						class="bg-transparent w-28 text-xs text-amber-500 outline-none"
					>
						<option value="on">Visibles</option>
						<option value="off">Ocultos</option>
						<option value="relative">Relativos</option>
					</select>
				</label>
			</div>
		</article>
		{/if}

		<!-- Ajustes para CodeMirror -->
		{#if mostrarAjustesCodeMirror}
		<article class="flex flex-col gap-3 border-t border-zinc-700 pt-4">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-bold text-white">Ajustes de CodeMirror</h3>
				{#if $AjustesEditor.editorPredeterminado === 'automatico'}
					<span class="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
						Auto-detectado
					</span>
				{/if}
			</div>
			
			<!-- Tamaño de Fuente CodeMirror -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<label for="codemirrorFontSize" class="text-xs font-bold text-neutral-500 uppercase">
						Tamaño de Fuente
					</label>
					<span class="text-xs text-neutral-400">{$AjustesEditor.codemirror.fontSize}px</span>
				</div>
				<input
					id="codemirrorFontSize"
					type="range"
					min="10"
					max="30"
					step="1"
					bind:value={$AjustesEditor.codemirror.fontSize}
					class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-500"
				/>
			</div>

			<!-- Tamaño de Tab CodeMirror -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center justify-between">
					<label for="codemirrorTabSize" class="text-xs font-bold text-neutral-500 uppercase">
						Tamaño de Tab
					</label>
					<span class="text-xs text-neutral-400">{$AjustesEditor.codemirror.tabSize}</span>
				</div>
				<input
					id="codemirrorTabSize"
					type="range"
					min="2"
					max="8"
					step="1"
					bind:value={$AjustesEditor.codemirror.tabSize}
					class="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-amber-500"
				/>
			</div>

			<!-- Opciones CodeMirror -->
			<div class="flex flex-col gap-2">
				<label class="text-xs font-bold text-neutral-500 uppercase">Opciones</label>
				
				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Ajuste de línea</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.codemirror.wordWrap}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Números de línea</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.codemirror.showLineNumbers}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Resaltar línea activa</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.codemirror.highlightActiveLine}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Coincidencia de paréntesis</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.codemirror.bracketMatching}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Cerrar paréntesis automáticamente</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.codemirror.closeBrackets}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Autocompletado</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.codemirror.autocompletion}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>

				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Emmet</span>
					<input
						type="checkbox"
						bind:checked={$AjustesEditor.codemirror.emmet}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-zinc-800"
					/>
				</label>
			</div>
		</article>
		{/if}

		<!-- Opciones Generales -->
		<article class="flex flex-col gap-3 border-t border-zinc-700 pt-4">
			<label class="text-xs font-bold text-neutral-500 uppercase">Opciones Generales</label>

			<div class="flex flex-col gap-2">
				<!-- Notificaciones de Consola -->
				<label
					class="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-zinc-700/30"
				>
					<span class="text-sm text-neutral-300">Notificación de consola</span>
					<select
						bind:value={$Ajustes.consoleNotifications}
						class="bg-transparent w-28 text-xs text-amber-500 outline-none"
					>
						<option value="on">Activado</option>
						<option value="off">Desactivado</option>
					</select>
				</label>
			</div>
		</article>
	</div>
</aside>
