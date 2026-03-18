<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { AjustesEditor } from '$lib/conponentes/editor/ajustes_app';

  let { 
    value = $bindable(''),
    lang = 'html'
  } = $props();

  let editorContainer;
  let editor;
  let unsubscribe;
  
  onMount(async () => {
    if (browser) {
      // Importar Ace Editor directamente
      const ace = await import('ace-builds/src-noconflict/ace');
      await import('ace-builds/src-noconflict/ext-emmet');
      await import('ace-builds/src-noconflict/ext-language_tools');
      await import('ace-builds/src-noconflict/mode-html');
      await import('ace-builds/src-noconflict/mode-css');
      await import('ace-builds/src-noconflict/mode-javascript');
      await import('ace-builds/src-noconflict/mode-sql');
      await import('ace-builds/src-noconflict/theme-merbivore');
      await import('ace-builds/src-noconflict/theme-monokai');
      await import('ace-builds/src-noconflict/theme-github');
      
      // Configurar la ruta de los workers
      ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/');
      
      // Obtener ajustes iniciales
      let currentSettings;
      const unsub = AjustesEditor.subscribe(settings => {
        currentSettings = settings;
      });
      unsub();
      
      // Crear el editor
      editor = ace.edit(editorContainer, {
        mode: `ace/mode/${lang}`,
        theme: `ace/theme/${currentSettings.ace.theme}`,
        value: value,
        fontSize: currentSettings.ace.fontSize,
        tabSize: currentSettings.ace.tabSize,
        showPrintMargin: currentSettings.ace.showPrintMargin,
        highlightActiveLine: currentSettings.ace.highlightActiveLine,
        enableBasicAutocompletion: currentSettings.ace.enableBasicAutocompletion,
        enableSnippets: currentSettings.ace.enableSnippets,
        enableLiveAutocompletion: currentSettings.ace.enableLiveAutocompletion,
        enableEmmet: currentSettings.ace.enableEmmet
      });

      // Aplicar configuraciones iniciales
      editor.setOption('wrap', currentSettings.ace.wordWrap);
      editor.renderer.setOption('showLineNumbers', currentSettings.ace.showLineNumbers);

      // Suscribirse a cambios en los ajustes
      unsubscribe = AjustesEditor.subscribe(settings => {
        if (!editor) return;
        
        // Aplicar todos los ajustes en tiempo real
        editor.setTheme(`ace/theme/${settings.ace.theme}`);
        editor.setFontSize(settings.ace.fontSize);
        editor.session.setTabSize(settings.ace.tabSize);
        editor.setOption('wrap', settings.ace.wordWrap);
        editor.renderer.setOption('showLineNumbers', settings.ace.showLineNumbers);
        editor.setOption('highlightActiveLine', settings.ace.highlightActiveLine);
        editor.setOption('enableBasicAutocompletion', settings.ace.enableBasicAutocompletion);
        editor.setOption('enableSnippets', settings.ace.enableSnippets);
        editor.setOption('enableLiveAutocompletion', settings.ace.enableLiveAutocompletion);
        editor.setOption('enableEmmet', settings.ace.enableEmmet);
        editor.resize();
      });

      // Agregar completers personalizados para CSS
      const cssCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
          if (session.getMode().$id === "ace/mode/css") {
            const completions = [
              // Colores comunes
              { caption: "color", value: "color: ", meta: "property", score: 1000 },
              { caption: "background-color", value: "background-color: ", meta: "property", score: 1000 },
              { caption: "border-color", value: "border-color: ", meta: "property", score: 1000 },
              // Valores de color
              { caption: "red", value: "#ff0000", meta: "color", score: 900 },
              { caption: "blue", value: "#0000ff", meta: "color", score: 900 },
              { caption: "green", value: "#00ff00", meta: "color", score: 900 },
              { caption: "white", value: "#ffffff", meta: "color", score: 900 },
              { caption: "black", value: "#000000", meta: "color", score: 900 },
              { caption: "gray", value: "#808080", meta: "color", score: 900 },
              // Propiedades comunes
              { caption: "display", value: "display: ", meta: "property", score: 1000 },
              { caption: "flex", value: "flex", meta: "value", score: 900 },
              { caption: "grid", value: "grid", meta: "value", score: 900 },
              { caption: "position", value: "position: ", meta: "property", score: 1000 },
              { caption: "margin", value: "margin: ", meta: "property", score: 1000 },
              { caption: "padding", value: "padding: ", meta: "property", score: 1000 },
              { caption: "width", value: "width: ", meta: "property", score: 1000 },
              { caption: "height", value: "height: ", meta: "property", score: 1000 },
            ];
            callback(null, completions);
          }
        }
      };

      // Agregar completers personalizados para JavaScript
      const jsCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
          if (session.getMode().$id === "ace/mode/javascript") {
            const completions = [
              // Métodos comunes
              { caption: "console.log", value: "console.log($1)", meta: "method", score: 1000 },
              { caption: "forEach", value: "forEach((item) => {\n\t$1\n})", meta: "method", score: 1000 },
              { caption: "map", value: "map((item) => $1)", meta: "method", score: 1000 },
              { caption: "filter", value: "filter((item) => $1)", meta: "method", score: 1000 },
              { caption: "reduce", value: "reduce((acc, item) => $1, $2)", meta: "method", score: 1000 },
              // Snippets
              { caption: "function", value: "function ${1:name}(${2:params}) {\n\t$3\n}", meta: "snippet", score: 1000 },
              { caption: "arrow", value: "(${1:params}) => {\n\t$2\n}", meta: "snippet", score: 1000 },
              { caption: "if", value: "if (${1:condition}) {\n\t$2\n}", meta: "snippet", score: 1000 },
              { caption: "for", value: "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t$3\n}", meta: "snippet", score: 1000 },
              { caption: "async", value: "async function ${1:name}(${2:params}) {\n\t$3\n}", meta: "snippet", score: 1000 },
              { caption: "await", value: "await $1", meta: "keyword", score: 1000 },
              { caption: "try-catch", value: "try {\n\t$1\n} catch (error) {\n\t$2\n}", meta: "snippet", score: 1000 },
            ];
            callback(null, completions);
          }
        }
      };

      // Registrar los completers
      const langTools = ace.require("ace/ext/language_tools");
      langTools.addCompleter(cssCompleter);
      langTools.addCompleter(jsCompleter);

      // Escuchar cambios
      editor.session.on('change', () => {
        value = editor.getValue();
      });

      // Compilar cuando cambie el contenido (tiempo real)
      editor.session.on('change', () => {
        if (typeof window !== 'undefined') {
          // Debounce para evitar compilaciones excesivas
          clearTimeout(window.aceCompileTimeout);
          window.aceCompileTimeout = setTimeout(() => {
            // Disparar evento personalizado para que el componente padre compile
            const event = new CustomEvent('acechange');
            window.dispatchEvent(event);
          }, 300);
        }
      });
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (editor) {
      editor.destroy();
    }
  });

  // Actualizar el valor del editor cuando cambie externamente
  $effect(() => {
    if (editor && value !== undefined && editor.getValue() !== value) {
      editor.setValue(value, -1);
    }
  });

  // Actualizar el modo cuando cambie el lenguaje
  $effect(() => {
    if (editor) {
      editor.session.setMode(`ace/mode/${lang}`);
    }
  });
</script>

<div bind:this={editorContainer} class="h-full w-full"></div>
