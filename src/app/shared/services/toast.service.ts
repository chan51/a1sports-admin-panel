import { Injectable } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];
  defaultOptions = { classname: 'text-light', timeOut: 3000 };

  constructor(private toastrService: ToastrService) {}

  showSuccess(textOrTpl: string, options: any = this.defaultOptions) {
    this.toastrService.success(textOrTpl, 'Success', options);
  }

  showWarning(textOrTpl: string, options: any = this.defaultOptions) {
    this.toastrService.warning(textOrTpl, 'Warning', options);
  }

  showError(textOrTpl: string, options: any = this.defaultOptions) {
    this.toastrService.error(textOrTpl, 'Error', options);
  }
}
