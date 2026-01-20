import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';
import { LoginCredentials } from '../../types/user';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../core/services/toast-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected accountService = inject(AccountService);
  protected credentials: LoginCredentials = { email: '', password: '' };
  protected routerService = inject(Router);
  protected toastService = inject(ToastService);

  login(): void {
    this.accountService.login(this.credentials).subscribe({
      next: () => {
        this.routerService.navigateByUrl('/members');
        this.toastService.success('Login successful!');
      },
      error: () => {
        this.toastService.error('Login failed. Please check your credentials and try again.');
        // this.toastService.error(error.error);
        // You can add more error handling logic here
      },
    });
  }

  logout(): void {
    this.accountService.logout();
    this.routerService.navigateByUrl('/');
  }
}
