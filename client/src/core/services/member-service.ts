import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member, Photo } from '../../types/member';
import { Observable } from 'rxjs';
// import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  // private accountService = inject(AccountService);
  private baseUrl = environment.apiUrl;
  isEditModeEnabled = signal<boolean>(false);

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUrl + 'members');
  }

  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(this.baseUrl + `members/${id}`);
  }

  getMemberPhotos(id: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.baseUrl + `members/${id}` + '/photos');
  }

  //This now we are doing using interceptor for each request
  // private getHttpOptions() {
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${this.accountService.currentUser()?.token}`,
  //     }),
  //   };
  // }
}
