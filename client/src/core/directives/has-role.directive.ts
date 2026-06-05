import { Directive, ElementRef, Input, Renderer2, inject } from '@angular/core';
import { AccountService } from '../services/account-service';

@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private accountService = inject(AccountService);
  private renderer = inject(Renderer2);

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @Input() set hasRole(role: string | string[]) {
    const requiredRoles = Array.isArray(role) ? role : [role];
    const hasRole = requiredRoles.some((requiredRole) =>
      this.accountService.hasRole(requiredRole),
    );

    if (hasRole) {
      this.renderer.removeStyle(this.elementRef.nativeElement, 'display');
    } else {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
    }
  }
}
