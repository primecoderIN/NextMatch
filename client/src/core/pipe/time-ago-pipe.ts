import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date | string | number): string {
    if (!value) return '';

    const date = this.parseUtcDate(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 30) return 'Just now';

    const intervals: Record<string, number> = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const unit in intervals) {
      const count = Math.floor(seconds / intervals[unit]);
      if (count >= 1) {
        return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  private parseUtcDate(value: Date | string | number): Date {
    if (value instanceof Date) return value;

    if (typeof value === 'string') {
      // Force UTC if backend forgot to add Z
      return value?.toLowerCase().endsWith('z')
        ? new Date(value)
        : new Date(value + 'Z');
    }

    return new Date(value);
  }
}
