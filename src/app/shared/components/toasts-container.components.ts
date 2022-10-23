import { Component, TemplateRef } from '@angular/core';

import { ToastService } from './../services/toast.service';

@Component({
  selector: 'app-toasts',
  template: `
    <div *ngFor="let toast of toastService.toasts" [class]="toast.classname">
      <ng-template [ngIf]="isTemplate(toast)" [ngIfElse]="text">
        <ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
      </ng-template>

      <ng-template #text>{{ toast.textOrTpl }}</ng-template>
    </div>
  `,
  host: { '[class.ngb-toasts]': 'true' },
})
export class ToastsContainerComponent {
  constructor(public toastService: ToastService) {}

  isTemplate(toast) {
    return toast.textOrTpl instanceof TemplateRef;
  }
}
