# 📚 Documentación Integral: FLL-SYSTEM (LEGO Engine)

Esta es la guía definitiva para el desarrollo, operación y mantenimiento del sistema de puntuación para torneos de **FIRST LEGO League (FLL)**.

---

## 🏗️ 1. Arquitectura de Alto Nivel

El sistema se basa en una arquitectura de **Aplicación Web Desacoplada** (Decoupled Web App) optimizada para el rendimiento local:

- **Frontend (Astro & React):** Astro gestiona el enrutamiento y las páginas de alto rendimiento. React se utiliza para las "islas de interactividad" (Marcadores, Temporizadores, Paneles de Juez).
- **Backend (Node.js & Express):** Proporciona la lógica de negocio, API RESTful y el motor de WebSockets.
- **Sincronización (Socket.io):** Comunicación bidireccional de baja latencia entre todos los clientes conectados.
- **Persistencia (LowDB):** Base de datos ligera basada en JSON que permite portabilidad total sin dependencias externas de DB.

---

## 📂 2. Estructura del Proyecto

```text
/
├── public/                 # Archivos estáticos (Imágenes de misiones, sonidos)
├── src/
│   ├── components/         # Componentes React interactivos
│   │   ├── auth/           # Login y gestión de permisos
│   │   ├── game/           # Temporizador y lógica de juego
│   │   ├── missions/       # Contadores y lógica visual de misiones FLL
│   │   └── roles/          # Vistas específicas (Admin, Juez, Display)
│   ├── pages/              # Rutas de Astro (Frontend)
│   ├── layouts/            # Plantillas de diseño (Dashboard, Misiones)
│   ├── lib/                # Utilidades, mapeos de misiones y socket.io-client
│   └── server/             # Servidor Express y Base de Datos
│       ├── databases/      # Modelos de LowDB (Matches, Brackets, etc.)
│       ├── lib/            # Lógica central de puntuación (Scoring Engine)
│       └── data/           # Almacenamiento JSON (Persistencia real)
├── Dockerfile              # Configuración de contenedor para producción
└── jest.config.js          # Configuración del entorno de pruebas
```

---

## ⚙️ 3. El Motor de Puntuación (LEGO Engine)

El corazón del sistema es `src/server/lib/scoring.js`. Este motor traduce las acciones de los jueces en puntos reales siguiendo las reglas de FLL:

### 🚀 Lógica de Misiones (Ejemplos):
- **M01 Soil:** Incrementa de 10 en 10 hasta 50 puntos. Si se marca el bono "brush", suma 10 puntos adicionales para llegar al máximo de 60.
- **M15 Precision Tokens:** El sistema comienza en 50 puntos (6 o 5 tokens). A medida que el robot comete errores y se pierden tokens, los puntos bajan siguiendo la tabla oficial (35, 25, 15, 10, 0).
- **Consistencia:** El motor valida que los datos no excedan los límites reglamentarios antes de guardarlos.

---

## 🔌 4. Comunicación en Tiempo Real (Socket.io)

El sistema sincroniza a todos los usuarios instantáneamente. Cuando un juez actualiza una misión en una Tablet, el marcador de la pantalla gigante se actualiza en menos de 100ms.

### Eventos Principales:
| Evento | Dirección | Propósito |
| :--- | :--- | :--- |
| `timerUpdate` | Server -> All | Actualiza el tiempo restante en todos los cronómetros. |
| `matchesUpdate` | Server -> All | Refresca las puntuaciones y estados de las partidas. |
| `bracketsUpdate` | Server -> All | Actualiza el cuadro del torneo en tiempo real. |
| `sound_volume` | Client -> Server | Permite que una Tablet controle el volumen de los altavoces del servidor. |
| `capture_state` | Client -> Server | Sincroniza el estado de las cámaras de campo. |

---

## 📊 5. Modelos de Datos y Persistencia

### Base de Datos: Brackets (`brackets.json`)
Gestiona la estructura del torneo.
```typescript
{
  "id": "123456",
  "name": "Tournament 2026",
  "size": 16,            // Cantidad de equipos
  "mode": "2vs2",        // Alianzas o individual
  "status": "active"     // Estado del bracket
}
```

### Base de Datos: Matches (`matches.json`)
Guarda cada enfrentamiento individual.
```typescript
{
  "id": "match-1-1",     // Round 1, Posición 1
  "teamA1": "1001",
  "scoreA": 245,
  "missionsA1": { ... }, // Estado detallado de cada misión
  "status": "finished",  // 'pending', 'in_progress', 'finished'
  "nextMatchId": "..."   // ID del match donde avanzará el ganador
}
```

---

## 🔐 6. Seguridad y Roles

El sistema utiliza **JWT (JSON Web Tokens)** para las sesiones y cifrado básico para la persistencia.

- **ADMIN:** Acceso a `/roles/admin`. Puede generar brackets, crear usuarios y resetear el sistema.
- **REFEREE (Juez):** Acceso a `/roles/referee`. Solo puede cargar puntuaciones de los equipos asignados.
- **DISPLAY:** Acceso a `/displays`. Vista de solo lectura optimizada para proyectores y streaming.

---

## 🧪 7. Estrategia de Calidad y Mantenimiento

### Pruebas Unitarias y de Integración
- **Cálculo exacto:** `scoring.test.js` asegura que no haya errores matemáticos en la puntuación.
- **Flujo de API:** `server.test.js` garantiza que el login y las actualizaciones de red sean seguras.
- **UI:** `MatchTimer.test.tsx` asegura que el cronómetro reaccione correctamente a los eventos de red.

### Mantenimiento de Hardware
El sistema incluye soporte para **Micrófonos locales** (vía `node-mic`) para detectar niveles de ruido durante el torneo y sincronizar el volumen de los efectos de sonido automáticamente.

### Reset de Emergencia
Si ocurre un error crítico durante el torneo:
1. Reiniciar el contenedor Docker: `docker-compose restart`.
2. El sistema recuperará el último estado guardado en los archivos JSON.
3. Para un reset total, eliminar el contenido de `src/server/data/`.

---

## 🐳 8. Despliegue en Producción

### Docker Compose (Recomendado)
```yaml
services:
  scoring-system:
    build: .
    ports:
      - "4321:4321" # Frontend
      - "3000:3000" # API & Sockets
    volumes:
      - ./src/server/data:/app/src/server/data # Persistencia persistente
```

### Configuración de Red
Es vital que el servidor esté en la misma red WiFi/LAN que los clientes. Los jueces acceden mediante la IP local (ej. `http://192.168.1.50:4321`).

---
Desarrollado con estándares de ingeniería de software para garantizar un torneo justo y emocionante. 🤖🏆
