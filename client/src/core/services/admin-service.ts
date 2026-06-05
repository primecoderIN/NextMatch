import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AdminUser } from '../../types/admin';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + 'admin/';

  getUsersWithRoles(forceReload = false) {
    let params = new HttpParams();
    if (forceReload) {
      params = params.set('cacheBuster', Date.now().toString());
    }

    return this.http.get<AdminUser[]>(this.baseUrl + 'users-with-roles', { params });
  }

  editRoles(userId: string, roles: string[]) {
    const params = new HttpParams().set('roles', roles.join(','));

    return this.http.post<string[]>(this.baseUrl + `edit-roles/${userId}`, {}, { params });
  }

  getPhotosToModerate() {
    return this.http.get<string>(this.baseUrl + 'photos-to-moderate');
  }
}
