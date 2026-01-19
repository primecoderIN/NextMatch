import { Component, Input, signal } from '@angular/core';
import { Register } from '../account/register/register';
import { User } from '../../types/user';

@Component({
  selector: 'app-home',
  imports: [Register],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  @Input({ required: true }) membersFromApp!: User[];
  // Input property to receive members data from App component
  // Required makes sure the parent component provides this input

  registerModeSignal = signal<boolean>(false);

  enableRegisterMode(val: boolean): void {
    this.registerModeSignal.set(val);
  }

  get isRegisterModeOn(): boolean {
    return this.registerModeSignal();
  }
}
