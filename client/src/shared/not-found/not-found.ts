import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
   private router = inject(Router);

   goToHome() {
    this.router.navigateByUrl("/", {
      replaceUrl: true
    })
   }
}
