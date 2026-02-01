import { HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core/primitives/di';
import { finalize } from 'rxjs/internal/operators/finalize';
import { delay } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const busyService = inject(BusyService);
  busyService.busy();
  return next(req).pipe(
    delay(500), //to avoid flickering for fast requests
    finalize(() => busyService.idle()) //runs once nomatter success or error
  );
};
