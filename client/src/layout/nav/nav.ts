import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  protected accountService= inject(AccountService)
  protected credentials : any = {}
  

  login ():void {
     this.accountService.login(this.credentials).subscribe({
      error: error => {
        console.error('There was an error during the login request:');
        // You can add more error handling logic here
      }
     })
  }

  logout ():void {
    this.accountService.logout();
  }
}
