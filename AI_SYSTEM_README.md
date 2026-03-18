# Sistema Multi-Proveedor de IA con Fallback Automático

## 📋 Descripción

Box Code implementa un sistema de chat con IA que utiliza **3 proveedores diferentes** con un mecanismo de fallback automático. Si un proveedor falla (por límite de rate, error de red, etc.), el sistema automáticamente intenta con el siguiente proveedor.

## 🎯 Orden de Prioridad

1. **Groq** (Primario) - `moonshotai/kimi-k2-instruct-0905`
   - Más rápido y económico
   - Límite de rate: ~30 requests/minuto (gratis)

2. **OpenRouter** (Secundario) - `google/gemini-flash-1.5`
   - Fallback cuando Groq alcanza límite
   - Acceso a múltiples modelos

3. **Google Gemini** (Terciario) - `gemini-2.0-flash-exp`
   - Último recurso
   - API nativa de Google

---

## 🔧 Configuración

### 1. Obtener API Keys

**Groq (Recomendado - Gratis):**
1. Visita: https://console.groq.com/keys
2. Crea una cuenta
3. Genera una API key
4. Copia la key (empieza con `gsk_`)

**OpenRouter (Opcional):**
1. Visita: https://openrouter.ai/keys
2. Crea una cuenta
3. Genera una API key
4. Copia la key (empieza con `sk-or-v1-`)

**Google Gemini (Opcional):**
1. Visita: https://aistudio.google.com/app/apikey
2. Crea una cuenta de Google
3. Genera una API key
4. Copia la key (empieza con `AIzaSy`)

### 2. Configurar las Keys

Edita el archivo `src/lib/services/ai-config.js`:

```javascript
export const AI_CONFIG = {
  groq: {
    apiKey: 'gsk_TU_KEY_AQUI', // ⚠️ Reemplazar
    enabled: true
  },
  
  openrouter: {
    apiKey: 'sk-or-v1-TU_KEY_AQUI', // ⚠️ Reemplazar
    enabled: true // Cambiar a true
  },
  
  gemini: {
    apiKey: 'AIzaSyTU_KEY_AQUI', // ⚠️ Reemplazar
    enabled: true // Cambiar a true
  }
};
```

---

## 🚀 Cómo Funciona

### Flujo de Ejecución

```
Usuario envía mensaje
        ↓
Intenta con Groq
        ↓
    ¿Éxito? ──→ Sí ──→ Renderiza respuesta
        ↓
       No (429/error)
        ↓
Intenta con OpenRouter
        ↓
    ¿Éxito? ──→ Sí ──→ Renderiza respuesta
        ↓
       No (error)
        ↓
Intenta con Gemini
        ↓
    ¿Éxito? ──→ Sí ──→ Renderiza respuesta
        ↓
       No (error)
        ↓
Muestra error al usuario
```

### Detección de Errores

El sistema detecta automáticamente:
- **Error 429**: Rate limit alcanzado
- **Errores de red**: Timeout, conexión perdida
- **Errores de API**: Key inválida, modelo no disponible

Cuando detecta un error, intenta con el siguiente proveedor automáticamente.

---

## 💡 Características

### ✅ Streaming en Tiempo Real

Todas las respuestas se generan con streaming:
- El texto aparece palabra por palabra
- Mejor experiencia de usuario
- Feedback inmediato

### ✅ Edición de Líneas Específicas

El sistema soporta dos modos:

**Código Completo:**
```markdown
```html
<!DOCTYPE html>
<html>...</html>
```
```

**Edición de Líneas (Ahorra Tokens):**
```markdown
```html:edit
5-7
  <title>Nuevo Título</title>
```
```

### ✅ Indicador de Proveedor

Cada mensaje muestra qué proveedor lo generó:
- 🟢 Groq
- 🔵 OpenRouter
- 🟡 Gemini

---

## 📊 Logs de Debugging

El sistema genera logs claros en la consola:

```javascript
🔄 Intentando con Groq...
✓ Respuesta generada con Groq

// Si falla:
❌ Error con Groq: Rate limit exceeded
🔄 Intentando con OpenRouter...
✓ Respuesta generada con OpenRouter
```

---

## ⚠️ Consideraciones de Seguridad

**IMPORTANTE**: Las API keys están expuestas en el código del cliente.

```javascript
dangerouslyAllowBrowser: true  // ⚠️ Solo para desarrollo/demo
```

### Para Producción:

1. **Mover las API keys a un backend**
   - Crear un servidor proxy
   - Nunca exponer keys en el cliente

2. **Implementar rate limiting propio**
   - Controlar uso por usuario
   - Prevenir abuso

3. **Usar variables de entorno**
   ```javascript
   apiKey: import.meta.env.VITE_GROQ_API_KEY
   ```

4. **Implementar autenticación**
   - Solo usuarios autenticados pueden usar la IA
   - Tracking de uso por usuario

---

## 🔍 Troubleshooting

### Problema: "Todas las APIs fallaron"

**Solución:**
1. Verifica que al menos una API key esté configurada
2. Verifica que el proveedor esté habilitado (`enabled: true`)
3. Revisa la consola para ver el error específico
4. Verifica que las keys sean válidas

### Problema: "Rate limit exceeded"

**Solución:**
1. Espera unos minutos antes de intentar de nuevo
2. El sistema automáticamente intentará con otro proveedor
3. Considera agregar más proveedores como fallback

### Problema: "No hay proveedores configurados"

**Solución:**
1. Edita `src/lib/services/ai-config.js`
2. Agrega al menos una API key válida
3. Cambia `enabled: true` para ese proveedor

---

## 📈 Ventajas del Sistema

1. **Alta disponibilidad**: Si un proveedor falla, hay 2 backups
2. **Optimización de costos**: Usa el proveedor más económico primero
3. **Mejor UX**: El usuario no nota los fallos internos
4. **Streaming**: Respuestas en tiempo real
5. **Flexibilidad**: Fácil agregar más proveedores
6. **Ahorro de tokens**: Sistema de edición de líneas específicas

---

## 🛠️ Agregar Más Proveedores

Para agregar un nuevo proveedor:

1. **Edita `ai-config.js`:**
```javascript
export const AI_CONFIG = {
  // ... proveedores existentes
  
  nuevoProveedor: {
    apiKey: 'tu_key',
    model: 'modelo',
    endpoint: 'https://api.ejemplo.com',
    enabled: true
  }
};
```

2. **Crea función de streaming en `ai.js`:**
```javascript
async function streamWithNuevoProveedor(messages, onChunk, signal) {
  // Implementación específica del proveedor
}
```

3. **Agrega al fallback:**
```javascript
try {
  provider = await streamWithGroq(...);
} catch {
  try {
    provider = await streamWithOpenRouter(...);
  } catch {
    try {
      provider = await streamWithNuevoProveedor(...); // ← Nuevo
    } catch {
      // ...
    }
  }
}
```

---

## 📝 Archivos Importantes

- `src/lib/services/ai-config.js` - Configuración de API keys
- `src/lib/services/ai.js` - Lógica de fallback y streaming
- `src/lib/conponentes/LLM/agente.svelte` - Componente de chat
- `src/lib/services/rendermark.js` - Renderizado de markdown

---

## 🎓 Recursos

- [Groq Documentation](https://console.groq.com/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola del navegador
2. Verifica que las API keys sean válidas
3. Asegúrate de tener al menos un proveedor habilitado
4. Revisa que no hayas alcanzado el límite de rate

---

**Última actualización**: 2024
**Versión**: 1.0.0
