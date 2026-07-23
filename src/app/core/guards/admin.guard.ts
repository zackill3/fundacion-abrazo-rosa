import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService); const router = inject(Router);
  if (!auth.isAdmin()) return router.createUrlTree(['/login']);
  return await auth.validateSession() || router.createUrlTree(['/login']);
};
