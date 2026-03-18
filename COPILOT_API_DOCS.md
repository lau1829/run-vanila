# 🤖 Box Code Copilot API - Documentación

## 📋 Resumen

La **Copilot API** es una API centralizada que maneja todas las interacciones con el asistente de IA en Box Code. Proporciona un sistema de eventos, gestión de estado, comandos slash, y manejo inteligente de código.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    agente.svelte                        │
│  (UI del chat - solo presentación y eventos de UI)     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  copilot-api.js                         │
│  • Gestión de estado (copilotState store)              │
│  • Sistema de eventos (EventEmitter)                    │
│  • Comandos slash (/explain, /fix, etc.)               │
│  • Inyección y edición de código                       │
│  • Gestión de historial con límite                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     ai.js                               │
│  • Sistema multi-proveedor (Groq, OpenRouter, Gemini)  │
│  • Fallback automático entre proveedores               │
│  • Streaming en tiempo real                            │
│  • Instrucciones del sistema                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 rendermark.js                           │
│  • Renderizado de markdown                             │
│  • Detección de bloques de código                      │
│  • Sintaxis especial para edición de líneas            │
│  • Auto-inyección de código                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Características Principales

### 1. **Estado Centralizado** (`copilotState`)

```javascript
{
  isOpen: false,           // Panel abierto/cerrado
  isLoading: false,        // Generando respuesta
  currentProvider: null,   // Proveedor actual (groq/openrouter/gemini)
  messages: [],            // Historial de mensajes
  streamingContent: '',    // Contenido en streaming
  error: null,             // Último error
  context: {               // Contexto del código actual
    html: '',
    css: '',
    js: ''
  }
}
```

### 2. **Sistema de Eventos**

```javascript
// Tipos de eventos disponibles
EventTypes = {
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  STREAMING_START: 'streaming_start',
  STREAMING_CHUNK: 'streaming_chunk',
  STREAMING_END: 'streaming_end',
  STREAMING_ERROR: 'streaming_error',
  CODE_INJECTED: 'code_injected',
  CODE_EDITED: 'code_edited',
  CODE_COMPILED: 'code_compiled',
  COMMAND_EXECUTED: 'command_executed',
  FILE_REFERENCED: 'file_referenced',
  PANEL_OPENED: 'panel_opened',
  PANEL_CLOSED: 'panel_closed',
  HISTORY_CLEARED: 'history_cleared'
}

// Suscribirse a eventos
copilotEvents.on(EventTypes.MESSAGE_RECEIVED, (data) => {
  console.log('Mensaje recibido:', data);
});

// Emitir eventos
copilotEvents.emit(EventTypes.CODE_INJECTED, {
  language: 'html',
  code: '<h1>Hola</h1>',
  timestamp: Date.now()
});
```

### 3. **Comandos Slash**

```javascript
Commands = {
  EXPLAIN: '/explain',      // Explicar código
  FIX: '/fix',             // Corregir errores
  OPTIMIZE: '/optimize',   // Optimizar código
  DOCUMENT: '/document',   // Agregar documentación
  TEST: '/test',           // Generar tests
  REFACTOR: '/refactor',   // Refactorizar
  NEW: '/new',             // Crear nuevo proyecto
  CLEAR: '/clear'          // Limpiar chat
}
```

**Uso:**
```
/explain ¿Qué hace esta función?
/fix Hay un error en la línea 25
/optimize Este código es muy lento
```

### 4. **Gestión de Historial con Límite**

- **Límite:** 20 mensajes máximo
- **Auto-limpieza:** Si excede 4MB, reduce a 10 mensajes
- **Persistencia:** Guarda en `localStorage` automáticamente
- **Protección:** Maneja `QuotaExceededError` de forma inteligente

---

## 🔧 API Pública

### `CopilotAPI.init()`
Inicializa el Copilot, carga historial y contexto.

```javascript
CopilotAPI.init();
```

### `CopilotAPI.sendMessage(message, options)`
Envía un mensaje al asistente.

```javascript
await CopilotAPI.sendMessage("Crea un botón azul");
```

### `CopilotAPI.cancelGeneration()`
Cancela la generación actual.

```javascript
CopilotAPI.cancelGeneration();
```

### `CopilotAPI.clearHistory()`
Limpia el historial de mensajes.

```javascript
await CopilotAPI.clearHistory();
```

### `CopilotAPI.injectCode(language, code)`
Inyecta código en el editor.

```javascript
CopilotAPI.injectCode('html', '<h1>Hola Mundo</h1>');
```

### `CopilotAPI.editCodeLines(language, startLine, endLine, newCode)`
Edita líneas específicas de código.

```javascript
CopilotAPI.editCodeLines('css', 5, 7, `
  background: blue;
  color: white;
`);
```

### `CopilotAPI.updateContext()`
Actualiza el contexto del código actual.

```javascript
CopilotAPI.updateContext();
```

### `CopilotAPI.getStats()`
Obtiene estadísticas de uso.

```javascript
const stats = CopilotAPI.getStats();
// {
//   totalMessages: 10,
//   userMessages: 5,
//   assistantMessages: 5,
//   providers: { groq: 3, openrouter: 2 },
//   commands: { '/explain': 2, '/fix': 1 }
// }
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Suscribirse a eventos

```javascript
import { copilotEvents, EventTypes } from '$lib/services/copilot-api';

// Cuando se recibe un mensaje
copilotEvents.on(EventTypes.MESSAGE_RECEIVED, (data) => {
  console.log('✓ Respuesta recibida:', data.content);
  console.log('✓ Proveedor:', data.provider);
});

// Cuando se inyecta código
copilotEvents.on(EventTypes.CODE_INJECTED, (data) => {
  console.log(`✓ Código ${data.language} inyectado`);
});
```

### Ejemplo 2: Enviar mensaje con comando

```javascript
import CopilotAPI from '$lib/services/copilot-api';

// El comando se procesa automáticamente
await CopilotAPI.sendMessage('/explain ¿Qué hace este código?');
```

### Ejemplo 3: Editar líneas específicas

```javascript
import CopilotAPI from '$lib/services/copilot-api';

// Editar líneas 10-15 del CSS
CopilotAPI.editCodeLines('css', 10, 15, `
  .button {
    background: blue;
    color: white;
    padding: 10px 20px;
  }
`);
```

---

## 🎨 Integración con UI (agente.svelte)

```svelte
<script>
import CopilotAPI, { copilotState } from '$lib/services/copilot-api';

// Suscribirse al estado
let state = $state($copilotState);

$effect(() => {
  const unsubscribe = copilotState.subscribe(value => {
    state = value;
  });
  return unsubscribe;
});

// Enviar mensaje
async function enviar() {
  await CopilotAPI.sendMessage(mensaje);
}
</script>

<!-- Mostrar mensajes -->
{#each state.messages as msg}
  <div>{msg.content}</div>
{/each}

<!-- Indicador de carga -->
{#if state.isLoading}
  <p>Generando respuesta...</p>
{/if}
```

---

## 🔄 Flujo de Trabajo

### 1. Usuario envía mensaje
```
Usuario escribe → agente.svelte → CopilotAPI.sendMessage()
```

### 2. Procesamiento de comando
```
CopilotAPI detecta comando → Ejecuta handler → Modifica mensaje
```

### 3. Envío a IA
```
CopilotAPI → ai.js → Groq/OpenRouter/Gemini (con fallback)
```

### 4. Streaming de respuesta
```
Chunks de texto → Eventos STREAMING_CHUNK → Actualiza UI en tiempo real
```

### 5. Renderizado de código
```
Respuesta completa → rendermark.js → Detecta bloques de código → Auto-inyecta
```

### 6. Guardado de historial
```
Mensaje completo → Guarda en localStorage (con límite de 20 mensajes)
```

---

## 🛡️ Protección contra QuotaExceededError

La API implementa múltiples capas de protección:

1. **Límite de mensajes:** Máximo 20 mensajes en historial
2. **Verificación de tamaño:** Antes de guardar, verifica que no exceda 4MB
3. **Reducción automática:** Si excede, reduce a 10 mensajes
4. **Limpieza de emergencia:** Si falla, reduce a 5 mensajes
5. **Manejo de errores:** Captura y maneja `QuotaExceededError` de forma elegante

---

## 🚀 Ventajas de la Nueva Arquitectura

### ✅ Antes (sin API centralizada)
- Lógica dispersa en múltiples archivos
- Difícil de mantener y depurar
- Código duplicado
- Sin sistema de eventos
- Gestión manual de estado

### ✅ Ahora (con API centralizada)
- **Código organizado:** Toda la lógica en un solo lugar
- **Fácil mantenimiento:** Cambios centralizados
- **Sistema de eventos:** Comunicación desacoplada
- **Estado reactivo:** Svelte stores integrados
- **Comandos extensibles:** Fácil agregar nuevos comandos
- **Gestión inteligente:** Límites y protecciones automáticas

---

## 📊 Estadísticas y Debugging

```javascript
// Obtener estadísticas
const stats = CopilotAPI.getStats();
console.log('Total de mensajes:', stats.totalMessages);
console.log('Proveedores usados:', stats.providers);
console.log('Comandos ejecutados:', stats.commands);

// Ver estado actual
console.log('Estado actual:', $copilotState);

// Ver si está cargando
console.log('¿Está cargando?', $copilotState.isLoading);

// Ver último error
console.log('Último error:', $copilotState.error);
```

---

## 🔮 Próximas Mejoras

- [ ] Soporte para archivos adjuntos
- [ ] Referencias de archivos (@html, @css, @js)
- [ ] Historial de comandos (flecha arriba/abajo)
- [ ] Sugerencias de comandos contextuales
- [ ] Exportar/importar historial
- [ ] Temas personalizables
- [ ] Atajos de teclado personalizables
- [ ] Integración con GitHub Copilot API

---

## 📚 Referencias

- **Archivo principal:** `src/lib/services/copilot-api.js`
- **UI del chat:** `src/lib/conponentes/LLM/agente.svelte`
- **Sistema multi-proveedor:** `src/lib/services/ai.js`
- **Renderizado:** `src/lib/services/rendermark.js`
- **Configuración:** `src/lib/services/ai-config.js`

---

**Última actualización:** Marzo 2026
**Versión:** 2.0.0
