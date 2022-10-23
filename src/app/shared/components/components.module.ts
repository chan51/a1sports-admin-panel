import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import {
  HeaderComponent,
  PageHeaderComponent,
  SidebarComponent,
  ToastsContainerComponent,
} from './';

const COMPONENTS = [
  HeaderComponent,
  PageHeaderComponent,
  SidebarComponent,
  ToastsContainerComponent,
];

@NgModule({
  imports: [CommonModule, RouterModule, NgxDatatableModule],
  declarations: [COMPONENTS],
  exports: [COMPONENTS, NgxDatatableModule],
})
export class ComponentsModule {}
