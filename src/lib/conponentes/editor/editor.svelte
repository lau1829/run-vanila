<script lang="ts">
	import Nav from '$lib/conponentes/nav/nav.svelte';
	import { html, css, js, compilar, deviceType } from './app';
	import { AjustesEditor } from './ajustes_app';

	// Componentes de editores (carga dinámica)
	let EditorComponent = $state(null);
	let monacoHtml: any = $state();
	let monacoCss: any = $state();
	let monacoJs: any = $state();

	// Determinar qué editor usar basado en ajustes del usuario o tipo de dispositivo
	let editorSeleccionado = $derived.by(() => {
		const preferencia = $AjustesEditor.editorPredeterminado;
		
		// Si es automático, decidir según el dispositivo
		if (preferencia === 'automatico') {
			return $deviceType === "android-touch" ? 'ace' : 'monaco';
		}
		
		// Usar la preferencia del usuario
		return preferencia;
	});

	// Cargar el componente del editor dinámicamente
	$effect(() => {
		const loadEditor = async () => {
			switch(editorSeleccionado) {
				case 'ace':
					const AceModule = await import('./type/Ace.svelte');
					EditorComponent = AceModule.default;
					break;
				case 'monaco':
					const MonacoModule = await import('svelte-monaco');
					EditorComponent = MonacoModule.default;
					break;
				case 'codemirror':
					const CodeMirrorModule = await import('./type/CodeMirror.svelte');
					EditorComponent = CodeMirrorModule.default;
					break;
			}
		};
		
		loadEditor();
	});

	$effect(() => {
		// Accedemos a los valores para que el efecto sea reactivo a ellos
		$html;
		$css;
		$js;
		compilar();
	});

	// Escuchar cambios de editores para compilar en tiempo real
	if (typeof window !== 'undefined') {
		window.addEventListener('acechange', () => {
			compilar();
		});
		
		window.addEventListener('codemirrorchange', () => {
			compilar();
		});
	}
	
	// Función para manejar Monaco ready para HTML
	const handleMonacoReadyHtml = async (e: any) => {
		if (editorSeleccionado === 'monaco' && e?.detail && monacoHtml) {
			e.detail.onDidChangeModelContent(compilar);
			const { emmetHTML } = await import('emmet-monaco-es');
			emmetHTML(monacoHtml);
		}
	};
	
	// Función para manejar Monaco ready para CSS
	const handleMonacoReadyCss = async (e: any) => {
		if (editorSeleccionado === 'monaco' && e?.detail && monacoCss) {
			e.detail.onDidChangeModelContent(compilar);
			const { emmetCSS } = await import('emmet-monaco-es');
			emmetCSS(monacoCss);
		}
	};
	
	// Función para manejar Monaco ready para JS
	const handleMonacoReadyJs = async (e: any) => {
		if (editorSeleccionado === 'monaco' && e?.detail) {
			e.detail.onDidChangeModelContent(compilar);
		}
	};
</script>


<aside class="grid h-full transition-all w-full snap-start grid-rows-[auto_1fr] overflow-hidden">
	<Nav />

	<div class="grid snap-x snap-mandatory grid-cols-[100%_100%_100%] overflow-hidden">
		{#if EditorComponent}
			<!-- HTML Editor -->
			<div id="html" class="h-full w-full snap-start overflow-hidden">
				{#if editorSeleccionado === 'monaco'}
					<EditorComponent 
						bind:monaco={monacoHtml}
						options={{ language: 'html', ...$AjustesEditor.monaco }}
						theme={$AjustesEditor.monaco.theme}
						bind:value={$html}
						on:ready={handleMonacoReadyHtml}
					/>
				{:else}
					<EditorComponent 
						bind:value={$html} 
						lang="html"
					/>
				{/if}
			</div>
			
			<!-- CSS Editor -->
			<div id="css" class="h-full w-full snap-start overflow-hidden">
				{#if editorSeleccionado === 'monaco'}
					<EditorComponent 
						bind:monaco={monacoCss}
						options={{ language: 'css', ...$AjustesEditor.monaco }}
						theme={$AjustesEditor.monaco.theme}
						bind:value={$css}
						on:ready={handleMonacoReadyCss}
					/>
				{:else}
					<EditorComponent 
						bind:value={$css} 
						lang="css"
					/>
				{/if}
			</div>
			
			<!-- JavaScript Editor -->
			<div id="js" class="h-full w-full snap-start overflow-hidden">
				{#if editorSeleccionado === 'monaco'}
					<EditorComponent 
						bind:monaco={monacoJs}
						options={{ language: 'typescript', ...$AjustesEditor.monaco }}
						theme={$AjustesEditor.monaco.theme}
						bind:value={$js}
						on:ready={handleMonacoReadyJs}
					/>
				{:else}
					<EditorComponent 
						bind:value={$js} 
						lang="javascript"
					/>
				{/if}
			</div>
		{:else}
			<!-- Loading placeholder -->
			<div class="flex items-center justify-center h-full w-full col-span-3">
				<div class="text-neutral-400">Cargando editor...</div>
			</div>
		{/if}
	</div>
</aside>

