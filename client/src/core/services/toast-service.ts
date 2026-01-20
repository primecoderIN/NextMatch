import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  private createToastContainer() {
    let container = document.getElementById('toast-container');

    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast toast-bottom toast-end';
      document.body.appendChild(container);
    }
  }

  private createToastElement(
    message: string,
    alertClass: string,
    duration: number = 5000,
  ): HTMLElement | undefined {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.classList.add('alert', alertClass, 'shadow-lg');
    toast.innerHTML = `
  <span>${message}</span>
  <button class="btn btn-sm btn-ghost ml-4">✖</button>
  `;
    toast.querySelector('button')?.addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toast.remove();
      }
    }, duration);

    return toast;
  }

  success(message: string, duration?: number) {
    this.createToastContainer();
    this.createToastElement(message, 'alert-success', duration);
  }
  info(message: string, duration?: number) {
    this.createToastContainer();
    this.createToastElement(message, 'alert-warning', duration);
  }

  error(message: string, duration?: number) {
    this.createToastContainer();
    this.createToastElement(message, 'alert-error', duration);
  }

  warning(message: string, duration?: number) {
    this.createToastContainer();
    this.createToastElement(message, 'alert-info', duration);
  }
}
