import { Component, inject, OnInit } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { ActivatedRoute } from '@angular/router';
import { Photo } from '../../../types/member';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-member-photos',
  imports: [AsyncPipe],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css',
})
export class MemberPhotos implements OnInit {
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  protected photo$?: Observable<Photo[]>;

  ngOnInit(): void {
    const memberId = this.route.parent?.snapshot.paramMap.get('id');

    if (memberId) {
      this.photo$ = this.memberService.getMemberPhotos(memberId);
    }
  }
}
