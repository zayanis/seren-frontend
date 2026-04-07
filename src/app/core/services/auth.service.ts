import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AuthRequest, RegisterRequest, AuthResponse, CurrentUser
} from '@core/models';

const TOKEN_KEY = 'seren_token';
const USER_KEY  = 'seren_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // ── Signal-based state ──────────────────────────────────────────────────
  private _currentUser = signal<CurrentUser | null>(this.loadFromStorage());

  readonly currentUser   = this._currentUser.asReadonly();
  readonly isLoggedIn    = computed(() => !!this._currentUser());
  readonly isProprietaire = computed(() => this._currentUser()?.role === 'PROPRIETAIRE');
  readonly isLocataire    = computed(() => this._currentUser()?.role === 'LOCATAIRE');

  constructor(private http: HttpClient, private router: Router) {}

  // ── API calls ────────────────────────────────────────────────────────────
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(tap(res => this.handleAuth(res)));
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap(res => this.handleAuth(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Private ──────────────────────────────────────────────────────────────
  private handleAuth(res: AuthResponse): void {
    const user: CurrentUser = {
      ...res,
      initials: `${res.firstName[0]}${res.lastName[0]}`.toUpperCase()
    };
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);

    // Redirection selon rôle
    const route = res.role === 'PROPRIETAIRE'
      ? '/proprietaire/candidatures'
      : '/locataire/code-acces';
    this.router.navigate([route]);
  }

  private loadFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
