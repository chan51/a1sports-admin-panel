import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ArchwizardModule } from 'angular-archwizard';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import * as com from './';
import { LayoutComponent } from './layout.component';
import { LayoutRoutingModule } from './layout-routing.module';

import { ComponentsModule } from '@app/shared/components/components.module';
import { NgbDateFRParserFormatter } from '@app/shared/providers/ngb-date-fr-parser-formatter';

const COMPONENTS = [
  com.DashboardComponent,
  com.ArchiveComponent,
  com.ExpertsComponent,
  com.FAQsComponent,
  com.UsersComponent,
  com.PlayersComponent,
  com.TickerComponent,
  com.SchedulesComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgMultiSelectDropDownModule.forRoot(),

    LayoutRoutingModule,
    ComponentsModule,
    ArchwizardModule,
  ],
  declarations: [LayoutComponent, COMPONENTS],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
})
export class LayoutModule {}
