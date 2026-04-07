import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { BienResponse } from '@core/models';

@Component({
  selector: 'app-code-acces',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="code-page">
      <div class="code-wrap">
        <div class="code-wrap__logo">
          <div class="code-wrap__dot"></div>
          <span>Seren</span>
        </div>

        <h1 class="code-wrap__title">Accéder à un bien</h1>
        <p class="code-wrap__sub">
          Saisissez le code reçu du propriétaire pour consulter le bien et postuler
        </p>

        <div class="code-inputs">
          @for (i of [0,1,2]; track i) {
            <input class="code-box"
                   [class.filled]="digits()[i]"
                   [class.success]="unlocked()"
                   [class.error]="error()"
                   [id]="'b' + i"
                   maxlength="1"
                   [value]="digits()[i]"
                   (input)="onInput($event, i)"
                   (keydown)="onKey($event, i)"/>
          }
          <div class="code-sep">-</div>
          @for (i of [3,4,5]; track i) {
            <input class="code-box"
                   [class.filled]="digits()[i]"
                   [class.success]="unlocked()"
                   [class.error]="error()"
                   [id]="'b' + i"
                   maxlength="1"
                   [value]="digits()[i]"
                   (input)="onInput($event, i)"
                   (keydown)="onKey($event, i)"/>
          }
        </div>

        <div class="code-hint">Format : XXX-XXX · ex : A7K-29M</div>

        <button class="btn btn--primary btn--full code-cta"
                [disabled]="!isComplete() || loading()"
                (click)="submit()">
          Accéder au bien
        </button>

        <div class="code-feedback"
             [class.ok]="unlocked()"
             [class.ko]="error()">
          {{ feedback() }}
        </div>

        <!-- Aperçu bien déverrouillé -->
        @if (bien()) {
          <div class="unlock-preview">
            <div class="unlock-preview__cover">
              <div class="unlock-preview__label">Bien déverrouillé</div>
              <div class="unlock-preview__title">{{ bien()!.titre }}</div>
              <div class="unlock-preview__price">
                {{ bien()!.adresse }} · {{ bien()!.loyer | number }} €/mois
              </div>
            </div>
            <div class="unlock-preview__tags">
              @if (bien()!.nbPieces) {
                <span class="up-tag">{{ bien()!.nbPieces }} pièces</span>
              }
              @if (bien()!.surface) {
                <span class="up-tag">{{ bien()!.surface }} m²</span>
              }
              @if (bien()!.dpe) {
                <span class="up-tag">DPE {{ bien()!.dpe }}</span>
              }
              @if (bien()!.disponibilite) {
                <span class="up-tag">Dispo {{ bien()!.disponibilite | date:'d MMM y':'':'fr' }}</span>
              }
            </div>
            <button class="unlock-preview__cta" (click)="postuler()">
              Voir la fiche et postuler →
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .code-page {
      min-height: calc(100vh - 52px);
      background: #f5f4f0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .code-wrap {
      background: #fff;
      border: 0.5px solid rgba(0,0,0,0.1);
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      text-align: center;
    }
    .code-wrap__logo {
      display: flex; align-items: center; gap: 8px; margin-bottom: 20px;
      justify-content: center; font-size: 16px; font-weight: 500; color: #1a2744;
    }
    .code-wrap__dot { width: 7px; height: 7px; border-radius: 50%; background: #c9a84c; }
    .code-wrap__title { font-size: 20px; font-weight: 500; margin: 0 0 8px; }
    .code-wrap__sub { font-size: 12px; color: #888; margin: 0 0 24px; line-height: 1.5; }
    .code-inputs {
      display: flex; gap: 7px; justify-content: center;
      align-items: center; margin-bottom: 8px;
    }
    .code-sep { font-size: 20px; color: #aaa; }
    .code-box {
      width: 42px; height: 50px;
      border: 0.5px solid rgba(0,0,0,0.2); border-radius: 8px;
      text-align: center; font-size: 20px; font-weight: 500;
      font-family: monospace; color: #1a1a1a; background: #fff; outline: none;
      &:focus { border: 1.5px solid #1a2744; }
      &.filled { background: #f5f4f0; }
      &.success { border-color: #1D9E75; background: #E1F5EE; }
      &.error { border-color: #E24B4A; background: #FCEBEB; }
    }
    .code-hint { font-size: 11px; color: #aaa; margin-bottom: 18px; }
    .code-cta { margin-bottom: 8px; }
    .code-feedback {
      font-size: 12px; min-height: 18px; margin-bottom: 8px;
      &.ok { color: #1D9E75; }
      &.ko { color: #E24B4A; }
    }
    .unlock-preview {
      border: 0.5px solid rgba(0,0,0,0.1);
      border-radius: 10px; overflow: hidden; text-align: left; margin-top: 12px;
    }
    .unlock-preview__cover { background: #1a2744; padding: 14px 16px; }
    .unlock-preview__label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); margin-bottom: 4px; }
    .unlock-preview__title { font-size: 14px; font-weight: 500; color: #fff; }
    .unlock-preview__price { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
    .unlock-preview__tags { padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 6px; }
    .up-tag { font-size: 11px; padding: 3px 9px; border-radius: 20px; border: 0.5px solid rgba(0,0,0,0.1); color: #555; }
    .unlock-preview__cta {
      width: 100%; padding: 12px; background: #1a2744; color: #fff;
      border: none; font-size: 12px; font-weight: 500; cursor: pointer;
    }
  `]
})
export class CodeAccesComponent {
  digits  = signal<string[]>(['', '', '', '', '', '']);
  loading = signal(false);
  unlocked = signal(false);
  error    = signal(false);
  feedback = signal('');
  bien     = signal<BienResponse | null>(null);

  private codeAcces = signal('');

  constructor(private api: ApiService, private router: Router) {}

  isComplete(): boolean {
    return this.digits().filter(d => d.length > 0).length === 6;
  }

  onInput(event: Event, i: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    input.value = val;

    const d = [...this.digits()];
    d[i] = val;
    this.digits.set(d);

    this.error.set(false);
    this.feedback.set('');

    if (val && i < 5) {
      const nextIdx = i === 2 ? 3 : i + 1;
      const next = document.getElementById(`b${nextIdx}`) as HTMLInputElement;
      next?.focus();
    }
  }

  onKey(event: KeyboardEvent, i: number): void {
    if (event.key === 'Backspace') {
      const d = [...this.digits()];
      if (!d[i] && i > 0) {
        const prevIdx = i === 3 ? 2 : i - 1;
        d[prevIdx] = '';
        this.digits.set(d);
        (document.getElementById(`b${prevIdx}`) as HTMLInputElement)?.focus();
      } else {
        d[i] = '';
        this.digits.set(d);
      }
    }
  }

  submit(): void {
    if (!this.isComplete()) return;
    const code = this.digits().join('').toUpperCase();
    const formatted = `${code.slice(0, 3)}-${code.slice(3)}`;
    this.codeAcces.set(formatted);
    this.loading.set(true);

    this.api.accederParCode(formatted).subscribe({
      next: (bien) => {
        this.loading.set(false);
        this.unlocked.set(true);
        this.error.set(false);
        this.feedback.set('Code valide — bien déverrouillé !');
        this.bien.set(bien);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
        this.unlocked.set(false);
        this.feedback.set('Code incorrect. Vérifiez le code reçu.');
      }
    });
  }

  postuler(): void {
    // Naviguer vers la page candidature avec le code en état de session
    sessionStorage.setItem('pendingCode', this.codeAcces());
    this.router.navigate(['/locataire/candidatures']);
  }
}
