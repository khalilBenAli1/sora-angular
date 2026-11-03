import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'reserve',
    loadComponent: () => import('./pages/reserve').then((module) => module.Reserve),
    title: 'Sora — A place at our table',
  },
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
