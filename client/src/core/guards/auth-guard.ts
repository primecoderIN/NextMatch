import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account-service';
import { inject } from '@angular/core/primitives/di';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toastService = inject(ToastService);
  const router = inject(Router);
  const user = accountService.isLoggedIn;

  console.log("Auth Guard - isLoggedIn:", user);
  if (user) {
    return true;
  } else {
    toastService.error('Please log in to access this page.');
    router.navigateByUrl('/');
    return false;
  }
};
