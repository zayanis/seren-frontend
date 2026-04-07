import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  // Landing
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent)
  },

  // Auth
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Propriétaire
  {
    path: 'proprietaire',
    canActivate: [authGuard, roleGuard('PROPRIETAIRE')],
    loadComponent: () =>
      import('./features/proprietaire/proprietaire-shell.component')
        .then(m => m.ProprietaireShellComponent),
    children: [
      { path: '', redirectTo: 'candidatures', pathMatch: 'full' },
      {
        path: 'candidatures',
        loadComponent: () =>
          import('./features/proprietaire/candidatures/candidatures.component')
            .then(m => m.CandidaturesComponent)
      },
      {
        path: 'visites',
        loadComponent: () =>
          import('./features/proprietaire/visites/visites.component')
            .then(m => m.VisitesComponent)
      },
      {
        path: 'signature',
        loadComponent: () =>
          import('./features/proprietaire/signature/signature.component')
            .then(m => m.SignatureComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/proprietaire/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      }
    ]
  },

  // Locataire
  {
    path: 'locataire',
    canActivate: [authGuard, roleGuard('LOCATAIRE')],
    loadComponent: () =>
      import('./features/locataire/locataire-shell.component')
        .then(m => m.LocataireShellComponent),
    children: [
      { path: '', redirectTo: 'code-acces', pathMatch: 'full' },
      {
        path: 'code-acces',
        loadComponent: () =>
          import('./features/locataire/code-acces/code-acces.component')
            .then(m => m.CodeAccesComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () =>
          import('./features/locataire/candidatures/candidatures-loc.component')
            .then(m => m.CandidaturesLocComponent)
      },
      {
        path: 'visite',
        loadComponent: () =>
          import('./features/locataire/visite/visite-loc.component')
            .then(m => m.VisiteLocComponent)
      },
      {
        path: 'signature',
        loadComponent: () =>
          import('./features/locataire/signature/signature-loc.component')
            .then(m => m.SignatureLocComponent)
      },
      {
        path: 'bail',
        loadComponent: () =>
          import('./features/locataire/bail/bail-loc.component')
            .then(m => m.BailLocComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
