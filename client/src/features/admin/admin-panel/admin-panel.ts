import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminService } from '../../../core/services/admin-service';
import { ToastService } from '../../../core/services/toast-service';
import { AdminUser } from '../../../types/admin';

@Component({
  selector: 'app-admin-panel',
  imports: [],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css'],
})
export class AdminPanel implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  protected users = signal<AdminUser[]>([]);
  protected selectedRoles = signal<Record<string, string[]>>({});
  protected loading = signal(false);
  protected savingUserIds = signal<ReadonlySet<string>>(new Set());
  protected moderationMessage = signal<string | null>(null);
  protected moderationError = signal<string | null>(null);
  protected availableRoles = ['Admin', 'Moderator', 'Member'];

  ngOnInit(): void {
    this.loadUsers();
    this.loadPhotoModerationStatus();
  }

  protected loadUsers = () => {
    this.loading.set(true);

    this.adminService
      .getUsersWithRoles(true)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => {
          const normalizedUsers = users.map((user) => ({
            ...user,
            roles: user.roles ?? [],
          }));

          this.users.set(normalizedUsers);
          this.selectedRoles.set(
            Object.fromEntries(
              normalizedUsers.map((user) => [user.id, [...user.roles]]),
            ),
          );
        },
        error: () => this.toastService.error('Failed to load users.'),
      });
  }

  protected loadPhotoModerationStatus() {
    this.adminService.getPhotosToModerate().subscribe({
      next: (message) => {
        this.moderationMessage.set(message);
        this.moderationError.set(null);
      },
      error: () => {
        this.moderationMessage.set(null);
        this.moderationError.set('Photo moderation endpoint is not available for this user.');
      },
    });
  }

  protected hasSelectedRole(userId: string, role: string) {
    return this.selectedRoles()[userId]?.includes(role) ?? false;
  }

  protected toggleRole(userId: string, role: string, checked: boolean) {
    this.selectedRoles.update((selectedRoles) => {
      const currentRoles = selectedRoles[userId] ?? [];
      const nextRoles = checked
        ? [...new Set([...currentRoles, role])]
        : currentRoles.filter((currentRole) => currentRole !== role);

      return {
        ...selectedRoles,
        [userId]: nextRoles,
      };
    });
  }

  protected rolesChanged(user: AdminUser) {
    return !this.sameRoles(user.roles, this.selectedRoles()[user.id] ?? []);
  }

  protected saveRoles(user: AdminUser) {
    const roles = this.selectedRoles()[user.id] ?? [];

    if (roles.length === 0) {
      this.toastService.error('Select at least one role.');
      return;
    }

    this.savingUserIds.update((ids) => new Set(ids).add(user.id));

    this.adminService
      .editRoles(user.id, roles)
      .pipe(
        finalize(() => {
          this.savingUserIds.update((ids) => {
            const updatedIds = new Set(ids);
            updatedIds.delete(user.id);
            return updatedIds;
          });
        }),
      )
      .subscribe({
        next: (updatedRoles) => {
          this.users.update((users) =>
            users.map((currentUser) =>
              currentUser.id === user.id
                ? { ...currentUser, roles: [...updatedRoles] }
                : currentUser,
            ),
          );

          this.selectedRoles.update((selectedRoles) => ({
            ...selectedRoles,
            [user.id]: [...updatedRoles],
          }));

          this.toastService.success('Roles updated.');
        },
        error: () => this.toastService.error('Failed to update roles.'),
      });
  }

  protected isSaving(userId: string) {
    return this.savingUserIds().has(userId);
  }

  private sameRoles(first: string[], second: string[]) {
    if (first.length !== second.length) return false;

    return first.every((role) => second.includes(role));
  }
}
