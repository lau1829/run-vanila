# Run Vanila - Editor de Código Web Moderno

![Svelte](https://img.shields.io/badge/Svelte-5.49.2-FF3E00?logo=svelte&logoColor=white)
![SvelteKit](https://img.shields.io/badge/SvelteKit-2.50.2-FF3E00?logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite&logoColor=white)

**Run Vanila** es un editor de código web en línea construido con tecnologías modernas. Permite escribir, compilar y visualizar código HTML, CSS y JavaScript en tiempo real, con una interfaz limpia y características avanzadas para desarrolladores.

**✨ Características destacadas:**
- 3 editores diferentes (Monaco, Ace, CodeMirror)
- Compilación en tiempo real con vista previa
- Compartir código en URLs comprimidas
- Modo Live para presentaciones
- Descarga proyectos como ZIP
- Consola integrada con historial

## ✨ Características

- **3 editores diferentes**: Monaco (VS Code), Ace, CodeMirror
- **Compilación en tiempo real** con iframe aislado
- **Compartir código en URL** usando compresión `lz-string`
- **Modo "Live"** para visualización limpia (`/live`)
- **Descarga como ZIP** (HTML, CSS, JS)
- **Consola integrada** con historial de logs
- **Responsive design** con detección automática de dispositivo
- **Persistencia automática** en localStorage

## 🚀 Cómo Usar

### Opción 1: Usar la versión en línea
Visita la página web del proyecto para usar el editor directamente en tu navegador.

### Opción 2: Clonar y ejecutar localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/run-vanila.git
cd run-vanila

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173
```

### Opción 3: Desplegar tu propia instancia

```bash
# 1. Compilar para producción
npm run build

# 2. Desplegar en Firebase (recomendado)
firebase deploy

# O desplegar en otros servicios:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod
# - GitHub Pages: Configurar workflow
```

## 📁 Estructura del Proyecto

```
src/
├── routes/           # Rutas de SvelteKit
│   ├── +page.svelte  # Página principal (editor)
│   └── live/
│       └── +page.svelte  # Modo Live
├── lib/              # Componentes y lógica
│   ├── conponentes/  # Componentes Svelte
│   │   ├── editor/   # Sistema de edición
│   │   ├── header/   # Barra de herramientas
│   │   ├── nav/      # Navegación
│   │   └── visualizacion/  # Vista previa
│   ├── stores/       # Stores de estado
│   └── assets/       # Recursos estáticos
└── app.html          # HTML base
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Compila para producción
npm run preview  # Vista previa del build
npm run lint     # Verifica formato del código
npm run format   # Formatea el código automáticamente
```

## 🌐 Sistema de URLs

Run Vanila comprime el código en URLs usando `lz-string` para compartir proyectos fácilmente:

```javascript
// Ejemplo: Generar URL compartible
const datos = ["<h1>Hola</h1>", "h1 { color: blue }", "console.log('Hola')", {}];
const code = LZString.compressToEncodedURIComponent(JSON.stringify(datos));
const url = `https://tu-dominio.com/?code=${code}`;
```

### Tipos de URLs:
- **URL de edición**: `/?code=...` - Abre el editor con el código
- **URL Live**: `/live?code=...` - Muestra solo la vista previa

## 📱 Compatibilidad

- **Desktop**: Monaco Editor con paneles laterales
- **Tablet**: Ace Editor con interfaz optimizada  
- **Móvil**: Ace Editor con navegación por tabs
- **Navegadores**: Chrome, Firefox, Safari, Edge (modernos)

## 🛠️ Tecnologías Utilizadas

- **Svelte 5** - Framework frontend reactivo
- **SvelteKit** - Meta-framework para aplicaciones web
- **Tailwind CSS 4** - Utilidades CSS modernas
- **Vite** - Bundler y dev server rápido
- **Monaco Editor** - Editor de VS Code
- **Ace Editor** - Editor ligero para móviles
- **CodeMirror 6** - Editor extensible
- **lz-string** - Compresión para URLs

## 🤝 Contribuir

1. **Fork** el repositorio
2. **Crea una rama** (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** los cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre un Pull Request**

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Run Vanila** - Un editor de código web moderno y potente para prototipado rápido y enseñanza.