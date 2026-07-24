# Fundación Abrazo Rosa

> El backend Laravel se encuentra en [`api/`](api/README.md). En producción,
> Angular se publica en Netlify y consume
> `https://api.fundacionabrazorosa.org/api`.

Sitio web institucional desarrollado con **Angular** para la Fundación Abrazo Rosa. La aplicación presenta información sobre la organización, su misión, visión, programas y presencia en Cali. También incluye una biblioteca pública de documentos PDF y un panel administrativo protegido para gestionar archivos, administradores, perfiles y métricas locales.

Este README se encuentra disponible en **español e inglés**.

Para conocer en detalle la arquitectura y la responsabilidad de cada archivo, consulta la [documentación técnica](DOCUMENTACION_TECNICA.md).

---

<details open>
<summary><strong>Fundación Abrazo Rosa | Español</strong></summary>

## Descripción

La plataforma ofrece un sitio institucional responsive y un área administrativa privada. Entre sus funciones principales se encuentran:

- Inicio y presentación institucional.
- Sección «Quiénes somos», misión y visión.
- Información sobre los programas de la Fundación.
- Presencia en Cali con mapa integrado de Google Maps.
- Biblioteca pública de documentos PDF.
- Búsqueda por título, descripción o categoría.
- Filtros por categoría, año y mes del documento.
- Visualizador de PDF dentro de la página.
- Documentos públicos y privados.
- Panel administrativo protegido mediante un guard de Angular.
- Edición administrativa de la política de tratamiento de datos.
- Sección pública de transparencia sincronizada con Laravel.
- Gestión local de documentos y cuentas administrativas.
- Métricas locales de visitas, páginas vistas y clics.
- Edición del perfil administrativo.

> [!IMPORTANT]
> La autenticación y la política de tratamiento de datos se conectan con la API
> de Laravel en producción. Los documentos y las métricas del frontend todavía
> conservan componentes de almacenamiento local que deben migrarse por completo
> al backend.

---

## Tecnologías utilizadas

- Angular 21
- TypeScript 5.9
- Angular Router
- Angular Forms
- RxJS
- SCSS
- IndexedDB
- Local Storage y Session Storage
- Vitest
- Google Maps Embed
- API Laravel desplegada en Laravel Cloud

---

## Requisitos previos

Antes de ejecutar el proyecto se necesita:

- [Node.js](https://nodejs.org/) 22 o superior.
- npm 10 o superior, incluido con Node.js.
- Git.

Para comprobar las versiones instaladas:

```sh
node --version
npm --version
git --version
```

Si PowerShell bloquea `npm.ps1`, se pueden ejecutar los mismos comandos utilizando `npm.cmd`.

---

## Instalación y ejecución

### 1. Clonar el repositorio

Reemplaza `TU_USUARIO` por el usuario propietario del repositorio:

```sh
git clone https://github.com/TU_USUARIO/fundacion-abrazo-rosa.git
cd fundacion-abrazo-rosa
```

### 2. Instalar las dependencias

La carpeta `node_modules` no se incluye en GitHub. Después de clonar el repositorio se debe reconstruir usando `package.json` y `package-lock.json`:

```sh
npm install
```

En Windows, si PowerShell impide ejecutar npm:

```powershell
npm.cmd install
```

### 3. Configurar la base de datos y la autenticación

Copia `.env.example` como `.env` y completa las credenciales de MySQL:

```env
DB_HOST=servidor_mysql
DB_PORT=3306
DB_DATABASE=nombre_de_la_base
DB_USERNAME=usuario
DB_PASSWORD=contraseña
DB_SSL=true

JWT_SECRET=una_clave_larga_y_aleatoria
ADMIN_SIGNUP_CODE=un_codigo_privado_para_registrar_administradores
```

El archivo `.env` contiene secretos y no se debe subir al repositorio.

### 4. Iniciar Angular y la API

```sh
npm run start:all
```

Alternativa para Windows:

```powershell
npm.cmd run start:all
```

Este comando inicia Angular en `http://localhost:4200` y la API en
`http://localhost:3000`. Al conectarse por primera vez, la API crea
automáticamente la tabla `users` si todavía no existe.

### 5. Iniciar solamente Angular

```sh
npm start
```

Alternativa para Windows:

```powershell
npm.cmd start
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

Angular recargará automáticamente la página cuando se modifique el código fuente.

---

## Acceso administrativo

El acceso administrativo no aparece en la navegación pública. Se encuentra disponible directamente en:

```text
http://localhost:4200/login
```

Para crear la primera cuenta, abre `http://localhost:4200/registro` y utiliza
el código privado definido en `ADMIN_SIGNUP_CODE`. El nombre, correo y
contraseña se guardan en MySQL; la contraseña se almacena como hash bcrypt.

Después de iniciar sesión, el administrador es redirigido a:

```text
http://localhost:4200/admin
```

El inicio de sesión devuelve un token JWT. Las rutas administrativas validan
la sesión contra la API antes de permitir el acceso.

---

## Rutas principales

| Ruta | Descripción | Acceso |
| --- | --- | --- |
| `/` | Página de inicio | Público |
| `/quienes-somos` | Información institucional, misión y visión | Público |
| `/que-hacemos` | Programas y áreas de trabajo | Público |
| `/presencia` | Ubicación y contacto | Público |
| `/documentos` | Biblioteca de documentos públicos | Público |
| `/transparencia` | Política de tratamiento de datos personales | Público |
| `/login` | Inicio de sesión administrativo | Restringido |
| `/admin` | Panel administrativo | Solo administradores |

---

## Gestión de documentos

Desde el panel administrativo se puede:

- Subir archivos PDF.
- Registrar título, descripción, categoría y fecha real del documento.
- Definir un documento como público o privado.
- Cambiar posteriormente su visibilidad.
- Visualizar y eliminar documentos.

Los documentos públicos aparecen en `/documentos`. Los privados solamente son visibles desde el dashboard.

Los archivos se guardan actualmente en **IndexedDB**, por lo que permanecen después de recargar la página, pero solo existen en el navegador y dispositivo donde fueron cargados.

---

## Política de tratamiento de datos

El panel administrativo contiene una vista de **Transparencia**. La política se
guarda en la API Laravel mediante una ruta protegida y se consulta públicamente
desde `/transparencia`. La portada también muestra un extracto actualizado.

---

## Estructura del proyecto

```text
fundacion-abrazo-rosa/
├── public/                         # Archivos públicos
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/             # Protección de rutas administrativas
│   │   │   └── services/           # Autenticación, documentos y métricas
│   │   ├── layout/
│   │   │   └── public-layout/      # Navegación y pie de página públicos
│   │   ├── pages/
│   │   │   ├── about/              # Quiénes somos, misión y visión
│   │   │   ├── admin/              # Panel administrativo
│   │   │   ├── auth/               # Inicio de sesión
│   │   │   ├── documents/          # Biblioteca pública de PDF
│   │   │   ├── home/               # Inicio
│   │   │   ├── presence/           # Presencia y mapa
│   │   │   └── programs/           # Qué hacemos
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── package-lock.json
└── README.md
```

---

## Compilar para producción

```sh
npm run build
```

En Windows:

```powershell
npm.cmd run build
```

Los archivos compilados se generarán en:

```text
dist/fundacion-abrazo-rosa/
```

---

## Ejecutar las pruebas

```sh
npm test -- --watch=false
```

En Windows:

```powershell
npm.cmd test -- --watch=false
```

---

## Solución de problemas

### La carpeta `node_modules` no existe

Ejecuta:

```sh
npm install
```

### `ng` no se reconoce como comando

No es necesario instalar Angular CLI globalmente. Utiliza los scripts incluidos:

```sh
npm start
```

También se puede utilizar:

```sh
npx ng serve
```

### PowerShell bloquea la ejecución de npm

Utiliza el ejecutable `.cmd`:

```powershell
npm.cmd install
npm.cmd start
```

### El puerto 4200 está ocupado

Ejecuta el servidor en otro puerto:

```sh
npm start -- --port 4300
```

---

## Próximos pasos

- Almacenar documentos en un servicio centralizado.
- Registrar métricas reales desde todos los dispositivos.
- Agregar recuperación de contraseña.
- Agregar renovación y revocación de tokens.
- Preparar despliegue y dominio de producción.

</details>

---

<details>
<summary><strong>Fundación Abrazo Rosa | English</strong></summary>

## Description

Fundación Abrazo Rosa is a responsive institutional website built with Angular. It presents the organization's mission, vision, programs, and presence in Cali. It also includes a public PDF library and a protected administration dashboard.

Main features:

- Institutional pages and responsive navigation.
- Google Maps integration.
- Public and private PDF documents.
- Search and filters by category, document year, and document month.
- Embedded PDF viewer.
- Protected administration dashboard.
- Local administrator, profile, and document management.
- Local page-view and click analytics.

> [!IMPORTANT]
> This version is a frontend prototype. Authentication, analytics, and files are stored locally in the browser. A backend, database, and secure file storage service are required for production.

---

## Technologies

- Angular 21
- TypeScript 5.9
- Angular Router and Forms
- RxJS
- SCSS
- IndexedDB
- Local Storage and Session Storage
- Vitest
- Google Maps Embed

---

## Requirements

- [Node.js](https://nodejs.org/) 22 or newer.
- npm 10 or newer.
- Git.

Check the installed versions:

```sh
node --version
npm --version
git --version
```

---

## Installation and Usage

### 1. Clone the repository

Replace `YOUR_USERNAME` with the repository owner's username:

```sh
git clone https://github.com/YOUR_USERNAME/fundacion-abrazo-rosa.git
cd fundacion-abrazo-rosa
```

### 2. Install dependencies

The `node_modules` directory is not committed to GitHub. Recreate it from `package.json` and `package-lock.json`:

```sh
npm install
```

Windows PowerShell alternative:

```powershell
npm.cmd install
```

### 3. Configure the database and authentication

Copy `.env.example` to `.env` and fill in the MySQL credentials:

```env
DB_HOST=mysql_host
DB_PORT=3306
DB_DATABASE=database_name
DB_USERNAME=username
DB_PASSWORD=password
DB_SSL=true

JWT_SECRET=a_long_random_secret
ADMIN_SIGNUP_CODE=a_private_administrator_registration_code
```

Never commit `.env`, since it contains secrets.

### 4. Start Angular and the API

```sh
npm run start:all
```

Windows alternative:

```powershell
npm.cmd run start:all
```

Angular runs at `http://localhost:4200` and the API at
`http://localhost:3000`. On its first successful connection, the API creates
the `users` table if it does not exist.

### 5. Start only Angular

```sh
npm start
```

Windows alternative:

```powershell
npm.cmd start
```

Open the application at:

```text
http://localhost:4200
```

---

## Administrator Access

The administration login is intentionally hidden from the public navigation:

```text
http://localhost:4200/login
```

Create the first account at `http://localhost:4200/registro`, using the
private value configured in `ADMIN_SIGNUP_CODE`. User data is stored in
MySQL, passwords are hashed with bcrypt, and successful authentication
returns a JWT.

---

## Production Build

```sh
npm run build
```

The optimized application will be generated in:

```text
dist/fundacion-abrazo-rosa/
```

---

## Tests

```sh
npm test -- --watch=false
```

---

## Troubleshooting

If `node_modules` is missing:

```sh
npm install
```

If `ng` is not recognized, use the npm script instead of installing Angular CLI globally:

```sh
npm start
```

If port 4200 is busy:

```sh
npm start -- --port 4300
```

---

## Future Improvements

- Centralized PDF file storage.
- Real analytics across devices.
- Password recovery.
- Token refresh and revocation.
- Production deployment and custom domain.

</details>
