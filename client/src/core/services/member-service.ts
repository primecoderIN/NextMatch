import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EditableMember, Member, Photo } from '../../types/member';
import { Observable, tap } from 'rxjs';
import { PaginatedResult } from '../../types/pagination';
import { MemberParams } from '../../types/member';
// import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private http = inject(HttpClient);
  // private accountService = inject(AccountService);
  private baseUrl = environment.apiUrl;
  member = signal<Member | null>(null);
  isEditModeEnabled = signal<boolean>(false);

  getMembers(memberParams: MemberParams): Observable<PaginatedResult<Member[]>> {
    let params = new HttpParams()
      .append('pageNumber', memberParams.pageNumber)
      .append('pageSize', memberParams.pageSize)
      .append('minAge', memberParams.minAge)
      .append('maxAge', memberParams.maxAge);

    if (memberParams.gender) {
      params = params.append('gender', memberParams.gender);
    }
    return this.http.get<PaginatedResult<Member[]>>(this.baseUrl + 'members', { params });
  }

  getMemberById(id: string): Observable<Member> {
    return this.http.get<Member>(this.baseUrl + `members/${id}`).pipe(
      tap((member) => {
        this.member.set({ ...member });
      }),
    );
  }

  getMemberPhotos(id: string): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.baseUrl + `members/${id}` + '/photos');
  }

  updateMember(member: EditableMember): Observable<void> {
    return this.http.put<void>(this.baseUrl + `members`, member);
  }

  uploadPhoto(file: File): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Photo>(this.baseUrl + 'members/upload-photo', formData);
  }

  setMainPhoto(photo: Photo) {
    return this.http.put<void>(this.baseUrl + `members/set-default-photo/${photo.id}`, {});
  }

  deletePhoto(photo: Photo) {
    return this.http.delete<void>(this.baseUrl + `members/delete-photo/${photo.id}`);
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
