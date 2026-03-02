import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  // Remove the automatically added route
  // {
  //   path: 'heavenly-guidance',
  //   loadComponent: () => import('./heavenly-guidance/heavenly-guidance.page').then( m => m.HeavenlyGuidancePage)
  // },
];
