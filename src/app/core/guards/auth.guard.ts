import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Role } from '@core/models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login']);
  return false;
};

export const roleGuard = (role: Role): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (auth.currentUser()?.role !== role) {
    // Rediriger vers le bon espace
    const route = auth.currentUser()?.role === 'PROPRIETAIRE'
      ? '/proprietaire/candidatures'
      : '/locataire/code-acces';
    router.navigate([route]);
    return false;
  }

  return true;
};
