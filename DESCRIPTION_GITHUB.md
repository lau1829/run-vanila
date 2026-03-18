# Run Vanila - Editor de Código Web Moderno

**Run Vanila** es un editor de código web en línea construido con Svelte y SvelteKit. Permite escribir, compilar y visualizar código HTML, CSS y JavaScript en tiempo real, con una interfaz moderna y características avanzadas.

## 🎯 Características Principales

- **3 editores diferentes** (Monaco, Ace, CodeMirror) con detección automática de dispositivo
- **Compilación en tiempo real** con iframe aislado para seguridad
- **Compartir código en URLs** usando compresión `lz-string`
- **Modo "Live"** para visualización limpia sin interfaz de editor
- **Descarga como ZIP** con todos los archivos del proyecto
- **Consola integrada** con historial de logs y errores
- **Persistencia automática** en localStorage
- **Responsive design** optimizado para desktop, tablet y móvil

## 🚀 Tecnologías

- **Svelte 5** + **SvelteKit** - Framework frontend moderno
- **Tailwind CSS 4** - Utilidades CSS
- **Vite** - Bundler rápido
- **Monaco Editor** (VS Code) - Editor principal para desktop
- **Ace Editor** - Editor ligero para móviles
- **CodeMirror 6** - Editor extensible
- **lz-string** - Compresión para URLs compartibles

## 💡 Casos de Uso

- **Prototipado rápido** de interfaces web
- **Enseñanza** de HTML, CSS y JavaScript
- **Compartir ejemplos de código** con colegas
- **Testing** de snippets en diferentes navegadores
- **Presentaciones** en modo Live

## 📦 Fácil de Usar

```bash
# Clonar y ejecutar localmente
git clone https://github.com/tu-usuario/run-vanila.git
cd run-vanila
npm install
npm run dev
```

O usa la versión en línea directamente desde tu navegador.

## 🔗 Compartir Proyectos

Cualquier proyecto se puede compartir mediante URLs comprimidas:
- `/?code=...` - Para editar
- `/live?code=...` - Para visualizar

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

**Run Vanila** - Tu editor de código web moderno para prototipado rápido y colaboración.