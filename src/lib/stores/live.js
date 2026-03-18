import { writable, get } from 'svelte/store';

// UI State
export const isChatOpen = writable(false);

// Chat History Persistence Logic
const createPersistentChatHistory = () => {
    const { subscribe, set, update } = writable([]);

    let currentKey = null;

    const loadFromStorage = (key) => {
        if (!key) return [];
        try {
            const stored = localStorage.getItem(`chat_history_${key}`);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Failed to load chat history', e);
            return null;
        }
    };

    const saveToStorage = (key, value) => {
        if (!key) return;
        try {
            localStorage.setItem(`chat_history_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save chat history', e);
        }
    };

    return {
        subscribe,
        set: (val) => {
            set(val);
            if (currentKey) saveToStorage(currentKey, val);
        },
        update: (fn) => {
            const newValue = fn(get({ subscribe }));
            set(newValue);
            if (currentKey) saveToStorage(currentKey, newValue);
        },
        // Helper to switch context based on URL code
        init: (code) => {
            currentKey = code;
            const history = loadFromStorage(code);
            if (history) {
                set(history);
            } else {
                // Default welcome message for new chats
                set([{
                    role: 'assistant',
                    content: 'Hola 👋. Soy tu copiloto en modo lectura. ¿En qué puedo ayudarte a mejorar esta página hoy?',
                    timestamp: Date.now()
                }]);
            }
        }
    };
};

export const chatHistory = createPersistentChatHistory();

// Visual Animations Queue
// Format: { id: string, fileName: string, finalCode: string, state: 'loading' | 'writing' | 'done', displayCode: string }
export const activeEdits = writable([]);

export const addEdit = (fileName, finalCode, onComplete) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    activeEdits.update(edits => [
        ...edits,
        {
            id,
            fileName,
            finalCode,
            state: 'loading',
            displayCode: '',
            onComplete // Store the callback
        }
    ]);
    return id;
};
