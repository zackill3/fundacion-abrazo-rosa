import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DocumentsService, DocumentVisibility } from '../../core/services/documents.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { InstitutionalInformationService } from '../../core/services/institutional-information.service';

type AdminView = 'summary' | 'documents' | 'content' | 'users' | 'analytics' | 'profile';
interface AdminUser { id: number; name: string; email: string; status: 'Activo' | 'Inactivo'; }

@Component({ selector: 'app-admin', imports: [FormsModule, RouterLink], templateUrl: './admin.html', styleUrl: './admin.scss' })
export class Admin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly store = inject(DocumentsService);
  protected readonly analyticsService = inject(AnalyticsService);
  protected readonly institutionalInformation = inject(InstitutionalInformationService);
  protected readonly active = signal<AdminView>('summary');
  protected readonly documents = this.store.documents;
  protected readonly analytics = this.analyticsService.data;
  protected readonly users = signal<AdminUser[]>([{ id: 1, name: this.auth.session()?.name ?? 'Administración', email: this.auth.session()?.email ?? 'admin@abrazorosa.org', status: 'Activo' }]);
  protected readonly pageRows = computed(() => Object.entries(this.analytics().pages).sort((a, b) => b[1] - a[1]));
  protected title = '';
  protected description = '';
  protected category = 'Informe';
  protected documentDate = new Date().toLocaleDateString('en-CA');
  protected visibility: DocumentVisibility = 'public';
  protected file: File | null = null;
  protected readonly message = signal('');
  protected newName = '';
  protected newEmail = '';
  protected profileName = this.auth.session()?.name ?? 'Administración';
  protected profileEmail = this.auth.session()?.email ?? 'admin@abrazorosa.org';
  protected readonly profileMessage = signal('');
  protected dataProcessingPolicy = '';
  protected readonly policyMessage = signal('');

  constructor() {
    void this.loadInstitutionalInformation();
  }

  protected setView(view: AdminView): void { this.active.set(view); }
  protected pageLabel(path: string): string { return ({ '/': 'Inicio', '/quienes-somos': 'Quiénes somos', '/que-hacemos': 'Qué hacemos', '/presencia': 'Presencia', '/documentos': 'Documentos', '/transparencia': 'Transparencia' } as Record<string, string>)[path] ?? path; }
  protected pagePercent(value: number): number { return Math.max(8, Math.round(value / Math.max(1, this.analytics().pageViews) * 100)); }
  protected pick(event: Event): void { this.file = (event.target as HTMLInputElement).files?.[0] ?? null; }
  protected async upload(): Promise<void> {
    if (!this.title || !this.documentDate || !this.file || this.file.type !== 'application/pdf') { this.message.set('Agrega un título, la fecha del documento y un archivo PDF válido.'); return; }
    await this.store.add(this.title, this.description, this.category, this.documentDate, this.file, this.visibility); this.title = ''; this.description = ''; this.file = null; this.message.set(this.visibility === 'public' ? 'Documento publicado y visible para todos.' : 'Documento guardado como privado.');
  }
  protected remove(id: number): void { void this.store.remove(id); }
  protected changeVisibility(id: number, visibility: DocumentVisibility): void { void this.store.setVisibility(id, visibility); }
  protected formatDocumentDate(value: string): string { const [year, month, day] = value.split('-').map(Number); return `${day} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][month - 1]} de ${year}`; }
  protected addAdmin(): void {
    if (!this.newName || !this.newEmail.includes('@')) return;
    this.users.update(items => [...items, { id: Date.now(), name: this.newName, email: this.newEmail, status: 'Activo' }]); this.newName = ''; this.newEmail = '';
  }
  protected toggleUser(id: number): void { this.users.update(items => items.map(user => user.id === id ? { ...user, status: user.status === 'Activo' ? 'Inactivo' : 'Activo' } : user)); }
  protected async saveProfile(): Promise<void> { if (!this.profileName || !this.profileEmail.includes('@')) return; try { await this.auth.updateProfile(this.profileName, this.profileEmail); this.users.update(items => items.map((user, index) => index === 0 ? { ...user, name: this.profileName, email: this.profileEmail } : user)); this.profileMessage.set('Perfil actualizado correctamente.'); } catch (error) { this.profileMessage.set(this.auth.errorMessage(error)); } }
  protected async saveDataProcessingPolicy(): Promise<void> {
    const policy = this.dataProcessingPolicy.trim();
    if (!policy) {
      this.policyMessage.set('Escribe la política de tratamiento de datos antes de guardar.');
      return;
    }

    this.policyMessage.set('');
    try {
      await this.institutionalInformation.updateDataProcessingPolicy(policy);
      this.dataProcessingPolicy = this.institutionalInformation.dataProcessingPolicy();
      this.policyMessage.set('Política actualizada y publicada en el sitio.');
    } catch {
      this.policyMessage.set(this.institutionalInformation.error());
    }
  }
  protected logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }

  private async loadInstitutionalInformation(): Promise<void> {
    await this.institutionalInformation.load();
    this.dataProcessingPolicy = this.institutionalInformation.dataProcessingPolicy();
  }
}
