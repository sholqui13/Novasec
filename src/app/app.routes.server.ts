import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  // La sesión vive en sessionStorage, que solo existe en el navegador.
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
