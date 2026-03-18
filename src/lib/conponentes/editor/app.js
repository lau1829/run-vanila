import { writable, get } from "svelte/store"

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
                // Limitar el tamaño del historial si es un array
                let valueToSave = val;
                
                if (Array.isArray(val) && key.includes('historial')) {
                    // Mantener solo los últimos 20 mensajes para evitar QuotaExceededError
                    if (val.length > 20) {
                        valueToSave = val.slice(-20);
                        console.log(`⚠️ Historial limitado a 20 mensajes para ahorrar espacio`);
                    }
                }
                
                const jsonString = JSON.stringify(valueToSave);
                
                // Verificar tamaño antes de guardar (límite ~5MB en localStorage)
                const sizeInBytes = new Blob([jsonString]).size;
                const sizeInMB = sizeInBytes / (1024 * 1024);
                
                if (sizeInMB > 4) {
                    console.warn(`⚠️ Datos muy grandes (${sizeInMB.toFixed(2)}MB). Limpiando...`);
                    
                    if (Array.isArray(valueToSave)) {
                        // Reducir aún más si es necesario
                        valueToSave = valueToSave.slice(-10);
                        localStorage.setItem(key, JSON.stringify(valueToSave));
                    }
                } else {
                    localStorage.setItem(key, jsonString);
                }
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.error('❌ localStorage lleno. Limpiando historial antiguo...');
                    
                    // Intentar limpiar datos antiguos
                    if (Array.isArray(val)) {
                        try {
                            // Guardar solo los últimos 5 mensajes
                            const reduced = val.slice(-5);
                            localStorage.setItem(key, JSON.stringify(reduced));
                            console.log('✓ Historial reducido a 5 mensajes');
                        } catch (e2) {
                            console.error('❌ No se pudo guardar el historial:', e2);
                            // Como último recurso, limpiar completamente
                            localStorage.removeItem(key);
                        }
                    }
                } else {
                    console.error('Error saving to localStorage:', e);
                }
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

// Detectar tipo de dispositivo
function detectDeviceType() {
    if (typeof window === 'undefined') return 'pc';
    
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Detectar Android específicamente
    if (userAgent.includes('android') && hasTouch) {
        return 'android-touch';
    }
    
    // Detectar otros dispositivos táctiles (iOS, tablets, etc.)
    if (hasTouch && (userAgent.includes('mobile') || userAgent.includes('tablet'))) {
        return 'mobile-touch';
    }
    
    // Por defecto, asumir PC de escritorio
    return 'pc';
}

export let html = writable('')
export let css = writable('')
export let js = writable('')

export let packages = writable({})
export let src = writable("")
export const logs = writable([])
export const deviceType = writable(detectDeviceType())

export const Ajustes = persistantenciacion("ajustes", {
    theme: "merbivore",
    appTheme: "dark",
    automaticLayout: true,
    fixedOverflowWidgets: true,
    fontSize: 16,
    minimap: { enabled: false },
    lineNumbers: 'on',
    wordWrap: 'on',
    tabSize: 2,
    cursorStyle: 'line',
    cursorSmoothCaretAnimation: "on",
    consoleNotifications: 'on',
})

if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'log') {
            logs.update(l => [...l, event.data.payload])
        }
    })
}

export function compilar() {
    console.log('Compilando nuevo código...');
    src.set("")
    logs.set([]) // Limpiar consola al compilar
    let htmlContent = get(html)
    let cssContent = get(css)
    let jsContent = get(js)
    let packagesContent = get(packages)

    // Construct Import Map
    const imports = {};
    for (const [name, url] of Object.entries(packagesContent)) {
        imports[name] = url;
    }
    const importMap = JSON.stringify({ imports }, null, 2);

    const fullSrc = `
        <head>
            <style>${cssContent}</style>
            <script type="importmap">
                ${importMap}
            <\/script>
        </head>
        <body>
            ${htmlContent}
            <script>
                (function() {
                    const originalLog = console.log;
                    const originalError = console.error;
                    const originalWarn = console.warn;

                    const serialize = (obj, seen = new WeakSet()) => {
                        if (obj === null) return null;
                        if (typeof obj === 'function') return '[Function: ' + (obj.name || 'anonymous') + ']';
                        if (typeof obj !== 'object') return obj;

                        if (seen.has(obj)) return '[Circular]';
                        seen.add(obj);

                        if (obj instanceof Element) {
                            return '[HTML' + obj.tagName + 'Element]';
                        }

                        if (Array.isArray(obj)) {
                            return obj.map(item => serialize(item, seen));
                        }

                        const copy = {};
                        for (const key in obj) {
                            copy[key] = serialize(obj[key], seen);
                        }
                        return copy;
                    };

                    const sendToParent = (type, args) => {
                        window.parent.postMessage({
                            type: 'log',
                            payload: {
                                type,
                                args: args.map(arg => serialize(arg)),
                                timestamp: new Date().toLocaleTimeString()
                            }
                        }, '*');
                    };

                    console.log = (...args) => {
                        sendToParent('log', args);
                        originalLog.apply(console, args);
                    };
                    console.error = (...args) => {
                        sendToParent('error', args);
                        originalError.apply(console, args);
                    };
                    console.warn = (...args) => {
                        sendToParent('warn', args);
                        originalWarn.apply(console, args);
                    };

                    window.onerror = (msg, url, line, col, error) => {
                        sendToParent('error', [msg + ' (line ' + line + ')']);
                    };
                })();
            <\/script>
            <script type="module">${jsContent}<\/script>
        </body>
    `
    src.set(fullSrc)
}

if (typeof window !== 'undefined') {
    // --- URL Sharing Logic Mejorado ---
    let LZString;
    import('lz-string').then((module) => {
        LZString = module.default;
        updateFromUrl();
    });

    const utoa = (str) => btoa(unescape(encodeURIComponent(str)));
    const atou = (str) => decodeURIComponent(escape(atob(str)));

    // Generar ID único corto
    function generateShortId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Guardar código en localStorage con ID
    function saveToLocalStorage(state) {
        const id = generateShortId();
        const key = `box-code-share-${id}`;
        try {
            localStorage.setItem(key, JSON.stringify(state));
            // Limpiar códigos antiguos (más de 7 días)
            cleanOldShares();
            return id;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return null;
        }
    }

    // Limpiar shares antiguos
    function cleanOldShares() {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('box-code-share-')) {
                try {
                    const timestamp = parseInt(key.split('-')[3], 36);
                    if (now - timestamp > maxAge) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Ignorar errores de parsing
                }
            }
        }
    }

    // Cargar código desde localStorage por ID
    function loadFromLocalStorage(id) {
        const key = `box-code-share-${id}`;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    }

    const updateFromUrl = () => {
        if (!LZString) return;

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const shareId = params.get('id');

        // Prioridad 1: Cargar desde ID de localStorage
        if (shareId) {
            const state = loadFromLocalStorage(shareId);
            if (state) {
                if (Array.isArray(state)) {
                    html.set(state[0] || '');
                    css.set(state[1] || '');
                    js.set(state[2] || '');
                    packages.set(state[3] || {});
                } else {
                    if (state.html !== undefined) html.set(state.html);
                    if (state.css !== undefined) css.set(state.css);
                    if (state.js !== undefined) js.set(state.js);
                    if (state.packages !== undefined) packages.set(state.packages);
                }
                compilar();
                return;
            }
        }

        // Prioridad 2: Cargar desde URL comprimida (legacy)
        if (code) {
            try {
                let decodedStr = LZString.decompressFromEncodedURIComponent(code);

                if (!decodedStr) {
                    try {
                        decodedStr = atou(code);
                    } catch (legacyError) {
                        console.error('Failed to decode legacy URL', legacyError);
                        return;
                    }
                }

                if (decodedStr) {
                    const decoded = JSON.parse(decodedStr);
                    if (Array.isArray(decoded)) {
                        html.set(decoded[0] || '');
                        css.set(decoded[1] || '');
                        js.set(decoded[2] || '');
                        packages.set(decoded[3] || {});
                    } else {
                        if (decoded.html !== undefined) html.set(decoded.html);
                        if (decoded.css !== undefined) css.set(decoded.css);
                        if (decoded.js !== undefined) js.set(decoded.js);
                        if (decoded.packages !== undefined) packages.set(decoded.packages);
                    }
                    compilar();
                }
            } catch (e) {
                console.error('Failed to load code from URL', e);
            }
        }
    };

    let timeout;
    const MAX_URL_LENGTH = 2000; // Límite seguro para URLs

    const updateUrl = () => {
        if (!LZString) return;

        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const state = [
                get(html),
                get(css),
                get(js),
                get(packages)
            ];

            try {
                // Intentar comprimir y usar en URL
                const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(state));
                const testUrl = `${window.location.origin}${window.location.pathname}?code=${encoded}`;

                if (testUrl.length < MAX_URL_LENGTH) {
                    // URL es suficientemente corta, usar método tradicional
                    const url = new URL(window.location);
                    url.searchParams.delete('id');
                    url.searchParams.set('code', encoded);
                    window.history.replaceState(null, '', url);
                } else {
                    // URL muy larga, usar localStorage con ID
                    const shareId = saveToLocalStorage(state);
                    if (shareId) {
                        const url = new URL(window.location);
                        url.searchParams.delete('code');
                        url.searchParams.set('id', shareId);
                        window.history.replaceState(null, '', url);
                    }
                }
            } catch (e) {
                console.warn('Error updating URL:', e);
            }
        }, 500);
    };

    html.subscribe(updateUrl);
    css.subscribe(updateUrl);
    js.subscribe(updateUrl);
    packages.subscribe(updateUrl);

    compilar();
}