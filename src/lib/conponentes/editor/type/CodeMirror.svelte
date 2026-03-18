<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { AjustesEditor } from '$lib/conponentes/editor/ajustes_app';

  let { 
    value = $bindable(''),
    lang = 'html'
  } = $props();

  let editorContainer;
  let editorView;
  let unsubscribe;
  let themeCompartment;
  let emmetCompartment;
  
  onMount(async () => {
    if (browser) {
      // Importar CodeMirror y extensiones
      const { EditorView, keymap, lineNumbers } = await import('@codemirror/view');
      const { EditorState, Compartment, EditorSelection } = await import('@codemirror/state');
      const { defaultKeymap, history, historyKeymap } = await import('@codemirror/commands');
      const { html } = await import('@codemirror/lang-html');
      const { css } = await import('@codemirror/lang-css');
      const { javascript } = await import('@codemirror/lang-javascript');
      const { oneDark } = await import('@codemirror/theme-one-dark');
      const { basicSetup } = await import('codemirror');
      const { autocompletion, completeFromList } = await import('@codemirror/autocomplete');
      
      // Crear compartments para el tema y emmet
      themeCompartment = new Compartment();
      emmetCompartment = new Compartment();
      
      // Obtener ajustes iniciales
      let currentSettings;
      const unsub = AjustesEditor.subscribe(settings => {
        currentSettings = settings;
      });
      unsub();
      
      console.log('Initial settings:', currentSettings);
      console.log('Emmet enabled:', currentSettings?.codemirror?.emmet);
      
      // Determinar el lenguaje y configurar Emmet
      let languageExtension;
      let emmetSyntax = null;
      
      switch(lang) {
        case 'html':
          languageExtension = html();
          emmetSyntax = 'html';
          break;
        case 'css':
          languageExtension = css();
          emmetSyntax = 'css';
          break;
        case 'javascript':
          languageExtension = javascript();
          break;
        default:
          languageExtension = javascript();
      }
      
      // Función para obtener extensiones de Emmet
      const getEmmetExtensions = (enabled, syntax) => {
        console.log('getEmmetExtensions called with:', { enabled, syntax });
        if (!enabled || !syntax) {
          console.log('Emmet disabled or no syntax');
          return [];
        }
        
        // Implementación simple de expansión de emmet
        const expandEmmet = (view) => {
          console.log('Tab pressed, checking for emmet expansion');
          const { state } = view;
          const selection = state.selection.main;
          const line = state.doc.lineAt(selection.from);
          const lineText = line.text;
          const beforeCursor = lineText.slice(0, selection.from - line.from);
          
          // Detectar abreviatura (palabra antes del cursor)
          const match = beforeCursor.match(/[\w\-\.\#\[\]]*$/);
          if (!match) {
            console.log('No match found');
            return false;
          }
          
          const abbr = match[0];
          if (!abbr) {
            console.log('Empty abbreviation');
            return false;
          }
          
          console.log('Emmet expansion attempt for:', abbr);
          
          // Expansiones básicas de emmet
          const htmlExpansions = {
            'div': '<div></div>',
            'p': '<p></p>',
            'span': '<span></span>',
            'a': '<a href=""></a>',
            'img': '<img src="" alt="">',
            'input': '<input type="">',
            'button': '<button></button>',
            'form': '<form></form>',
            'ul': '<ul>\n  <li></li>\n</ul>',
            'ol': '<ol>\n  <li></li>\n</ol>',
            'li': '<li></li>',
            'table': '<table>\n  <tr>\n    <td></td>\n  </tr>\n</table>',
            'tr': '<tr></tr>',
            'td': '<td></td>',
            'th': '<th></th>',
            'head': '<head></head>',
            'body': '<body></body>',
            'html': '<html></html>',
            'meta': '<meta>',
            'link': '<link>',
            'style': '<style></style>'
          };
          
          const cssExpansions = {
            'p': 'padding: ;',
            'm': 'margin: ;',
            'w': 'width: ;',
            'h': 'height: ;',
            'bg': 'background: ;',
            'c': 'color: ;',
            'fs': 'font-size: ;',
            'fw': 'font-weight: ;',
            'ta': 'text-align: ;',
            'va': 'vertical-align: ;',
            'd': 'display: ;',
            'pos': 'position: ;',
            'z': 'z-index: ;'
          };
          
          const expansions = syntax === 'html' ? htmlExpansions : cssExpansions;
          const expanded = expansions[abbr];
          
          if (!expanded) {
            console.log('No expansion found for:', abbr, 'in', syntax);
            return false;
          }
          
          console.log('Expanding:', abbr, 'to:', expanded);
          
          // Reemplazar la abreviatura con la expansión
          const from = selection.from - abbr.length;
          view.dispatch({
            changes: {
              from,
              to: selection.from,
              insert: expanded
            },
            selection: EditorSelection.cursor(from + expanded.length)
          });
          
          return true;
        };
        
        const extension = keymap.of([
          {
            key: 'Tab',
            run: expandEmmet
          }
        ]);
        
        console.log('Emmet extension created');
        return [extension];
      };
      
      // Función para crear el tema personalizado
      const createTheme = (settings) => {
        return EditorView.theme({
          "&": {
            fontSize: `${settings.codemirror.fontSize}px`,
            height: "100%"
          },
          ".cm-scroller": {
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            lineHeight: "1.5"
          },
          ".cm-gutters": {
            display: settings.codemirror.showLineNumbers ? "block" : "none"
          },
          ".cm-content": {
            whiteSpace: settings.codemirror.wordWrap ? "pre-wrap" : "pre"
          },
          ".cm-line": {
            tabSize: settings.codemirror.tabSize
          }
        });
      };
      
      // Crear el estado inicial
      const startState = EditorState.create({
        doc: value,
        extensions: [
          // Emmet DEBE ir primero para interceptar Tab antes que basicSetup
          emmetCompartment.of(getEmmetExtensions(currentSettings.codemirror.emmet, emmetSyntax)),
          basicSetup,
          languageExtension,
          // Autocompletado personalizado que se combina con el nativo
          autocompletion({
            override: [
              (context) => {
                if (emmetSyntax === 'html') {
                  const word = context.matchBefore(/[\w\.\-]*/);
                  if (!word || (word.from === word.to && !context.explicit)) {
                    // Retornar null para que continúe con el autocompletado nativo
                    return null;
                  }
                  
                  const htmlSnippets = [
                    { label: 'html5', detail: 'HTML5 boilerplate', apply: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>' },
                    { label: 'div', detail: 'div element', apply: '<div></div>' },
                    { label: 'p', detail: 'paragraph', apply: '<p></p>' },
                    { label: 'span', detail: 'span element', apply: '<span></span>' },
                    { label: 'a', detail: 'anchor link', apply: '<a href=""></a>' },
                    { label: 'img', detail: 'image', apply: '<img src="" alt="">' },
                    { label: 'button', detail: 'button', apply: '<button></button>' },
                    { label: 'input', detail: 'input field', apply: '<input type="">' },
                    { label: 'form', detail: 'form', apply: '<form></form>' },
                    { label: 'ul', detail: 'unordered list', apply: '<ul>\n  <li></li>\n</ul>' },
                    { label: 'ol', detail: 'ordered list', apply: '<ol>\n  <li></li>\n</ol>' },
                    { label: 'li', detail: 'list item', apply: '<li></li>' },
                    { label: 'table', detail: 'table', apply: '<table>\n  <tr>\n    <td></td>\n  </tr>\n</table>' },
                    { label: 'tr', detail: 'table row', apply: '<tr></tr>' },
                    { label: 'td', detail: 'table data', apply: '<td></td>' },
                    { label: 'th', detail: 'table header', apply: '<th></th>' },
                    { label: 'h1', detail: 'heading 1', apply: '<h1></h1>' },
                    { label: 'h2', detail: 'heading 2', apply: '<h2></h2>' },
                    { label: 'h3', detail: 'heading 3', apply: '<h3></h3>' },
                    { label: 'h4', detail: 'heading 4', apply: '<h4></h4>' },
                    { label: 'h5', detail: 'heading 5', apply: '<h5></h5>' },
                    { label: 'h6', detail: 'heading 6', apply: '<h6></h6>' },
                    { label: 'header', detail: 'header', apply: '<header></header>' },
                    { label: 'footer', detail: 'footer', apply: '<footer></footer>' },
                    { label: 'nav', detail: 'navigation', apply: '<nav></nav>' },
                    { label: 'section', detail: 'section', apply: '<section></section>' },
                    { label: 'article', detail: 'article', apply: '<article></article>' },
                    { label: 'aside', detail: 'aside', apply: '<aside></aside>' },
                    { label: 'main', detail: 'main content', apply: '<main></main>' },
                    { label: 'label', detail: 'label', apply: '<label></label>' },
                    { label: 'textarea', detail: 'textarea', apply: '<textarea></textarea>' },
                    { label: 'select', detail: 'select dropdown', apply: '<select>\n  <option></option>\n</select>' },
                    { label: 'option', detail: 'option', apply: '<option></option>' },
                    { label: 'br', detail: 'line break', apply: '<br>' },
                    { label: 'hr', detail: 'horizontal rule', apply: '<hr>' },
                    { label: 'meta', detail: 'meta tag', apply: '<meta>' },
                    { label: 'link', detail: 'link tag', apply: '<link>' }
                  ];
                  
                  const filtered = htmlSnippets.filter(s => s.label.startsWith(word.text));
                  if (filtered.length > 0) {
                    return {
                      from: word.from,
                      options: filtered
                    };
                  }
                }
                // Retornar null para que continúe con el autocompletado nativo
                return null;
              }
            ]
          }),
          oneDark,
          themeCompartment.of(createTheme(currentSettings)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              value = update.state.doc.toString();
              
              // Disparar evento para compilar
              if (typeof window !== 'undefined') {
                clearTimeout(window.codemirrorCompileTimeout);
                window.codemirrorCompileTimeout = setTimeout(() => {
                  const event = new CustomEvent('codemirrorchange');
                  window.dispatchEvent(event);
                }, 300);
              }
            }
          })
        ]
      });
      
      // Crear la vista del editor
      editorView = new EditorView({
        state: startState,
        parent: editorContainer
      });
      
      // Suscribirse a cambios en los ajustes
      unsubscribe = AjustesEditor.subscribe(settings => {
        if (!editorView || !themeCompartment || !emmetCompartment) return;
        
        // Actualizar tema y configuración usando compartments
        editorView.dispatch({
          effects: [
            themeCompartment.reconfigure(createTheme(settings)),
            emmetCompartment.reconfigure(getEmmetExtensions(settings.codemirror.emmet, emmetSyntax))
          ]
        });
      });
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (editorView) {
      editorView.destroy();
    }
  });

  // Actualizar el valor del editor cuando cambie externamente
  $effect(() => {
    if (editorView && value !== undefined) {
      const currentValue = editorView.state.doc.toString();
      if (currentValue !== value) {
        editorView.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value
          }
        });
      }
    }
  });
</script>

<div bind:this={editorContainer} class="h-full w-full codemirror-container"></div>

<style>
  .codemirror-container {
    height: 100%;
    width: 100%;
  }
  
  .codemirror-container :global(.cm-editor) {
    height: 100%;
  }
  
  .codemirror-container :global(.cm-scroller) {
    overflow: auto;
  }
</style>
