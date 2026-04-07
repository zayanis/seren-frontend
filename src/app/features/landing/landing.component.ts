import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing">
      <div class="landing__logo">
        <div class="landing__dot"></div>
        <span class="landing__name">Seren</span>
      </div>
      <p class="landing__tagline">La plateforme de location sur invitation</p>

      <div class="landing__cards">
        <div class="landing__card" (click)="go('proprietaire')">
          <div class="landing__icon landing__icon--gold">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M4 14L14 5l10 9v10H4V14z" stroke="#c9a84c" stroke-width="1.5"/>
              <rect x="10" y="19" width="8" height="6" rx="0.5" stroke="#c9a84c" stroke-width="1.2"/>
            </svg>
          </div>
          <h2>Je suis propriétaire</h2>
          <p>Gérez vos biens, recevez des candidatures vérifiées et signez le bail en ligne</p>
          <button class="landing__btn landing__btn--gold">Accéder →</button>
        </div>

        <div class="landing__card" (click)="go('locataire')">
          <div class="landing__icon landing__icon--blue">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="10" r="5" stroke="#378ADD" stroke-width="1.5"/>
              <path d="M5 25c0-5 4-9 9-9s9 4 9 9" stroke="#378ADD" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h2>Je suis locataire</h2>
          <p>Accédez aux biens sur invitation, constituez votre dossier et signez le bail en ligne</p>
          <button class="landing__btn landing__btn--blue">Accéder →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing {
      min-height: 100vh;
      background: #1a2744;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .landing__logo {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    }
    .landing__dot {
      width: 12px; height: 12px; border-radius: 50%; background: #c9a84c;
    }
    .landing__name { font-size: 28px; color: #fff; }
    .landing__tagline {
      font-size: 13px; color: rgba(255,255,255,0.4);
      letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 48px;
    }
    .landing__cards { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
    .landing__card {
      width: 220px; padding: 28px 22px;
      background: rgba(255,255,255,0.06);
      border: 0.5px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .landing__card:hover {
      background: rgba(255,255,255,0.11);
      border-color: #c9a84c;
      transform: translateY(-2px);
    }
    .landing__card h2 { font-size: 15px; color: #fff; margin: 0 0 8px; font-weight: 500; }
    .landing__card p { font-size: 11px; color: rgba(255,255,255,0.45); line-height: 1.6; margin: 0 0 18px; }
    .landing__icon {
      width: 52px; height: 52px; border-radius: 14px;
      margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .landing__icon--gold { background: rgba(201,168,76,0.2); }
    .landing__icon--blue { background: rgba(55,138,221,0.2); }
    .landing__btn {
      width: 100%; padding: 10px;
      border-radius: 8px; border: none;
      font-size: 12px; font-weight: 500; cursor: pointer;
    }
    .landing__btn--gold { background: #c9a84c; color: #1a2744; }
    .landing__btn--blue { background: #378ADD; color: #fff; }
  `]
})
export class LandingComponent {
  constructor(private router: Router, private auth: AuthService) {
    // Si déjà connecté, rediriger
    if (auth.isLoggedIn()) {
      this.go(auth.currentUser()!.role === 'PROPRIETAIRE' ? 'proprietaire' : 'locataire');
    }
  }

  go(role: string): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([`/${role}`]);
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { role } });
    }
  }
}
