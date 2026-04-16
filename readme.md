# FLL-SYSTEM: LEGO Engine 🤖🏆

[![CI](https://github.com/your-repo/fll-system/actions/workflows/ci.yml/badge.svg)](https://github.com/your-repo/fll-system/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FLL-SYSTEM** es un sistema profesional de gestión y puntuación local para torneos de **FIRST LEGO League (FLL)**. Diseñado para ser rápido, confiable y fácil de desplegar en redes locales.

## ✨ Características Principales

- 🚀 **Frontend con Astro & React:** Interfaz moderna, rápida y reactiva.
- ⚙️ **Backend con Express:** Servidor robusto para gestionar la lógica del torneo.
- ⏱️ **Sincronización en Tiempo Real:** Comunicación mediante WebSockets (Socket.io) para temporizadores y puntuaciones.
- 📊 **Gestión de Torneos:** Generación automática de Brackets (1vs1, 2vs2).
- 🏆 **Ceremonia de Premios:** Pantalla dedicada para la revelación de ganadores.
- 🐳 **Docker Ready:** Despliegue simplificado con un solo comando.
- 🧪 **Test Suite Completo:** Pruebas unitarias, de componentes y de API con Jest.

## 🛠️ Stack Tecnológico

- **Frontend:** Astro, React, Tailwind CSS, Lucide React, Framer Motion.
- **Backend:** Node.js, Express, Socket.io, LowDB (JSON-based persistence).
- **Testing:** Jest, React Testing Library, Supertest.
- **DevOps:** Docker, Docker Compose, GitHub Actions.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 20+
- Docker & Docker Compose (opcional para despliegue)

### Instalación Local
1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

### Uso con Docker 🐳
Para construccion y despliegue rápido:
```bash
docker-compose up --build
```

Para correr el contenedor ya creado:
```bash
docker-compose up
```

El sistema estará disponible en:
- **Frontend:** [http://localhost:4321](http://localhost:4321)
- **API Docs (Swagger):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🧪 Testing

Ejecutar la suite de pruebas completa:
```bash
npm test
```

## 📂 Estructura del Proyecto

- `src/components`: Componentes de UI (React).
- `src/pages`: Rutas del frontend (Astro).
- `src/server`: Servidor Express, API y base de datos.
- `src/server/databases`: Capa de persistencia (LowDB).
- `src/lib`: Utilidades y lógica compartida.

## 📝 Documentación de la API

La API está documentada con Swagger. Al ejecutar el servidor, puedes acceder a la documentación interactiva en `/api-docs`.

---
Desarrollado para la comunidad de robótica. ¡Que gane el mejor robot! 🤖✨
