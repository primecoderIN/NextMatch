import { CanActivateFn } from '@angular/router';
import { AccountService } from '../services/account-service';
import { inject } from '@angular/core/primitives/di';
import { ToastService } from '../services/toast-service';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toastService = inject(ToastService);
  const user = accountService.currentUser();
  if (user) {
    return true;
  } else {
    toastService.error('You shall not pass! Please log in to access this page.');
    return false;
  }
};
