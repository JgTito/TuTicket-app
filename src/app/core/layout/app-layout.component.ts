import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificacionService } from '../notifications/notificacion.service';

interface NavLink {
  type: 'link';
  label: string;
  route: string;
  exact?: boolean;
  badge?: 'notifications';
  adminOnly?: boolean;
}

interface NavDropdown {
  type: 'dropdown';
  label: string;
  adminOnly?: boolean;
  items: NavLink[];
}

type NavEntry = NavLink | NavDropdown;

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app-layout.component.html'
})
export class AppLayoutComponent {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly notificacionService = inject(NotificacionService);
  readonly openDropdown = signal<string | null>(null);

  readonly navEntries: NavEntry[] = [
    { type: 'link', label: 'Panel', route: '/app', exact: true, adminOnly: true },
    { type: 'link', label: 'Tickets', route: '/tickets' },
    { type: 'link', label: 'Notificaciones', route: '/notificaciones', badge: 'notifications' },
    {
      type: 'dropdown',
      label: 'Administracion',
      adminOnly: true,
      items: [
        { type: 'link', label: 'Usuarios', route: '/admin/usuarios' },
        { type: 'link', label: 'Equipos', route: '/admin/equipos-soporte' },
        { type: 'link', label: 'Responsables', route: '/admin/categorias-responsables' },
        { type: 'link', label: 'Informe IA', route: '/admin/informe-ia-soporte' }
      ]
    },
    {
      type: 'dropdown',
      label: 'Configuracion tickets',
      adminOnly: true,
      items: [
        { type: 'link', label: 'Estados', route: '/admin/estados-ticket' },
        { type: 'link', label: 'Flujos', route: '/admin/flujos-estado-ticket' },
        { type: 'link', label: 'Prioridades', route: '/admin/prioridades-ticket' },
        { type: 'link', label: 'Categorias', route: '/admin/categorias-ticket' },
        { type: 'link', label: 'Subcategorias', route: '/admin/subcategorias-ticket' },
        { type: 'link', label: 'Relaciones', route: '/admin/tipos-relacion-ticket' },
        { type: 'link', label: 'SLA', route: '/admin/sla-politicas' }
      ]
    }
  ];

  constructor() {
    this.notificacionService.refreshUnreadCount().subscribe({
      error: () => this.notificacionService.resetUnreadCount()
    });
  }

  visibleNavEntries(): NavEntry[] {
    return this.navEntries
      .filter((entry) => !entry.adminOnly || this.authService.isAdmin())
      .map((entry) => {
        if (entry.type === 'link') return entry;
        return {
          ...entry,
          items: entry.items.filter((item) => !item.adminOnly || this.authService.isAdmin())
        };
      })
      .filter((entry) => entry.type === 'link' || entry.items.length > 0);
  }

  isDropdown(entry: NavEntry): entry is NavDropdown {
    return entry.type === 'dropdown';
  }

  isLinkActive(item: NavLink): boolean {
    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    if (item.exact) return currentUrl === item.route;
    return currentUrl === item.route || currentUrl.startsWith(`${item.route}/`);
  }

  isDropdownActive(entry: NavDropdown): boolean {
    return entry.items.some((item) => this.isLinkActive(item));
  }

  isDropdownOpen(entry: NavDropdown): boolean {
    return this.openDropdown() === entry.label;
  }

  toggleDropdown(label: string): void {
    this.openDropdown.update((current) => current === label ? null : label);
  }

  closeDropdowns(): void {
    this.openDropdown.set(null);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeDropdowns();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDropdowns();
  }

  logout(): void {
    this.notificacionService.resetUnreadCount();
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
