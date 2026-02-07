import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
})
export class TextInput implements ControlValueAccessor {
  label = input<string>(); //A signal input to receive data from parent component, this can not be protected as it is used in the template binding
  placeholder = input<string>(); //A signal input to receive data from parent component, this can not be protected as it is used in the template binding
  type = input<string>(); //A signal input to receive data from parent component, this can not be protected as it is used in the template binding
  
  constructor(@Self() public ngControl: NgControl){ //Self decorator is used to inject the NgControl instance that is associated with this component. This allows the TextInput component to access the form control's state and validation status.
     this.ngControl.valueAccessor = this; // Set the value accessor to this component
  }

  get control(){
    return this.ngControl.control as FormControl; // Return the form control associated with this component 
  }

    getFormControlErrorInfo(): string[] {
 

      const errors = this.control?.errors || {};
      const messages: string[] = [];

      for (const key of Object.keys(errors)) {
        const err = (errors as any)[key];
        switch (key) {
          case 'required':
            messages.push(`${this.label?.() ?? 'This field'} is required`);
            break;
          case 'minlength':
            messages.push(`Minimum ${err.requiredLength} characters required`);
            break;
          case 'maxlength':
            messages.push(`Maximum ${err.requiredLength} characters allowed`);
            break;
          case 'email':
            messages.push('Invalid email address');
            break;
          case 'passwordMismatch':
            messages.push('Passwords do not match');
            break;
          default:
            messages.push(`${key}: ${JSON.stringify(err)}`);
        }
      }

      return messages;
  }
  
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}

}

//ControlValueAccessor is an interface that allows a component 
// to act as a form control. It provides methods for writing a 
// value to the component, registering change and touch events,
//  and setting the disabled state of the component. 
// By implementing this interface, the TextInput component can be
//  used in reactive forms and template-driven forms, allowing it to
//  integrate seamlessly with Angular's form handling mechanisms.