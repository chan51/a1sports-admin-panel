import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { DashboardComponent, ArchiveComponent, EventsComponent, FAQsComponent, UsersComponent, PlayersComponent } from './';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'events', component: EventsComponent },
      { path: 'faqs', component: FAQsComponent },
      { path: 'archive', component: ArchiveComponent },
      {path: 'players', component: PlayersComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
