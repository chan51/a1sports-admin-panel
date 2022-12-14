import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { HeaderComponent, PageHeaderComponent, SidebarComponent, ToastsContainerComponent } from './';
import { TwoDigitDecimaNumberDirective } from '../directives/TwoDigitDecimaNumberDirective';

const COMPONENTS = [
  HeaderComponent,
  PageHeaderComponent,
  SidebarComponent,
  ToastsContainerComponent,
  TwoDigitDecimaNumberDirective,
];

@NgModule({
  imports: [CommonModule, RouterModule, NgxDatatableModule],
  declarations: [COMPONENTS],
  exports: [COMPONENTS, NgxDatatableModule],
})
export class ComponentsModule {}
