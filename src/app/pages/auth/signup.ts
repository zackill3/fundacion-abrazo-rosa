import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandHeart } from '../../shared/brand-heart/brand-heart';

@Component({ selector: 'app-signup', imports: [FormsModule, RouterLink, BrandHeart], templateUrl: './signup.html', styleUrl: './auth.scss' })
export class Signup {
  private readonly auth = inject(AuthService); private readonly router = inject(Router);
  protected name = ''; protected email = ''; protected password = ''; protected passwordConfirmation = ''; protected signupCode = '';
  protected readonly error = signal(''); protected readonly loading = signal(false);
  protected async submit(): Promise<void> {
    if (!this.name || !this.email || this.password.length < 8) { this.error.set('Completa los campos; la contraseña debe tener mínimo 8 caracteres.'); return; }
    if (this.password !== this.passwordConfirmation) { this.error.set('Las contraseñas no coinciden.'); return; }
    if (!this.signupCode) { this.error.set('Ingresa el código privado de registro administrativo.'); return; }
    this.loading.set(true); this.error.set('');
    try { await this.auth.register(this.name, this.email, this.password, this.signupCode); await this.router.navigateByUrl('/admin'); }
    catch (error) { this.error.set(this.auth.errorMessage(error)); }
    finally { this.loading.set(false); }
  }
}
