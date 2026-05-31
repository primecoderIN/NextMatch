import { ApplicationConfig, provideBrowserGlobalErrorListeners,provideZonelessChangeDetection } from '@angular/core';

import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from '../core/interceptors/error-interceptor';
import { jwtInterceptor } from '../core/interceptors/jwt-interceptor';
import { loadingInterceptor } from '../core/interceptors/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),//Enables zoneless change detection for improved performance
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()), //Enables router with view transitions and route input binding
    provideHttpClient(withInterceptors([errorInterceptor, jwtInterceptor, loadingInterceptor])), //Enables HttpClient throughout the app and activats interceptor
  ],
};
