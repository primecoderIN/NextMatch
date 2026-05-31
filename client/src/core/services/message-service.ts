import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = environment.apiUrl + 'messages/';
  private http = inject(HttpClient);

  getMessages(container: string, pageNumber: number, pageSize: number) {
      let params = new HttpParams();
      params.append('pageNumber', pageNumber.toString());
      params.append('pageSize', pageSize.toString());
      params.append('container', container);
    return this.http.get<PaginatedResult<Message>>(this.baseUrl, { params });
  }
}
