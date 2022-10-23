import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutComponent } from './layout.component';
import { LayoutRoutingModule } from './layout-routing.module';
import { DashboardComponent, ArchiveComponent, EventsComponent, FAQsComponent, UsersComponent, PlayersComponent } from './';

import { ComponentsModule } from '@app/shared/components/components.module';
import { NgbDateFRParserFormatter } from '@app/shared/providers/ngb-date-fr-parser-formatter';
import { ArchwizardModule } from 'angular-archwizard';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgMultiSelectDropDownModule.forRoot(),

    LayoutRoutingModule,
    ComponentsModule,
    ArchwizardModule
  ],
  declarations: [
    LayoutComponent,
    DashboardComponent,
    ArchiveComponent,
    EventsComponent,
    FAQsComponent,
    UsersComponent,
    PlayersComponent,
  ],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter }],
})
export class LayoutModule { }
