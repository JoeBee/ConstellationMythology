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
        path: 'astrology',
        loadComponent: () =>
          import('../astrology/astrology.page').then((m) => m.AstrologyPage),
      },
      {
        path: 'heavenly-guidance',
        loadComponent: () =>
          import('../heavenly-guidance/heavenly-guidance.page').then((m) => m.HeavenlyGuidancePage),
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
