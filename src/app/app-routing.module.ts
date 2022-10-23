import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './shared';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./layout/layout.module').then((l) => l.LayoutModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((l) => l.LoginModule),
  },
  {
    path: '**',
    loadChildren: () => import('./not-found/not-found.module').then((nf) => nf.NotFoundModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
