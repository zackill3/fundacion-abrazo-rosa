import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Session { id: number; name: string; email: string; role: 'admin' | 'user'; }
interface AuthResponse { token: string; user: Session; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  readonly session = signal<Session | null>(this.readSession());

  async login(email: string, password: string): Promise<Session> {
    const result = await firstValueFrom(this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }));
    this.saveAuth(result);
    return result.user;
  }

  async register(name: string, email: string, password: string, signupCode: string): Promise<Session> {
    const result = await firstValueFrom(this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password, signupCode }));
    this.saveAuth(result);
    return result.user;
  }

  async updateProfile(name: string, email: string): Promise<void> {
    const result = await firstValueFrom(this.http.patch<AuthResponse>(`${this.apiUrl}/me`, { name, email }, { headers: this.authHeaders() }));
    this.saveAuth(result);
  }

  async validateSession(): Promise<boolean> {
    if (!this.token()) return false;
    try {
      const result = await firstValueFrom(this.http.get<{ user: Session }>(`${this.apiUrl}/me`, { headers: this.authHeaders() }));
      this.session.set(result.user); localStorage.setItem('abrazo-session', JSON.stringify(result.user)); return result.user.role === 'admin';
    } catch { this.logout(); return false; }
  }

  logout(): void { localStorage.removeItem('abrazo-token'); localStorage.removeItem('abrazo-session'); this.session.set(null); }
  isAdmin(): boolean { return this.session()?.role === 'admin' && Boolean(this.token()); }
  errorMessage(error: unknown): string { return error instanceof HttpErrorResponse ? String(error.error?.message ?? 'No fue posible conectar con el servidor.') : 'Ocurrió un error inesperado.'; }

  private token(): string | null { return localStorage.getItem('abrazo-token'); }
  private authHeaders(): HttpHeaders { return new HttpHeaders({ Authorization: `Bearer ${this.token() ?? ''}` }); }
  private saveAuth(result: AuthResponse): void { localStorage.setItem('abrazo-token', result.token); localStorage.setItem('abrazo-session', JSON.stringify(result.user)); this.session.set(result.user); }
  private readSession(): Session | null { try { return JSON.parse(localStorage.getItem('abrazo-session') ?? 'null'); } catch { return null; } }
}
