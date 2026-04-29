import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth/auth.guard';
import { AppLayoutComponent } from './core/layout/app-layout.component';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { EquipoSoportePage } from './features/equipo-soporte/equipo-soporte.page';
import { CategoriaResponsablePage } from './features/categoria-responsable/categoria-responsable.page';
import { CategoriaTicketPage } from './features/categoria-ticket/categoria-ticket.page';
import { EstadoTicketPage } from './features/estado-ticket/estado-ticket.page';
import { PrioridadTicketPage } from './features/prioridad-ticket/prioridad-ticket.page';
import { SubcategoriaTicketPage } from './features/subcategoria-ticket/subcategoria-ticket.page';
import { TipoRelacionTicketPage } from './features/tipo-relacion-ticket/tipo-relacion-ticket.page';
import { SlaPoliticaPage } from './features/sla-politica/sla-politica.page';
import { TicketBandejaPage } from './features/tickets/ticket-bandeja.page';
import { TicketDetallePage } from './features/tickets/ticket-detalle.page';
import { LoginPage } from './features/auth/login.page';
import { RegisterPage } from './features/auth/register.page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: LoginPage,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterPage,
    canActivate: [guestGuard]
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'app',
        component: DashboardPage
      },
      {
        path: 'tickets',
        component: TicketBandejaPage
      },
      {
        path: 'tickets/:id',
        component: TicketDetallePage
      },
      {
        path: 'admin/estados-ticket',
        component: EstadoTicketPage,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/prioridades-ticket',
        component: PrioridadTicketPage,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/categorias-ticket',
        component: CategoriaTicketPage,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/categorias-responsables',
        component: CategoriaResponsablePage,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/subcategorias-ticket',
        component: SubcategoriaTicketPage,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/equipos-soporte',
        component: EquipoSoportePage,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/tipos-relacion-ticket',
        component: TipoRelacionTicketPage,
        canActivate: [adminGuard]
      },
      {
        path: 'admin/sla-politicas',
        component: SlaPoliticaPage,
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
