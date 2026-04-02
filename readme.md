# FLL System (LEGO Engine) 🚀

Sistema integral de gestión de torneos y puntuación local para **FIRST LEGO League (FLL)**. Este sistema permite gestionar equipos, generar brackets de torneo (1vs1 y 2vs2), realizar puntuaciones en tiempo real y manejar una ceremonia de premiación con efectos visuales.

## 🌟 Características

- 📊 **Scoring en Tiempo Real**: Puntuación automática basada en las misiones oficiales de FLL.
- 🏆 **Generador de Brackets**: Soporta torneos de eliminación directa en formatos 1vs1 y 2vs2.
- ⏱️ **Timer Integrado**: Cronómetro sincronizado vía Socket.io para todos los displays.
- 👥 **Gestión de Usuarios**: Roles diferenciados para Admin, Jueces (Referees) y Pantallas (Displays).
- 🔊 **Efectos de Sonido**: Integración de sonidos oficiales para inicio, fin de match y avisos.
- 📺 **Modo Ceremonia**: Interfaz dedicada para la entrega de premios con animaciones y revelaciones progresivas.
- 🔌 **API Documentada**: Documentación completa con Swagger.

## 🛠️ Stack Tecnológico

- **Frontend**: [Astro](https://astro.build/) + [React](https://reactjs.org/) + [TailwindCSS](https://tailwindcss.com/)
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Tiempo Real**: [Socket.io](https://socket.io/)
- **Base de Datos**: [LowDB](https://github.com/typicode/lowdb) (JSON local)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)

## 🚀 Instalación y Uso

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd FLL-SYSTEM
npm install
```

### 2. Iniciar el servidor (Backend)

El backend maneja la lógica de negocio, la base de datos y los sockets.

```bash
node src/server/server.js
```
El servidor correrá en el puerto `3000`.

### 3. Iniciar el entorno de desarrollo (Frontend)

```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:4321`.

### 4. Producción

Para construir y servir la aplicación en producción:

```bash
npm run build
node start-server.js
```

Para el microfono y conectarlo al display
```bash
npx localtunnel --port 4321
```
## 📖 Documentación de la API

Una vez que el servidor backend esté corriendo, puedes acceder a la documentación interactiva de la API en:

👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🗄️ Estructura de Datos

Los datos se almacenan en archivos JSON dentro de `src/server/data/`:
- `users.json`: Credenciales y roles.
- `teams.json`: Lista de equipos participantes.
- `matches.json`: Historial y estado de los encuentros.
- `brackets.json`: Configuración de los torneos activos.
- `awards.json`: Ganadores de premios y estado de la ceremonia.

## 👤 Roles del Sistema

- **Admin**: Acceso total, gestión de usuarios, equipos y generación de brackets.
- **Referee**: Encargado de capturar las puntuaciones de los matches.
- **Display**: Vistas optimizadas para proyectores (Leaderboard, Timer, Brackets).

## 📄 Licencia

Este proyecto fue desarrollado para la gestión local de torneos FLL. Todos los derechos de las misiones y marcas pertenecen a FIRST y LEGO Group.
