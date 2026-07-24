import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandHeart } from '../../shared/brand-heart/brand-heart';

@Component({ selector: 'app-login', imports: [FormsModule, RouterLink, BrandHeart], templateUrl: './login.html', styleUrl: './auth.scss' })
export class Login {
  private readonly auth = inject(AuthService); private readonly router = inject(Router);
  protected email = ''; protected password = ''; protected readonly error = signal(''); protected readonly loading = signal(false);
  protected async submit(): Promise<void> {
    if (!this.email || !this.password) { this.error.set('Completa el correo y la contraseña.'); return; }
    this.loading.set(true); this.error.set('');
    try { const session = await this.auth.login(this.email, this.password); await this.router.navigateByUrl(session.role === 'admin' ? '/admin' : '/'); }
    catch (error) { this.error.set(this.auth.errorMessage(error)); }
    finally { this.loading.set(false); }
  }
}
