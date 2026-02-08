import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { Member, MemberParams } from '../../../types/member';
import { MemberCard } from '../member-card/member-card';
import { PaginatedResult } from '../../../types/pagination';
import { Paginator } from '../../../shared/paginator/paginator';
import { FilterModal } from '../filter-modal/filter-modal';

@Component({
  selector: 'app-member-list',
  imports: [MemberCard, Paginator, FilterModal],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal;
  private memberService = inject(MemberService);
  protected paginatedMembers = signal<PaginatedResult<Member[]> | null>(null);
  protected memberParams = new MemberParams();
  protected appliedFilters = new MemberParams();

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.memberParams).subscribe({
      next: (response) => {
        this.paginatedMembers?.set(response);
      },
    });
  }

  onPageChange(event: { pageNumber: number; pageSize: number }) {
    this.memberParams.pageNumber = event.pageNumber;
    this.memberParams.pageSize = event.pageSize;
    this.loadMembers();
  }

  openModal() {
    this.modal.open();
  }

  onFilterChange(data: MemberParams) {
    this.memberParams = data;
    this.appliedFilters=data;
    this.loadMembers();
  }

  resetFilters() {
    this.memberParams = new MemberParams();
    this.loadMembers();
  }

  get displayAppliedFilter(): string {
    const defaultParams = new MemberParams();
    const filters: string[] = [];

    if (this.appliedFilters.gender) {
      filters.push(this.appliedFilters.gender + 's');
    } else {
      filters.push('Males, Females');
    }

    if (
      this.appliedFilters.minAge !== defaultParams.minAge ||
      this.appliedFilters.maxAge !== defaultParams.maxAge
    ) {
      filters.push(`ages ${this.appliedFilters.minAge}-${this.appliedFilters.maxAge}`);
    }

    filters.push(this.appliedFilters.orderBy === 'lastActive' ? 'Recently active' : 'Newest members');

    return filters.length > 0 ? `Selected ${filters.join('  | ')}` : 'All members';
  }
}
