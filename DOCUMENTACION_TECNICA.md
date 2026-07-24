# Documentación técnica — Fundación Abrazo Rosa

Este documento explica la arquitectura y la responsabilidad de los archivos del proyecto. Está pensado para que una persona que no participó en el desarrollo pueda entender cómo está organizada la aplicación, dónde realizar cambios y cómo se conectan sus diferentes partes.

---

## 1. Descripción general

Fundación Abrazo Rosa es una aplicación web frontend construida con **Angular 21**, componentes standalone, TypeScript y SCSS.

La aplicación tiene dos áreas principales:

1. **Sitio público:** presenta la Fundación, sus objetivos, actividades, ubicación y documentos públicos.
2. **Panel administrativo:** permite gestionar documentos, cuentas administrativas, métricas y el perfil del administrador.

La aplicación incluye una API de autenticación construida con Express y conectada a MySQL. La información se distribuye de la siguiente manera:

- **MySQL:** cuentas administrativas, contraseñas cifradas, roles y estado de las cuentas.
- **IndexedDB:** archivos PDF y sus metadatos.
- **Local Storage:** token de sesión, perfil administrativo y métricas acumuladas.
- **Session Storage:** identificación de una visita durante la sesión actual.

---

## 2. Flujo general de la aplicación

```text
main.ts
   │
   ▼
App + app.config.ts
   │
   ▼
app.routes.ts
   ├── PublicLayout
   │   ├── Home
   │   ├── About
   │   ├── Programs
   │   ├── Presence
   │   └── Documents
   │
   ├── Login
   │
   └── Admin ── protegido por adminGuard
           ├── Resumen
           ├── Documentos
           ├── Usuarios
           ├── Métricas
           └── Perfil
```

Cuando se abre la aplicación, `main.ts` crea el componente raíz. El router revisa la URL y decide qué componente mostrar. Las rutas públicas se renderizan dentro de `PublicLayout`, mientras que `/admin` utiliza una vista independiente y requiere una sesión administrativa válida.

---

## 3. Estructura principal

```text
fundacion-abrazo-rosa/
├── public/
├── server/
│   ├── auth.middleware.ts
│   ├── auth.routes.ts
│   ├── config.ts
│   ├── database.ts
│   ├── index.ts
│   ├── migrate.ts
│   ├── types.ts
│   └── tsconfig.json
├── src/
│   ├── app/
│   │   ├── core/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── app.config.ts
│   │   ├── app.html
│   │   ├── app.routes.ts
│   │   ├── app.scss
│   │   ├── app.spec.ts
│   │   └── app.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── .env.example
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── README.md
└── DOCUMENTACION_TECNICA.md
```

---

## 4. Archivos de configuración

### `package.json`

Define el proyecto de Node.js, sus dependencias y los comandos disponibles.

Scripts principales:

| Comando | Función |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo de Angular. |
| `npm run start:api` | Inicia la API de autenticación con Express. |
| `npm run start:all` | Inicia Angular y la API al mismo tiempo. |
| `npm run build` | Genera la versión optimizada para producción. |
| `npm run build:api` | Comprueba y compila el TypeScript del servidor. |
| `npm run watch` | Compila y observa cambios en modo desarrollo. |
| `npm test` | Ejecuta las pruebas unitarias con Vitest. |

También declara las versiones de Angular, RxJS, TypeScript y Vitest utilizadas.

### `package-lock.json`

Registra las versiones exactas de todas las dependencias instaladas. Permite que diferentes desarrolladores obtengan el mismo árbol de paquetes al ejecutar `npm install`.

No debe editarse manualmente.

### `angular.json`

Contiene la configuración de Angular CLI:

- Punto de entrada: `src/main.ts`.
- Carpeta de archivos públicos: `public/`.
- Hoja de estilos global: `src/styles.scss`.
- Configuración de desarrollo y producción.
- Límites de tamaño de los archivos compilados.
- Configuración de compilación, servidor local y pruebas.

### `tsconfig.json`

Configuración general de TypeScript. El proyecto utiliza modo estricto para detectar errores potenciales durante el desarrollo:

- Tipado estricto.
- Verificación de retornos.
- Plantillas Angular estrictas.
- Objetivo de compilación ES2022.

### `tsconfig.app.json`

Extiende la configuración general y define los archivos TypeScript que pertenecen a la aplicación ejecutable.

### `tsconfig.spec.json`

Extiende la configuración general para los archivos de pruebas, como `*.spec.ts`.

### `.editorconfig`

Unifica configuraciones básicas del editor, como sangría, saltos de línea y codificación.

### `.gitignore`

Indica qué archivos no deben subirse al repositorio. Normalmente excluye:

- `node_modules/`
- `dist/`
- archivos temporales
- cachés del editor

### `.vscode/`

Contiene recomendaciones y configuraciones para Visual Studio Code:

- Extensiones recomendadas.
- Tareas de desarrollo.
- Configuración de depuración.

El proyecto puede funcionar sin esta carpeta; únicamente facilita el trabajo dentro de VS Code.

---

## 5. Punto de entrada y configuración global

### `src/index.html`

Documento HTML base que recibe la aplicación Angular. Contiene:

- Metadatos del sitio.
- Título predeterminado.
- Descripción para buscadores.
- Etiqueta `<app-root>`, donde Angular monta toda la aplicación.

### `src/main.ts`

Es el punto de entrada de la aplicación. Ejecuta `bootstrapApplication()` para iniciar el componente raíz `App` utilizando la configuración de `app.config.ts`.

Si la inicialización falla, el error se envía a la consola del navegador.

### `src/styles.scss`

Contiene los estilos globales compartidos:

- Importación de la tipografía Alegreya.
- Variables de colores institucionales.
- Normalización de márgenes y tamaños.
- Estilos globales para botones, campos, títulos y tarjetas.
- Clases reutilizables como `.container`, `.btn`, `.field`, `.card` y `.eyebrow`.

Modificar las variables de `:root` permite cambiar rápidamente la identidad visual en toda la aplicación.

### `public/favicon.ico`

Icono mostrado en la pestaña del navegador. Puede reemplazarse por el favicon definitivo de la Fundación conservando el mismo nombre o actualizando su referencia en `index.html`.

---

## 6. Componente raíz

### `src/app/app.ts`

Componente raíz standalone.

Responsabilidades:

- Importar `RouterOutlet`.
- Iniciar `AnalyticsService` mediante inyección de dependencias.
- Servir como contenedor principal de toda la aplicación.

### `src/app/app.html`

Contiene únicamente `<router-outlet />`. Angular reemplaza este elemento con el componente correspondiente a la ruta actual.

### `src/app/app.scss`

Define el comportamiento visual mínimo del componente raíz para que ocupe correctamente la página.

### `src/app/app.config.ts`

Configura los proveedores globales:

- Gestión global de errores del navegador.
- Angular Router.
- Restauración de la posición de desplazamiento.
- Navegación hacia anclas, por ejemplo `/presencia#contacto`.

### `src/app/app.routes.ts`

Define todas las rutas de la aplicación.

Rutas públicas dentro de `PublicLayout`:

- `/`
- `/quienes-somos`
- `/que-hacemos`
- `/presencia`
- `/documentos`
- `/transparencia`

Rutas independientes:

- `/login`
- `/admin`

La ruta `/admin` usa `adminGuard`. Cualquier URL desconocida redirige al inicio.

### `src/app/app.spec.ts`

Pruebas unitarias básicas del componente raíz. Verifican que:

- El componente pueda crearse.
- El `router-outlet` se renderice correctamente.

---

## 7. Núcleo de la aplicación (`core`)

La carpeta `core` contiene lógica compartida que no corresponde a una página específica.

### `src/app/core/guards/admin.guard.ts`

Protege el panel administrativo.

Flujo:

1. Consulta `AuthService`.
2. Verifica si existe una sesión con rol `admin`.
3. Si es válida, permite abrir `/admin`.
4. Si no es válida, devuelve una redirección hacia `/login`.

Además de comprobar el token guardado, consulta `/api/auth/me`. La API vuelve
a validar la firma del JWT, el rol y el estado de la cuenta antes de confirmar
la sesión.

### `src/app/core/services/auth.service.ts`

Gestiona la comunicación de autenticación entre Angular y la API.

Funciones principales:

- Enviar el registro a `/api/auth/register`.
- Enviar las credenciales a `/api/auth/login`.
- Validar la sesión con `/api/auth/me`.
- Guardar el token JWT y el perfil en Local Storage.
- Comprobar si el usuario actual es administrador.
- Cerrar sesión.
- Actualizar nombre y correo mediante `/api/auth/me`.
- Restaurar una sesión guardada al recargar la página.

Las contraseñas nunca se guardan en Angular ni se devuelven al navegador.

### `src/app/core/services/documents.service.ts`

Centraliza toda la gestión documental.

El modelo de cada documento contiene:

- Identificador.
- Título.
- Descripción.
- Categoría.
- Fecha real del documento.
- Año y mes.
- Tamaño.
- URL temporal para visualizar el PDF.
- Visibilidad pública o privada.

Funciones principales:

- Cargar documentos almacenados.
- Agregar un PDF.
- Cambiar su visibilidad.
- Eliminarlo.
- Obtener únicamente documentos públicos.
- Crear URLs temporales para el visualizador.

Los archivos se guardan en IndexedDB, dentro de la base local `abrazo-rosa` y el almacén `documents`.

### `src/app/core/services/institutional-information.service.ts`

Conecta Angular con la información institucional almacenada en Laravel:

- Consulta públicamente `/api/institutional-information`.
- Actualiza la política mediante `/api/admin/institutional-information`.
- Envía el token administrativo en las operaciones protegidas.
- Expone señales con la política, la fecha de actualización, el estado de carga
  y los errores.

### `src/app/core/services/analytics.service.ts`

Registra métricas básicas del sitio público:

- Visitas por sesión.
- Cantidad de páginas vistas.
- Clics en enlaces y botones.
- Número de vistas por ruta.

No contabiliza interacciones dentro de `/admin` ni `/login`.

La información se guarda en Local Storage. Por ello, solo representa la actividad del navegador actual y no métricas globales de todos los visitantes.

---

## 8. Layout público

### `src/app/layout/public-layout/public-layout.ts`

Controla el layout compartido por las páginas públicas. Mantiene una señal que indica si el menú móvil está abierto o cerrado.

### `src/app/layout/public-layout/public-layout.html`

Contiene:

- Encabezado institucional.
- Logo temporal con las letras `AR`.
- Navegación pública.
- Botón «Contáctanos».
- `router-outlet` para cargar cada página.
- Pie de página con enlaces e información de contacto.

El acceso administrativo no se muestra en este menú.

### `src/app/layout/public-layout/public-layout.scss`

Define:

- Encabezado fijo.
- Identidad del logo.
- Menú de escritorio.
- Menú responsive para dispositivos pequeños.
- Distribución y colores del pie de página.

---

## 9. Páginas públicas

Cada página se divide normalmente en tres archivos:

- `.ts`: comportamiento y datos.
- `.html`: estructura visual.
- `.scss`: estilos exclusivos del componente.

### Inicio

#### `src/app/pages/home/home.ts`

Declara el componente `Home` e importa `RouterLink` para sus llamados a la acción.

#### `src/app/pages/home/home.html`

Construye la página principal:

- Sección hero.
- Mensaje institucional.
- Propósito de la Fundación.
- Pilares de equidad, empoderamiento y comunidad.
- Extracto de la política de tratamiento de datos cuando está publicada.
- Llamado a contactar a la organización.

#### `src/app/pages/home/home.scss`

Define la composición visual del hero, elementos decorativos, tarjetas de pilares, llamados a la acción y adaptación móvil.

### Quiénes somos

#### `src/app/pages/about/about.ts`

Declara el componente `About`.

#### `src/app/pages/about/about.html`

Presenta:

- Descripción de la Fundación.
- Misión.
- Visión.
- Razón social.
- Sigla.
- NIT.
- Ciudad de operación.

#### `src/app/pages/about/about.scss`

Organiza la información institucional en columnas y tarjetas, con ajustes para pantallas pequeñas.

### Qué hacemos

#### `src/app/pages/programs/programs.ts`

Declara el componente `Programs`.

#### `src/app/pages/programs/programs.html`

Describe las áreas de trabajo:

- Derechos de las mujeres.
- Liderazgo femenino.
- Desarrollo comunitario.
- Inclusión social.
- Metodología de trabajo comunitario.

#### `src/app/pages/programs/programs.scss`

Controla la cuadrícula de programas, iconos, numeración y sección oscura de metodología.

### Presencia y contacto

#### `src/app/pages/presence/presence.ts`

Declara el componente `Presence`.

#### `src/app/pages/presence/presence.html`

Incluye:

- Descripción de la presencia de la Fundación en Cali.
- Correo institucional.
- Sección con identificador `contacto`.
- Mapa embebido de Google Maps.

La dirección exacta no se publica hasta que sea confirmada.

#### `src/app/pages/presence/presence.scss`

Define el diseño en dos columnas para información y mapa, además de su versión móvil.

### Documentos públicos

#### `src/app/pages/documents/documents.ts`

Contiene la lógica de la biblioteca pública:

- Obtiene solo documentos con visibilidad pública.
- Mantiene los valores seleccionados en los filtros.
- Aplica filtros al presionar el botón correspondiente.
- Busca por título, descripción y categoría.
- Filtra por categoría.
- Filtra por año y mes de la fecha real del documento.
- Calcula años disponibles y estadísticas.
- Abre y cierra el visualizador PDF.
- Sanitiza la URL local del PDF para utilizarla en un `iframe`.
- Formatea fechas en español.

#### `src/app/pages/documents/documents.html`

Divide la página en dos áreas:

1. Lateral institucional con estadísticas y filtros.
2. Listado de documentos disponibles.

También contiene:

- Botones «Aplicar filtros» y «Limpiar».
- Estado sin resultados.
- Tarjetas con título, descripción, fecha y tamaño.
- Modal para visualizar el PDF.

#### `src/app/pages/documents/documents.scss`

Define el lateral color vino, controles blancos, distribución del listado, tarjetas PDF, modal del visualizador y comportamiento responsive.

### Transparencia

Los archivos `src/app/pages/transparency/transparency.ts`, `.html` y `.scss`
construyen la página pública `/transparencia`. El texto se obtiene desde
Laravel, conserva los saltos de línea y se renderiza como texto para impedir
la inyección de HTML.

---

## 10. Autenticación

### `src/app/pages/auth/login.ts`

Gestiona el formulario de acceso:

- Captura correo y contraseña.
- Llama a `AuthService.login()`.
- Muestra un error si las credenciales no son válidas.
- Redirige a `/admin` cuando el acceso es correcto.

### `src/app/pages/auth/login.html`

Contiene la pantalla de acceso restringido, los campos del formulario, los
mensajes de validación y el estado de carga mientras responde la API.

### `src/app/pages/auth/auth.scss`

Comparte el diseño visual de las pantallas de autenticación: fondo, tarjeta, formularios, mensajes y responsive.

### `src/app/pages/auth/signup.ts` y `signup.html`

Implementan el alta de administradores en `/registro`. Además del nombre,
correo y contraseña, solicitan el código privado configurado en
`ADMIN_SIGNUP_CODE`. La API valida ese código antes de insertar la cuenta.

---

## 10.1 API de autenticación

### `server/config.ts`

Lee y valida la configuración de `.env`: conexión MySQL, CORS, puerto, clave
JWT, duración del token y código privado de registro.

### `server/database.ts`

Crea el pool de conexiones con `mysql2`. Centraliza el acceso a MySQL y evita
abrir una conexión nueva para cada petición.

### `server/migrate.ts`

Crea la tabla `users` al iniciar la API si aún no existe. La tabla contiene
nombre, correo único, hash de contraseña, rol, estado y marcas de tiempo.

### `server/auth.routes.ts`

Define los endpoints:

- `POST /api/auth/register`: valida el código privado, cifra la contraseña con
  bcrypt, crea el administrador y entrega un JWT.
- `POST /api/auth/login`: comprueba correo, contraseña y estado de la cuenta.
- `GET /api/auth/me`: devuelve el perfil asociado al JWT.
- `PATCH /api/auth/me`: modifica nombre y correo del administrador autenticado.

### `server/auth.middleware.ts`

Extrae el token `Bearer`, valida su firma y caducidad y comprueba en MySQL que
la cuenta siga activa y conserve el rol de administrador.

### `server/index.ts`

Inicializa Express, CORS, JSON, la ruta de salud y las rutas de autenticación.
También prueba la conexión y ejecuta la migración antes de aceptar peticiones.

### `server/types.ts`

Contiene los tipos TypeScript compartidos por las rutas y el middleware.

### `.env.example`

Documenta las variables obligatorias sin incluir valores secretos. El archivo
real `.env` está ignorado por Git.

---

## 11. Panel administrativo

### `src/app/pages/admin/admin.ts`

Concentra el comportamiento del dashboard.

Vistas internas disponibles:

- `summary`: resumen general.
- `documents`: gestión documental.
- `users`: administradores.
- `analytics`: métricas.
- `profile`: perfil actual.

Responsabilidades principales:

- Cambiar la vista activa del dashboard.
- Mostrar métricas.
- Subir PDF con título, descripción, categoría y fecha documental.
- Marcar documentos como públicos o privados.
- Cambiar la visibilidad posteriormente.
- Eliminar documentos.
- Consultar los administradores almacenados en la API.
- Crear varias cuentas administrativas con correo y contraseña independientes.
- Activar o desactivar cuentas sin permitir desactivar la sesión propia.
- Cambiar contraseñas y revocar las sesiones anteriores de la cuenta afectada.
- Editar el perfil.
- Cerrar sesión.

### `src/app/pages/admin/admin.html`

Construye toda la interfaz del panel:

- Barra lateral.
- Resumen con indicadores.
- Gestión de documentos.
- Formulario de carga.
- Tabla de administradores.
- Formularios para crear cuentas y cambiar contraseñas.
- Gráficas horizontales de actividad.
- Formulario de perfil.
- Información de seguridad.

Las vistas internas se controlan con bloques `@if` y `@switch` de Angular.

### `src/app/pages/admin/admin.scss`

Contiene el diseño completo del dashboard:

- Navegación lateral.
- Tarjetas de métricas.
- Formularios.
- Tablas.
- Indicadores de estado.
- Selector público/privado.
- Barras de actividad.
- Diseño responsive.

---

## 12. Flujo de documentos

```text
Administrador selecciona un PDF
              │
              ▼
Completa título, descripción, categoría y fecha
              │
              ▼
Selecciona visibilidad pública o privada
              │
              ▼
DocumentsService guarda archivo y metadatos en IndexedDB
              │
       ┌──────┴──────┐
       ▼             ▼
    Público        Privado
       │             │
       ▼             ▼
/documentos      Solo dashboard
```

El año y el mes utilizados por los filtros proceden de `documentDate`, no de la fecha en que el archivo fue cargado.

---

## 13. Flujo de autenticación

```text
Usuario abre /login
        │
        ▼
AuthService valida credenciales
        │
   ┌────┴────┐
   ▼         ▼
 Válidas   Inválidas
   │         │
   ▼         ▼
Guarda     Muestra error
sesión
   │
   ▼
Navega a /admin
```

Si se abre `/admin` sin sesión, `adminGuard` redirige a `/login`.

---

## 14. Dónde realizar cambios frecuentes

| Necesidad | Archivo principal |
| --- | --- |
| Cambiar colores globales | `src/styles.scss` |
| Cambiar tipografía | `src/styles.scss` |
| Modificar menú o footer | `layout/public-layout/` |
| Agregar una ruta | `src/app/app.routes.ts` |
| Cambiar información institucional | `pages/about/about.html` |
| Cambiar programas | `pages/programs/programs.html` |
| Cambiar mapa o contacto | `pages/presence/presence.html` |
| Modificar filtros de PDF | `pages/documents/documents.ts` |
| Cambiar diseño de documentos | `pages/documents/documents.scss` |
| Modificar el dashboard | `pages/admin/` |
| Cambiar autenticación | `core/services/auth.service.ts` |
| Cambiar almacenamiento de PDF | `core/services/documents.service.ts` |
| Cambiar métricas | `core/services/analytics.service.ts` |

---

## 15. Limitaciones actuales

- Los documentos solo existen en el navegador donde se cargaron.
- Los usuarios administrativos creados en el panel son locales.
- Las métricas no representan visitantes de otros dispositivos.
- IndexedDB puede eliminarse si el usuario borra los datos del navegador.
- Los JWT no tienen todavía renovación ni lista de revocación.

---

## 16. Recomendaciones para producción

1. Migrar documentos y métricas a servicios persistentes del backend.
2. Almacenar PDF en S3, Cloud Storage o un servicio equivalente.
3. Agregar renovación, revocación y recuperación de contraseña.
4. Registrar auditoría de creación, modificación y eliminación.
5. Configurar analítica con consentimiento y política de privacidad.
6. Añadir pruebas de integración para la API y la base de datos.
7. Configurar CI/CD para compilar y probar cada cambio.

---

## 17. Archivos generados que no deben editarse

### `node_modules/`

Contiene dependencias instaladas por npm. No se sube a GitHub ni se edita manualmente. Se reconstruye con:

```sh
npm install
```

### `dist/`

Contiene el resultado de `npm run build`. Se genera automáticamente y normalmente no se modifica ni versiona.

---

## 18. Lectura recomendada

Para instalar y ejecutar el proyecto, consultar [`README.md`](README.md).

Antes de desplegar la aplicación, revisar especialmente las secciones de limitaciones y recomendaciones para producción de este documento.
