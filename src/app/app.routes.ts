import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then((module) => module.Home),
    title: 'Sora — From the kitchen',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/home').then((module) => module.Home),
    title: 'Sora — From the kitchen',
  },
];
