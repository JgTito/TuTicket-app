import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificacionService } from '../notifications/notificacion.service';

interface NavItem {
  label: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html'
})
export class AppLayoutComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly notificacionService = inject(NotificacionService);

  readonly navItems: NavItem[] = [
    { label: 'Panel', route: '/app', adminOnly: true },
    { label: 'Tickets', route: '/tickets' },
    { label: 'Notificaciones', route: '/notificaciones' },
    { label: 'Usuarios', route: '/admin/usuarios', adminOnly: true },
    { label: 'Estados', route: '/admin/estados-ticket', adminOnly: true },
    { label: 'Flujos', route: '/admin/flujos-estado-ticket', adminOnly: true },
    { label: 'Prioridades', route: '/admin/prioridades-ticket', adminOnly: true },
    { label: 'Categorias', route: '/admin/categorias-ticket', adminOnly: true },
    { label: 'Responsables', route: '/admin/categorias-responsables', adminOnly: true },
    { label: 'Subcategorias', route: '/admin/subcategorias-ticket', adminOnly: true },
    { label: 'Equipos', route: '/admin/equipos-soporte', adminOnly: true },
    { label: 'Relaciones', route: '/admin/tipos-relacion-ticket', adminOnly: true },
    { label: 'SLA', route: '/admin/sla-politicas', adminOnly: true }
  ];

  constructor() {
    this.notificacionService.refreshUnreadCount().subscribe({
      error: () => this.notificacionService.resetUnreadCount()
    });
  }

  visibleNavItems(): NavItem[] {
    return this.navItems.filter((item) => !item.adminOnly || this.authService.isAdmin());
  }

  logout(): void {
    this.notificacionService.resetUnreadCount();
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
