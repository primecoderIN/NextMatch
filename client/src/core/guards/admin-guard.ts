import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account-service';
import { ToastService } from '../services/toast-service';

export const adminGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  if (accountService.hasRole('Admin')) {
    return true;
  }

  toastService.error('Only admins can access this page.');
  router.navigateByUrl(accountService.isLoggedIn ? '/members' : '/');
  return false;
};
