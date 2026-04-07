import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-locataire-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <header class="topbar">
        <a class="topbar__logo" routerLink="/">
          <div class="topbar__logo-dot"></div>
          Seren
          <span class="topbar__logo-role">Locataire</span>
        </a>

        <nav class="topbar__nav">
          <a routerLink="code-acces"    routerLinkActive="active">Accès par code</a>
          <a routerLink="candidatures"  routerLinkActive="active">Mes candidatures</a>
          <a routerLink="visite"        routerLinkActive="active">Ma visite</a>
          <a routerLink="signature"     routerLinkActive="active">Signer le bail</a>
          <a routerLink="bail"          routerLinkActive="active">Mon bail</a>
        </nav>

        <div class="topbar__right">
          <div class="topbar__avatar" style="background:#E6F1FB;color:#185fa5;">
            {{ initials() }}
          </div>
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
export class LocataireShellComponent {
  initials = computed(() => this.auth.currentUser()?.initials ?? 'LC');
  constructor(private auth: AuthService) {}
  logout(): void { this.auth.logout(); }
}
