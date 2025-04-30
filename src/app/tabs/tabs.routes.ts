import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'constellation',
        loadComponent: () =>
          import('../constellation/constellation.page').then((m) => m.ConstellationPage),
      },
      {
        path: 'myth',
        loadComponent: () =>
          import('../myth/myth.page').then((m) => m.MythPage),
      },
      {
        path: '',
        redirectTo: '/tabs/constellation',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/constellation',
    pathMatch: 'full',
  },
];
