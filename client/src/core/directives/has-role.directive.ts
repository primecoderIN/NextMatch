import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AccountService } from '../services/account-service';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[] = [];

  private accountService = inject(AccountService);
  private viewContainerRef = inject(ViewContainerRef);
  private templateRef = inject(TemplateRef<unknown>);

  ngOnInit(): void {
    const currentRoles = this.accountService.currentUser()?.roles ?? [];
    const hasRole = this.appHasRole.some((role) => currentRoles.includes(role));

    if (hasRole) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
