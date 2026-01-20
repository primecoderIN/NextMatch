import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterCredentials, User } from '../../../types/user';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true,
})
export class Register {
  //membersFromHome can not be protected as it is used in the template binding
  membersFromHome = input.required<User[]>(); //A signal input to receive data from parent component
  protected regissterFormSignal = signal<RegisterCredentials>({
    userName: '',
    password: '',
    email: '',
  });
  cancelRegister = output<boolean>(); //Pass data from register to parent component, this can not be protected as it is used in the template binding

  get registerFormData(): RegisterCredentials {
    return this.regissterFormSignal();
  }

  register(): void {
    // Implement registration logic here, e.g., call a service to register the user
    const data = this.regissterFormSignal();
    console.log('Registering user with data:', data);
  }

  cancel(): void {
    this.cancelRegister.emit(false);
  }
}
