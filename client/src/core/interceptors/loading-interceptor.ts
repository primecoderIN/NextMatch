import { HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core/primitives/di';
import { finalize } from 'rxjs/internal/operators/finalize';
import { delay, of, tap } from 'rxjs';

const cache = new Map<string, any>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  // if (req.method === 'GET') {
  //   const cachedResponse = cache.get(req.url);

  //   if (cachedResponse) {
  //     return of(cachedResponse);
  //   }
  // }

  busyService.busy();
  return next(req).pipe(
    delay(500), //to avoid flickering for fast requests
    tap(response=> {
        cache.set(req.url, response); //store the response in cache
    }),
    finalize(() => busyService.idle()), //runs once nomatter success or error
  );
};
