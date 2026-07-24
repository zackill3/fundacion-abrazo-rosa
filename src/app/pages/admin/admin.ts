import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DocumentsService, DocumentVisibility } from '../../core/services/documents.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AdminUser, AdminUsersService } from '../../core/services/admin-users.service';
import { InstitutionalInformationService } from '../../core/services/institutional-information.service';

type AdminView = 'summary' | 'documents' | 'content' | 'users' | 'analytics' | 'profile';

@Component({ selector: 'app-admin', imports: [FormsModule, RouterLink], templateUrl: './admin.html', styleUrl: './admin.scss' })
export class Admin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly store = inject(DocumentsService);
  protected readonly analyticsService = inject(AnalyticsService);
  protected readonly adminUsers = inject(AdminUsersService);
  protected readonly institutionalInformation = inject(InstitutionalInformationService);
  protected readonly active = signal<AdminView>('summary');
  protected readonly documents = this.store.documents;
  protected readonly analytics = this.analyticsService.data;
  protected readonly users = this.adminUsers.users;
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
  protected newPassword = '';
  protected newPasswordConfirmation = '';
  protected editPassword = '';
  protected editPasswordConfirmation = '';
  protected readonly passwordUser = signal<AdminUser | null>(null);
  protected readonly usersMessage = signal('');
  protected profileName = this.auth.session()?.name ?? 'Administración';
  protected profileEmail = this.auth.session()?.email ?? 'admin@abrazorosa.org';
  protected readonly profileMessage = signal('');
  protected dataProcessingPolicy = '';
  protected readonly policyMessage = signal('');

  constructor() {
    void this.loadInstitutionalInformation();
    void this.adminUsers.load();
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
  protected async addAdmin(): Promise<void> {
    this.usersMessage.set('');
    if (!this.newName.trim() || !this.newEmail.includes('@')) {
      this.usersMessage.set('Escribe el nombre y un correo electrónico válido.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.usersMessage.set('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (this.newPassword !== this.newPasswordConfirmation) {
      this.usersMessage.set('Las contraseñas no coinciden.');
      return;
    }

    try {
      await this.adminUsers.create(
        this.newName.trim(),
        this.newEmail.trim(),
        this.newPassword,
        this.newPasswordConfirmation,
      );
      this.newName = '';
      this.newEmail = '';
      this.newPassword = '';
      this.newPasswordConfirmation = '';
      this.usersMessage.set('La cuenta administradora fue creada correctamente.');
    } catch {
      this.usersMessage.set(this.adminUsers.error());
    }
  }
  protected async toggleUser(user: AdminUser): Promise<void> {
    this.usersMessage.set('');
    try {
      await this.adminUsers.setActive(user.id, !user.is_active);
      this.usersMessage.set(
        user.is_active ? 'La cuenta fue desactivada.' : 'La cuenta fue activada.',
      );
    } catch {
      this.usersMessage.set(this.adminUsers.error());
    }
  }
  protected startPasswordChange(user: AdminUser): void {
    this.passwordUser.set(user);
    this.editPassword = '';
    this.editPasswordConfirmation = '';
    this.usersMessage.set('');
  }
  protected cancelPasswordChange(): void {
    this.passwordUser.set(null);
    this.editPassword = '';
    this.editPasswordConfirmation = '';
  }
  protected async saveAdminPassword(): Promise<void> {
    const user = this.passwordUser();
    if (!user) return;
    if (this.editPassword.length < 8) {
      this.usersMessage.set('La nueva contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (this.editPassword !== this.editPasswordConfirmation) {
      this.usersMessage.set('Las contraseñas no coinciden.');
      return;
    }

    try {
      await this.adminUsers.updatePassword(
        user.id,
        this.editPassword,
        this.editPasswordConfirmation,
      );
      const changedCurrentUser = user.id === this.auth.session()?.id;
      this.cancelPasswordChange();
      if (changedCurrentUser) {
        this.auth.logout();
        await this.router.navigateByUrl('/login');
        return;
      }
      this.usersMessage.set(
        `La contraseña de ${user.name} fue actualizada y sus sesiones anteriores se cerraron.`,
      );
    } catch {
      this.usersMessage.set(this.adminUsers.error());
    }
  }
  protected isCurrentUser(userId: number): boolean { return userId === this.auth.session()?.id; }
  protected async saveProfile(): Promise<void> { if (!this.profileName || !this.profileEmail.includes('@')) return; try { await this.auth.updateProfile(this.profileName, this.profileEmail); await this.adminUsers.load(); this.profileMessage.set('Perfil actualizado correctamente.'); } catch (error) { this.profileMessage.set(this.auth.errorMessage(error)); } }
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
