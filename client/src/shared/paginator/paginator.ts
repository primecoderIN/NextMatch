import { Component, computed, input, model, output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator {
  pageNumber = model(1); //input properties are not writable so using model
  pageSize = model(10); //Models works as input properties but they are writable and can be used to bind with the template
  totalCount = input<number>(0);
  pageSizeOptions = input([5,10,20,50]);

  lastItemIndex = computed(()=> {
    return Math.min(this.pageNumber() * this.pageSize(), this.totalCount());
  })

  pageChange = output<{ pageNumber: number; pageSize: number }>();

  onPageChange(newPageNumber?: number, newPageSize?: EventTarget | null) {
    if(newPageNumber) {
      this.pageNumber.set(newPageNumber);
    }
    if(newPageSize) {
      const size = Number((newPageSize as HTMLSelectElement).value)
      this.pageSize.set(size);
    }
    this.pageChange.emit({ pageNumber: this.pageNumber(), pageSize: this.pageSize() });
  }
}
