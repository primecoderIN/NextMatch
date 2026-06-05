import { HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { inject } from '@angular/core/primitives/di';
import { finalize } from 'rxjs/internal/operators/finalize';
import { delay, of, tap } from 'rxjs';

const cache = new Map<string, any>();
let cacheVersion = 0;

export const clearHttpCache = () => {
  cache.clear();
  cacheVersion++;
};

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

  const invalidateCache = (urlPattern: string) => {
    for (const key of cache.keys()) {
      if (key.includes(urlPattern)) {
        cache.delete(key);
        console.log(`Cache invalidated for pattern: ${urlPattern}`);
      }
    }
  };

  if(req.method.includes("POST") && req.url.includes("likes")) {
    invalidateCache("likes");
  }

  if (req.method !== 'GET' && req.url.includes('messages')) {
    invalidateCache('messages');
  }

  const cacheKey = generateCacheKey(req.url, req.params);

  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
      return of(cachedResponse);
    }
  }

  busyService.busy();
  const requestCacheVersion = cacheVersion;

  return next(req).pipe(
    delay(500), //to avoid flickering for fast requests
    tap((response) => {
      if (req.method === 'GET' && requestCacheVersion === cacheVersion) {
        cache.set(cacheKey, response); //store the response in cache
      }
    }),
    finalize(() => busyService.idle()), //runs once nomatter success or error
  );
};
