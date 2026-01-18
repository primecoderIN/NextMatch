import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private http: HttpClient = inject(HttpClient);
  protected readonly title = signal('client');
  protected members = signal<any>([]);

  async ngOnInit() {
    this.members.set(await this.getMembers());
  }

  getMembers = async () => {
    try {
      return lastValueFrom(this.http.get('https://localhost:5001/api/members'));
    } catch (error) {
      throw error;
    }
  };
}

// lastValueFrom(): Returns a promise that resolves with the last value emitted by the observable
//Similar to .toPromise() but more explicit

// Subscribes internally

// Resolves once

// Automatically completes

// This avoids memory leaks without needing:

// unsubscribe()

// takeUntilDestroyed()

//This approach is preferred for one-time HTTP calls using signals
