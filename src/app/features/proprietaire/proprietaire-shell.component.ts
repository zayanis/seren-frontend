import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-proprietaire-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatBadgeModule],
  template: `
    <div class="shell">
      <header class="topbar">
        <a class="topbar__logo" routerLink="/">
          <div class="topbar__logo-dot"></div>
          Seren
          <span class="topbar__logo-role">Propriétaire</span>
        </a>

        <nav class="topbar__nav">
          <a routerLink="candidatures" routerLinkActive="active">Candidatures</a>
          <a routerLink="visites"      routerLinkActive="active">Visites</a>
          <a routerLink="signature"    routerLinkActive="active">Signature</a>
          <a routerLink="dashboard"    routerLinkActive="active">Suivi</a>
        </nav>

        <div class="topbar__right">
          <div class="topbar__avatar">{{ initials() }}</div>
          <button class="topbar__switch" (click)="logout()">Déconnexion</button>
        </div>
      </header>

      <main class="shell__body">
        <router-outlet/>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .shell__body { flex: 1; overflow: auto; }
  `]
})
export class ProprietaireShellComponent {
  initials = computed(() => this.auth.currentUser()?.initials ?? 'PR');

  constructor(private auth: AuthService, private router: Router) {}

  logout(): void { this.auth.logout(); }
}
