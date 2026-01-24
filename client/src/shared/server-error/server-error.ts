import { Component, inject} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiError } from '../../types/error';

@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  templateUrl: './server-error.html',
  styleUrl: './server-error.css',
})
export class ServerError {
  protected error: ApiError;
  private router = inject(Router);
  protected showDetails = false;
  constructor() {
    const navigation = this.router.currentNavigation();
    this.error = navigation?.extras?.state?.['error'];
  }

  toggleDetails () {
    this.showDetails=!this.showDetails;
  }
}
