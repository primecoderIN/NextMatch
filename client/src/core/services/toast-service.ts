import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private createToastContainer(): HTMLElement {
    let container = document.getElementById('toast-container');

    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className =
        'fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0';
      document.body.appendChild(container);
    }

    return container;
  }

  private createToastElement(
    message: string,
    alertClasses: string,
    duration: number = 5000,
  ): HTMLElement {
    const toastContainer = this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${alertClasses}`;

    const text = document.createElement('span');
    text.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className =
      'ml-3 rounded-md px-2 py-1 text-lg leading-none opacity-70 hover:bg-black/5 hover:opacity-100';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.textContent = 'x';
    closeButton.addEventListener('click', () => toast.remove());

    toast.append(text, closeButton);
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toast.remove();
      }
    }, duration);

    return toast;
  }

  success(message: string, duration?: number): void {
    this.createToastElement(message, 'border-emerald-200 bg-emerald-50 text-emerald-800', duration);
  }

  info(message: string, duration?: number): void {
    this.createToastElement(message, 'border-amber-200 bg-amber-50 text-amber-800', duration);
  }

  error(message: string, duration?: number): void {
    this.createToastElement(message, 'border-rose-200 bg-rose-50 text-rose-800', duration);
  }

  warning(message: string, duration?: number): void {
    this.createToastElement(message, 'border-sky-200 bg-sky-50 text-sky-800', duration);
  }
}
