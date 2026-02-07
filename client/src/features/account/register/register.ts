import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormBuilder,
} from '@angular/forms';
import { User } from '../../../types/user';
import { AccountService } from '../../../core/services/account-service';
import { TextInput } from '../../../shared/text-input/text-input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true,
})
export class Register {
  protected router = inject(Router); //Router instance to navigate between pages
  //membersFromHome can not be protected as it is used in the template binding
  membersFromHome = input.required<User[]>(); //A signal input to receive data from parent component
  cancelRegister = output<boolean>(); //Pass data from register to parent component, this can not be protected as it is used in the template binding
  private fb = inject(FormBuilder); //FormBuilder instance to create form controls and groups
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  private accountService = inject(AccountService); //AccountService instance to handle registration logic
  protected currentStep = signal(1); //Track the current step in the multi-step form

  get isValidCredentialsForm(): boolean {
    return this.credentialsForm.valid;
  }

  get isValidProfileForm() {
    return this.profileForm.valid;
  }

  constructor() {
    this.credentialsForm = this.fb.group({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4)]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        this.matchValues('password'),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.profileForm = this.fb.group({
      gender: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
    });

    // Update confirmPassword validity whenever password changes
    this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
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

  nextStep(): void {
    if (this.currentStep() === 1 && this.credentialsForm.valid) {
      this.currentStep.update((step) => step + 1);
    }
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format for input max attribute
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => step - 1);
    }
  }

  register(): void {
    if (!this.credentialsForm.valid || !this.profileForm.valid) {
      return; //Form is not valid, do not proceed with registration
    }
    const { userName, email, password } = this.credentialsForm.value;
    const profileData = this.profileForm.value;
    const formData = { userName, email, password, ...profileData };
    this.accountService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/members']); //Navigate to members page after successful registration
      },
      error: (error) => {
        console.error('Registration failed:', error);
      },
    });
  }

  cancel(): void {
    this.cancelRegister.emit(false);
  }
}
