import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout/public-layout';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Programs } from './pages/programs/programs';
import { Presence } from './pages/presence/presence';
import { Documents } from './pages/documents/documents';
import { Login } from './pages/auth/login';
import { Signup } from './pages/auth/signup';
import { Admin } from './pages/admin/admin';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Home, title: 'Inicio | Abrazo Rosa' },
      { path: 'quienes-somos', component: About, title: 'Quiénes somos | Abrazo Rosa' },
      { path: 'que-hacemos', component: Programs, title: 'Qué hacemos | Abrazo Rosa' },
      { path: 'presencia', component: Presence, title: 'Presencia | Abrazo Rosa' },
      { path: 'documentos', component: Documents, title: 'Documentos públicos | Abrazo Rosa' },
    ],
  },
  { path: 'login', component: Login, title: 'Iniciar sesión | Abrazo Rosa' },
  { path: 'registro', component: Signup, title: 'Registro administrativo | Abrazo Rosa' },
  { path: 'admin', component: Admin, canActivate: [adminGuard], title: 'Panel administrativo | Abrazo Rosa' },
  { path: '**', redirectTo: '' },
];
