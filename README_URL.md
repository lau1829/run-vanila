# Guía de Integración: Editor vs Live Mode

Este sistema utiliza una arquitectura basada en URL para separar la **edición** de la **visualización**. Ambas funcionan con el mismo sistema de compresión `lz-string`.

## 1. Diferencia entre Modos

| Característica | Modo Editor | Modo Live |
| :--- | :--- | :--- |
| **Ruta** | `/` | `/live` |
| **Interfaz** | Paneles de código (HTML/CSS/JS) | Pantalla completa (Solo la web) |
| **Uso** | Modificar, añadir paquetes, depurar | Presentar, compartir el resultado final |
| **Parámetro** | `?code=...` | `?code=...` |

---

## 2. Generación de Enlaces (Ejemplos)

Dependiendo de qué quieras mostrar a tu usuario, puedes generar dos tipos de links con los mismos datos:

```javascript
import LZString from 'lz-string';

const datos = ["<h1>Hola</h1>", "h1 { color: blue }", "console.log('Live')", {}];
const code = LZString.compressToEncodedURIComponent(JSON.stringify(datos));

const baseApp = "https://tu-dominio.com";

// Enlace para que el usuario SIGA EDITANDO
const linkEditor = `${baseApp}/?code=${code}`;

// Enlace para visualizar la PÁGINA LIMPIA (Modo Live)
const linkLive = `${baseApp}/live?code=${code}`;
```

---

## 3. Integración en tu App (Casos de Uso)

### A. Botón "Editar en mi Plataforma"
Si tienes un blog o documentación, puedes poner un botón que abra el código en el editor:

```html
<a href="https://tu-app.com/?code=N4Ig7B..." target="_blank">
  Probar este ejemplo en el Editor
</a>
```

### B. Vista Previa en Vivo (Live Mode) en un Iframe
Si quieres mostrar el resultado de un código guardado en tu base de datos dentro de tu propia web, usa la ruta `/live`:

```html
<!-- Esto mostrará solo la web resultante, sin las barras del editor -->
<iframe 
  src="https://tu-app.com/live?code=N4Ig7B..."
  width="100%"
  height="400px"
  style="border: 1px solid #ccc; border-radius: 8px;"
></iframe>
```

---

## 4. Estructura de Datos Avanzada
Para proyectos que usan dependencias externas, el cuarto elemento del array es crucial:

```javascript
const html = `<button id="btn">Lanzar Confetti</button>`;
const css = `body { display: flex; justify-content: center; align-items: center; height: 100vh; }`;
const js = `
  import confetti from 'canvas-confetti';
  document.getElementById('btn').onclick = () => confetti();
`;
const packages = {
  "canvas-confetti": "https://cdn.skypack.dev/canvas-confetti"
};

const estado = [html, css, js, packages];
const code = LZString.compressToEncodedURIComponent(JSON.stringify(estado));

console.log(`Ver en vivo: /live?code=${code}`);
```

---

## 5. Notas Importantes
- **Limitación de Tamaño:** Aunque comprimimos, intenta que el código total (JSON) no supere los 100KB para asegurar compatibilidad en todos los navegadores móviles.
- **Seguridad:** El modo `/live` utiliza `srcdoc` y un entorno controlado, pero recuerda que el JS se ejecuta en el dominio donde esté alojada la app.
