import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusyService } from '../../core/services/busy-service';

@Component({
  selector: 'app-bar-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-loader.html',
  styleUrl: './bar-loader.css',
})
export class BarLoader {
  busyService = inject(BusyService);
}
