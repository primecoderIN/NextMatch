import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member } from '../../../types/member';
import { MemberCard } from '../member-card/member-card';
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from '../../../shared/paginator/paginator';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList implements OnInit {
  private memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member[]> | null>(null);
  pageNumber = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(pageNumber?: number, pageSize?: number) {
    this.memberService.getMembers(pageNumber, pageSize).subscribe({
      next: (response) => {
        this.paginatedMembers?.set(response);
      },
    });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.pageNumber = event.pageNumber;
    this.pageSize = event.pageSize;

    this.loadMembers(event.pageNumber, event.pageSize);
  }
}
