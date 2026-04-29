import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, RegisterRequest } from './auth.models';

const AUTH_STORAGE_KEY = 'tuTicket.auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Usuario`;
  private readonly currentUserSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const user = this.currentUserSignal();

    if (!user) {
      return false;
    }

    return new Date(user.expira).getTime() > Date.now();
  });

  readonly isAdmin = computed(() =>
    this.isAuthenticated() &&
    this.currentUserSignal()?.roles.some((role) => role === 'Administrador') === true
  );

  login(request: LoginRequest) {
    return this.http.post<AuthUser>(`${this.apiUrl}/login`, request).pipe(
      tap((user) => this.storeUser(user))
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<AuthUser>(`${this.apiUrl}/registrar`, request).pipe(
      tap((user) => this.storeUser(user))
    );
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return this.isAuthenticated() ? this.currentUserSignal()?.token ?? null : null;
  }

  private storeUser(user: AuthUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private readStoredUser(): AuthUser | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}
