import { HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core/primitives/di';
import { finalize } from 'rxjs/internal/operators/finalize';
import { delay, of, tap } from 'rxjs';

const cache = new Map<string, any>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService);

  const generateCacheKey = (url: string, params: HttpParams): string => {
    if (!params || params.keys().length === 0) return url;

    const sortedKeys = params.keys().sort();

    const paramsString = sortedKeys
      .map((key) => {
        const values = params.getAll(key) ?? [];
        return values.map((value) => `${key}=${value}`).join('&');
      })
      .join('&');

    return `${url}?${paramsString}`;
  };

  const cacheKey = generateCacheKey(req.url, req.params);

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();
  return next(req).pipe(
    delay(500), //to avoid flickering for fast requests
    tap((response) => {
      cache.set(cacheKey, response); //store the response in cache
    }),
    finalize(() => busyService.idle()), //runs once nomatter success or error
  );
};
