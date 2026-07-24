import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
}

interface AdminUserResponse {
  user: AdminUser;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/users`;
  readonly users = signal<AdminUser[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await firstValueFrom(
        this.http.get<AdminUsersResponse>(this.apiUrl, { headers: this.authHeaders() }),
      );
      this.users.set(response.users);
    } catch (error) {
      this.error.set(this.errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  async create(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<AdminUser> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await firstValueFrom(
        this.http.post<AdminUserResponse>(
          this.apiUrl,
          {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
          },
          { headers: this.authHeaders() },
        ),
      );
      this.users.update((users) =>
        [...users, response.user].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return response.user;
    } catch (error) {
      this.error.set(this.errorMessage(error));
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async updatePassword(
    userId: number,
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    await this.update(userId, {
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  async setActive(userId: number, isActive: boolean): Promise<void> {
    await this.update(userId, { is_active: isActive });
  }

  errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Ocurrió un error inesperado.';
    }

    const validationErrors = error.error?.errors as Record<string, string[]> | undefined;
    const firstValidationError = validationErrors
      ? Object.values(validationErrors).flat()[0]
      : undefined;

    return String(
      firstValidationError ??
        error.error?.message ??
        'No fue posible conectar con el servidor.',
    );
  }

  private async update(userId: number, changes: Record<string, unknown>): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await firstValueFrom(
        this.http.patch<AdminUserResponse>(`${this.apiUrl}/${userId}`, changes, {
          headers: this.authHeaders(),
        }),
      );
      this.users.update((users) =>
        users.map((user) => (user.id === userId ? response.user : user)),
      );
    } catch (error) {
      this.error.set(this.errorMessage(error));
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('abrazo-token') ?? ''}`,
    });
  }
}
