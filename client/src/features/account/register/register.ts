import { Component, input, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterCredentials, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true,
})
export class Register implements OnInit {
  //membersFromHome can not be protected as it is used in the template binding
  membersFromHome = input.required<User[]>(); //A signal input to receive data from parent component
  cancelRegister = output<boolean>(); //Pass data from register to parent component, this can not be protected as it is used in the template binding

  protected registerForm: FormGroup = new FormGroup({});

  get isValidForm(): boolean {
    return this.registerForm.valid;
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  register(): void {
    const formData = this.registerForm.value;
    this.accountService.register(formData).subscribe({
      next: (user) => {
        this.cancel();
        console.log('Registration successful:', user);
        //Navigate to another page or update UI accordingly
      },
      error: (error) => {
        console.error('Registration failed:', error);
        //Handle error appropriately, e.g., show error message to user
      },
    });
  }

  cancel(): void {
    this.cancelRegister.emit(false);
  }

  constructor(private accountService: AccountService) {}
}
