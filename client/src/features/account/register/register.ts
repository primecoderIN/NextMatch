import { Component, input, OnInit, output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RegisterCredentials, User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';
import { TextInput } from '../../../shared/text-input/text-input';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput],
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
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        this.matchValues('password'),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    // Update confirmPassword validity whenever password changes
    this.registerForm.controls['password'].valueChanges.subscribe(() => {
      this.registerForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent as FormGroup;
      if (!parent) return null;
      const controlToMatch = parent.get(matchTo);
      if (!controlToMatch) return null;
      return control.value === controlToMatch.value ? null : { passwordMismatch: true };
    };
  }

  register(): void {
    const { userName, email, password } = this.registerForm.value;
    const formData: RegisterCredentials = { userName, email, password };
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
