import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  busyRequestCount = signal<number>(0);

  busy() {
    this.busyRequestCount.update(prev => prev + 1);
 
  }
  idle() {
    this.busyRequestCount.update(prev => Math.max(0, prev - 1)); // Ensure it doesn't go below 0
  }
}
