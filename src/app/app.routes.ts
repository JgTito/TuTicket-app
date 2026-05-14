import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.page').then((m) => m.RegisterPage),
    canActivate: [guestGuard]
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/app-layout.component').then((m) => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'app',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
        canActivate: [adminGuard]
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/tickets/ticket-bandeja.page').then((m) => m.TicketBandejaPage)
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/tickets/ticket-detalle.page').then((m) => m.TicketDetallePage)
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./features/notificaciones/notificaciones.page').then((m) => m.NotificacionesPage)
      },
      {
        path: 'admin/usuarios',
        loadComponent: () => import('./features/admin-usuario/admin-usuario.page').then((m) => m.AdminUsuarioPage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/estados-ticket',
        loadComponent: () => import('./features/estado-ticket/estado-ticket.page').then((m) => m.EstadoTicketPage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/flujos-estado-ticket',
        loadComponent: () => import('./features/flujo-estado-ticket/flujo-estado-ticket.page').then((m) => m.FlujoEstadoTicketPage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/prioridades-ticket',
        loadComponent: () => import('./features/prioridad-ticket/prioridad-ticket.page').then((m) => m.PrioridadTicketPage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/categorias-ticket',
        loadComponent: () => import('./features/categoria-ticket/categoria-ticket.page').then((m) => m.CategoriaTicketPage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/categorias-responsables',
        loadComponent: () => import('./features/categoria-responsable/categoria-responsable.page').then((m) => m.CategoriaResponsablePage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/subcategorias-ticket',
        loadComponent: () => import('./features/subcategoria-ticket/subcategoria-ticket.page').then((m) => m.SubcategoriaTicketPage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/equipos-soporte',
        loadComponent: () => import('./features/equipo-soporte/equipo-soporte.page').then((m) => m.EquipoSoportePage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/tipos-relacion-ticket',
        loadComponent: () => import('./features/tipo-relacion-ticket/tipo-relacion-ticket.page').then((m) => m.TipoRelacionTicketPage),
        canActivate: [adminGuard]
      },
      {
        path: 'admin/sla-politicas',
        loadComponent: () => import('./features/sla-politica/sla-politica.page').then((m) => m.SlaPoliticaPage),
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
