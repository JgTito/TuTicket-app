import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Notificacion, NotificacionFilters, PaginatedResult } from './notificacion.models';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/Notificacion`;
  private readonly unreadCountSignal = signal(0);

  readonly unreadCount = this.unreadCountSignal.asReadonly();

  getMisNotificaciones(pagina: number, tamanoPagina: number, filters?: NotificacionFilters) {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanoPagina', tamanoPagina);

    if (filters?.soloNoLeidas) params = params.set('soloNoLeidas', true);
    if (filters?.idTicket) params = params.set('idTicket', filters.idTicket);
    if (filters?.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);

    return this.http.get<PaginatedResult<Notificacion>>(`${this.apiUrl}/mis-notificaciones`, { params });
  }

  refreshUnreadCount() {
    const userId = this.authService.currentUser()?.id;
    let params = new HttpParams();

    if (userId) {
      params = params.set('idUsuarioDestino', userId);
    }

    return this.http.get<{ total: number; Total?: number }>(`${this.apiUrl}/no-leidas/count`, { params }).pipe(
      tap((response) => this.unreadCountSignal.set(response.total ?? response.Total ?? 0))
    );
  }

  markRead(idNotificacion: number) {
    return this.http.put<void>(`${this.apiUrl}/${idNotificacion}/marcar-leida`, {}).pipe(
      tap(() => this.decrementUnreadCount())
    );
  }

  markUnread(idNotificacion: number) {
    return this.http.put<void>(`${this.apiUrl}/${idNotificacion}/marcar-no-leida`, {}).pipe(
      tap(() => this.unreadCountSignal.update((count) => count + 1))
    );
  }

  markReadMany(ids: number[]) {
    return this.http.put<void>(`${this.apiUrl}/marcar-leidas`, { idNotificaciones: ids }).pipe(
      tap(() => this.unreadCountSignal.update((count) => Math.max(0, count - ids.length)))
    );
  }

  markAllRead() {
    const userId = this.authService.currentUser()?.id;
    let params = new HttpParams();

    if (userId) {
      params = params.set('idUsuarioDestino', userId);
    }

    return this.http.put<void>(`${this.apiUrl}/marcar-todas-leidas`, {}, { params }).pipe(
      tap(() => this.unreadCountSignal.set(0))
    );
  }

  resetUnreadCount(): void {
    this.unreadCountSignal.set(0);
  }

  private decrementUnreadCount(): void {
    this.unreadCountSignal.update((count) => Math.max(0, count - 1));
  }
}
