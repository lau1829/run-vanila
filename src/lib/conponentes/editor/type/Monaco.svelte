<script lang="ts">
	import Monaco from 'svelte-monaco';
	import Nav from '$lib/conponentes/nav/nav.svelte';
	import { html, css, js, compilar } from '../app';
	import { AjustesEditor } from '../ajustes_app';
	import { emmetHTML, emmetCSS } from 'emmet-monaco-es';

	// Svelte 5: Ejecutar compilación cada vez que cambien los stores
	let monaco: any = $state();

	$effect(() => {
		// Accedemos a los valores para que el efecto sea reactivo a ellos
		$html;
		$css;
		$js;
		compilar();
		
	});
</script>


<aside class="grid h-full transition-all w-full snap-start grid-rows-[auto_1fr] overflow-hidden">
	<Nav />
	<div class="grid snap-x snap-mandatory grid-cols-[100%_100%_100%] overflow-hidden">
		<div id="html" class="h-full w-full snap-start overflow-hidden">
			<Monaco
				bind:monaco
				options={{ language: 'html', ...$AjustesEditor.monaco }}
				theme={$AjustesEditor.monaco.theme}
				bind:value={$html}
				on:ready={(e) => {
					e.detail.onDidChangeModelContent(compilar);
					emmetHTML(monaco);
				}}
			/>
		</div>
		<div id="css" class="h-full w-full snap-start overflow-hidden">
			<Monaco
				bind:monaco
				options={{ language: 'css', ...$AjustesEditor.monaco }}
				theme={$AjustesEditor.monaco.theme}
				bind:value={$css}
				on:ready={(e) => {
					e.detail.onDidChangeModelContent(compilar);
					emmetCSS(monaco);
				}}
			/>
		</div>
		<div id="js" class="h-full w-full snap-start overflow-hidden">
			<Monaco
				options={{
					language: 'typescript',
					...$AjustesEditor.monaco
				}}
				theme={$AjustesEditor.monaco.theme}
				bind:value={$js}
				on:ready={(e) => {
					e.detail.onDidChangeModelContent(compilar);
				}}
			/>
		</div>
	</div>
</aside>

