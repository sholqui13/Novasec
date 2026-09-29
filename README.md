# Novasec

Maqueta funcional de **Novasec**, una plataforma de operaciones de seguridad para Inovisec. Permite iniciar sesión, ver los casos activos sobre un mapa del campus y consultar el detalle de cada caso.

La interfaz se construyó a partir del handoff de Figma. No hay backend: la autenticación y los casos se simulan con datos locales.

## Cómo ejecutar la maqueta

### Requisitos

- [Node.js](https://nodejs.org/) 22 o superior (se desarrolló con Node 24.19)
- npm 11 (viene con Node)

### Pasos

1. Instala las dependencias:

   ```bash
   npm ci
   ```

2. Inicia el servidor de desarrollo:

   ```bash
   npm start
   ```

3. Abre [http://localhost:4200](http://localhost:4200) en el navegador.

4. Inicia sesión con uno de los usuarios de prueba:

   | Usuario     | Contraseña   | Rol                   |
   | ----------- | ------------ | --------------------- |
   | `m.alvarez` | `novasec123` | Senior Analyst        |
   | `j.perez`   | `novasec123` | Operations Supervisor |

### Pantallas disponibles

| Ruta          | Pantalla                                                        |
| ------------- | --------------------------------------------------------------- |
| `/login`      | Inicio de sesión                                                |
| `/`           | Dashboard con el mapa de casos activos y el panel del caso      |
| `/cases/1042` | Detalle de un caso (también `1041`, `1038`, `1043` y `1036`)    |
| `/dev/ui`     | Catálogo de componentes de UI (solo en modo desarrollo)         |

### Cómo ver los demás estados

- **Credenciales incorrectas:** ingresa una contraseña distinta a `novasec123`. Aparece la alerta y los dos campos se marcan en error.
- **Carga:** las respuestas simuladas tardan menos de un segundo, así que el skeleton del dashboard se ve al recargar la página.
- **Error de carga de casos:** ejecuta esto en la consola del navegador y recarga:

  ```js
  localStorage.setItem('nvs.fakeCasesError', '1');
  ```

  Para volver al estado normal, ejecuta `localStorage.removeItem('nvs.fakeCasesError')` y recarga.

- **Caso no encontrado:** abre un número que no exista, por ejemplo `/cases/9999`.

### Otros comandos

| Comando                     | Qué hace                                                        |
| --------------------------- | --------------------------------------------------------------- |
| `npm test`                  | Ejecuta las pruebas unitarias con Vitest                        |
| `npm run build`             | Genera la versión de producción en `dist/`                      |
| `npm run serve:ssr:Novasec` | Sirve la versión de producción (ejecuta antes `npm run build`)  |

### Si algo falla

- **El navegador muestra una versión vieja o hay errores de `UpdateMetadata` en la consola:** detén el servidor, borra la carpeta `.angular/cache` y vuelve a ejecutar `npm start`.
- **Node se queda sin memoria al compilar o al correr las pruebas:** en equipos con poca RAM, define `NODE_OPTIONS=--max-semi-space-size=1` antes del comando. Por ejemplo, en PowerShell: `$env:NODE_OPTIONS="--max-semi-space-size=1"; npm test`.

## Tecnologías

| Tecnología                                                   | Para qué se usa                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| [Angular 22](https://angular.dev/)                           | Framework de la aplicación                                          |
| TypeScript 6                                                 | Lenguaje, en modo estricto                                          |
| SCSS                                                         | Estilos, con tokens de diseño en variables CSS                      |
| Angular SSR                                                  | Pre-renderiza el login; el resto se renderiza en el navegador       |
| [Leaflet](https://leafletjs.com/)                            | Mapa interactivo del campus con los marcadores de los casos         |
| [Lucide](https://lucide.dev/)                                | Iconos                                                              |
| [Vitest](https://vitest.dev/) + jsdom                        | Pruebas unitarias                                                   |
| Prettier                                                     | Formato del código                                                  |

## Proceso de desarrollo

### Del diseño al código

1. **Fundamentos.** Primero se pasaron a código los estilos de Figma: colores, tipografía, espaciados, radios, sombras y breakpoints. Viven en `src/styles/tokens` como variables CSS (`--nvs-*`). Los colores se respetaron tal como están en Figma.
2. **Componentes de UI.** Luego se construyeron los componentes reutilizables de `src/app/shared/ui`: botón, input, badge, alerta, toast, modal, avatar, icono, breadcrumb, skeleton y estados de feedback. Cada uno se revisó contra los valores de Figma Dev Mode.
3. **Layout y pantallas.** Por último se armó el marco de la aplicación (header y sidebar) y las pantallas de login, dashboard y detalle del caso.

### Decisiones principales

- **Componentes standalone y signals.** No se usan `NgModule`. El estado se maneja con signals de Angular, y todos los componentes usan detección de cambios `OnPush`.
- **Datos simulados detrás de una interfaz.** Las pantallas consumen las clases abstractas `AuthApi` y `CasesApi`. Hoy las implementan `FakeAuthApi` y `FakeCasesApi`, con un pequeño retraso para simular la red. Para conectar un backend real solo hay que escribir otra implementación; las pantallas no cambian.
- **Sesión en `sessionStorage`.** La sesión dura mientras la pestaña esté abierta. Las rutas privadas están protegidas con un guard que redirige al login.
- **Mapa sobre una imagen.** El campus es una imagen (`src/assets/images/map/campus-map.jpg`) mostrada con Leaflet en coordenadas simples, no un mapa geográfico. Cada caso guarda su posición sobre esa imagen.
- **Responsive.** Hay tres tamaños: móvil, tablet (desde 600 px) y escritorio (desde 1024 px). En móvil, el sidebar se abre desde el botón del header.
- **Accesibilidad.** Se usan etiquetas semánticas, `aria-invalid` y mensajes de error asociados en los formularios, anuncios con `role="alert"` y `role="status"`, y foco visible con teclado.
- **Seguridad del login.** Ante credenciales incorrectas se marcan ambos campos sin indicar cuál falló, para no revelar qué usuarios existen. El parámetro `returnUrl` solo acepta rutas internas.

### Estructura del proyecto

```text
src/
├── app/
│   ├── core/          Autenticación, modelos y servicios globales
│   ├── shared/ui/     Componentes de UI reutilizables
│   ├── layout/        Marco de la aplicación: app-shell, header y sidebar
│   ├── features/
│   │   ├── cases/     Componentes, modelos, servicios y detalle de casos
│   │   └── pages/     Pantallas de login y dashboard
│   └── dev/           Catálogo de componentes (solo desarrollo)
├── assets/images/     Logos, fondo del login y mapa del campus
└── styles/            Tokens, mixins y estilos base
```

El proyecto define los alias `@core/*`, `@shared/*` y `@features/*` para no escribir rutas relativas largas en los imports.

### Pruebas

Cada componente, servicio y pantalla tiene su archivo `.spec.ts`. Las pruebas cubren el comportamiento visible para el usuario: estados de carga y error, validación del formulario, navegación y accesibilidad básica. Se ejecutan con `npm test`.
