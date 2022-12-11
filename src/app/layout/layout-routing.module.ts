import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as com from './';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: com.DashboardComponent },
      { path: 'users', component: com.UsersComponent },
      { path: 'experts', component: com.ExpertsComponent },
      { path: 'faqs', component: com.FAQsComponent },
      { path: 'archive', component: com.ArchiveComponent },
      { path: 'players', component: com.PlayersComponent },
      { path: 'ticker', component: com.TickerComponent },
      { path: 'schedules', component: com.SchedulesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
