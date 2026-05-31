import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusyService } from '../../core/services/busy-service';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {
  @Input({ required: false }) layout: 'grid' | 'list' | 'profile' | 'photos' | 'card' = 'list';
  @Input({ required: false }) count = 5;
  @Input({ required: false }) columns = 1;

  private busyService = inject(BusyService);

  get isLoading(): boolean {
    return this.busyService.busyRequestCount() > 0;
  }

  get items() {
    return Array.from({ length: this.count });
  }
}
