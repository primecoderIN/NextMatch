import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Member } from '../../types/member';
import { PaginatedResult } from '../../types/pagination';
import { map } from 'rxjs';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LikesService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private likeIdsSubscription?: Subscription;

  likeIds = signal<string[]>([]);

  toggleLike(targetMemberId: string) {
    return this.http.post(`${this.baseUrl}likes/${targetMemberId}`, {});
  }

  getLikes(predicate: string) {
    return this.http
      .get<PaginatedResult<Member[]>>(this.baseUrl + `likes?predicate=` + predicate)
      .pipe(map((response) => response.items));
  }

  getLikeIds() {
    this.likeIdsSubscription?.unsubscribe();
    this.likeIdsSubscription = this.http.get<string[]>(this.baseUrl + `likes/list`).subscribe({
      next: (ids) => this.likeIds.set(ids),
    });
  }

  //Use when user logs out
  clearLikeIds() {
    this.likeIdsSubscription?.unsubscribe();
    this.likeIdsSubscription = undefined;
    this.likeIds.set([]);
  }
}
