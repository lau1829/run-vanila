import { writable } from "svelte/store"

function persistantenciacion(key, value) {
    // Intentar obtener el valor guardado de localStorage
    const savedValue = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    let initialValue = value;

    if (savedValue) {
        try {
            const parsed = JSON.parse(savedValue);
            // Si el valor es un objeto, lo combinamos con los valores por defecto
            if (typeof parsed === 'object' && parsed !== null && typeof value === 'object') {
                initialValue = { ...value, ...parsed };
            } else {
                initialValue = parsed;
            }
        } catch (e) {
            initialValue = value;
        }
    }

    const { subscribe, set, update } = writable(initialValue)

    const persist = (val) => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(key, JSON.stringify(val));
            } catch (e) {
                console.error('Error saving to localStorage:', e);
            }
        }
    }

    return {
        subscribe,
        set: (newValue) => {
            persist(newValue)
            set(newValue)
        },
        update: (fn) => {
            update((oldValue) => {
                const newValue = fn(oldValue);
                persist(newValue);
                return newValue;
            });
        }
    }
}

// Ajustes específicos del editor
export const AjustesEditor = persistantenciacion("ajustes_editor", {
    editorPredeterminado: 'automatico', // 'automatico', 'ace', 'monaco' o 'codemirror'
    
    // Ajustes para Ace Editor
    ace: {
        theme: 'merbivore',
        fontSize: 16,
        tabSize: 2,
        wordWrap: true,
        showLineNumbers: true,
        showPrintMargin: false,
        highlightActiveLine: true,
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        enableEmmet: true
    },
    
    // Ajustes para Monaco Editor
    monaco: {
        theme: 'merbivore',
        fontSize: 16,
        tabSize: 2,
        wordWrap: 'on',
        lineNumbers: 'on',
        minimap: { enabled: false },
        automaticLayout: true,
        fixedOverflowWidgets: true,
        cursorStyle: 'line',
        cursorSmoothCaretAnimation: 'on'
    },
    
    // Ajustes para CodeMirror
    codemirror: {
        theme: 'oneDark',
        fontSize: 16,
        tabSize: 2,
        wordWrap: true,
        showLineNumbers: true,
        highlightActiveLine: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        emmet: true
    }
})
