import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface InstitutionalInformationPayload {
  institutional_information: {
    data_processing_policy: string | null;
    updated_at: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class InstitutionalInformationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/institutional-information`;
  private pendingLoad: Promise<void> | null = null;

  readonly dataProcessingPolicy = signal('');
  readonly updatedAt = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  load(): Promise<void> {
    if (this.pendingLoad) return this.pendingLoad;

    this.loading.set(true);
    this.error.set('');
    this.pendingLoad = firstValueFrom(
      this.http.get<InstitutionalInformationPayload>(this.apiUrl),
    )
      .then((response) => this.applyPayload(response))
      .catch((error: unknown) => {
        this.error.set(this.errorMessage(error));
      })
      .finally(() => {
        this.loading.set(false);
        this.pendingLoad = null;
      });

    return this.pendingLoad;
  }

  async updateDataProcessingPolicy(policy: string): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await firstValueFrom(
        this.http.patch<InstitutionalInformationPayload>(
          `${environment.apiUrl}/admin/institutional-information`,
          { data_processing_policy: policy },
          { headers: this.authHeaders() },
        ),
      );
      this.applyPayload(response);
    } catch (error) {
      const message = this.errorMessage(error);
      this.error.set(message);
      throw new Error(message);
    } finally {
      this.loading.set(false);
    }
  }

  private applyPayload(response: InstitutionalInformationPayload): void {
    this.dataProcessingPolicy.set(
      response.institutional_information.data_processing_policy ?? '',
    );
    this.updatedAt.set(response.institutional_information.updated_at);
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('abrazo-token') ?? ''}`,
    });
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return String(
        error.error?.message ??
          'No fue posible cargar la información institucional.',
      );
    }

    return 'Ocurrió un error inesperado.';
  }
}
