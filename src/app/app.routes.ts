import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'desk',
    loadComponent: () => import('./pages/desk').then((module) => module.Desk),
    title: 'Sora — Demo reservation desk',
  },
  {
    path: 'story',
    loadComponent: () => import('./pages/story').then((module) => module.Story),
    title: 'Sora — Our philosophy',
  },
  {
    path: 'visit',
    loadComponent: () => import('./pages/visit').then((module) => module.Visit),
    title: 'Sora — Plan your evening',
  },
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
    loadComponent: () => import('./pages/not-found').then((module) => module.NotFound),
    title: 'Sora — A little off the menu',
  },
];
