import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { NavigationExtras, Router } from '@angular/router';

//errorInterceptor is a function and not a class,
//This gives access to http request object and next method
//next is part of http only and returns observable
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const routerService = inject(Router);
  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            const validationErrors = error.error.errors;
            const errorsArray: string[] = [];
            if (validationErrors) {
              for (const key in validationErrors) {
                if (validationErrors[key]) {
                  errorsArray.push(validationErrors[key]);
                }
              }
              throw errorsArray.flat();
            } else {
              toastService.error(error.error);
            }

            break;

          case 401:
            toastService.error('Unauthorized');

            break;

          case 404:
            routerService.navigateByUrl('/not-found', {
              replaceUrl: true,
            });
            break;

          case 500:
            //We get access to extras only in constructor of navigated component
            const navigationExtras: NavigationExtras = { state:{error:error.error} };
            routerService.navigateByUrl('/server-error', navigationExtras);
            break;

          default:
            toastService.error('Somethng went wrong!');
            break;
        }
      }
      throw error; //This to tell angular that request failed , also for component to handle error
    }),
  );
};
