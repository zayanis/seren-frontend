import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { CandidatureResponse } from '@core/models';

@Component({
  selector: 'app-candidatures-loc',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <!-- Pipeline -->
      <div class="pipeline">
        <div class="pipeline__step pipeline__step--done"><div class="pipeline__circle pipeline__circle--done">✓</div><div class="pipeline__label">Dossier créé</div><div class="pipeline__sub pipeline__sub--ok">Vérifié niv.2</div></div>
        <div class="pipeline__step pipeline__step--done"><div class="pipeline__circle pipeline__circle--current">📋</div><div class="pipeline__label pipeline__label--current">Candidatures</div><div class="pipeline__sub pipeline__sub--current">{{ candidatures().length }} envoyées</div></div>
        <div class="pipeline__step"><div class="pipeline__circle">📅</div><div class="pipeline__label pipeline__label--muted">Visite</div><div class="pipeline__sub">En attente</div></div>
        <div class="pipeline__step"><div class="pipeline__circle">✍</div><div class="pipeline__label pipeline__label--muted">Signature</div><div class="pipeline__sub">En attente</div></div>
        <div class="pipeline__step"><div class="pipeline__circle">🏠</div><div class="pipeline__label pipeline__label--muted">Emménagement</div><div class="pipeline__sub">En attente</div></div>
      </div>

      <div class="two-col">
        <div>
          <!-- Postuler (si code en session) -->
          @if (pendingCode()) {
            <div class="postuler-card">
              <div class="postuler-card__title">Postuler pour le bien déverrouillé</div>
              <div class="postuler-card__code">Code : {{ pendingCode() }}</div>
              <form [formGroup]="postForm" (ngSubmit)="postuler()">
                <div class="field">
                  <label class="field-label">Message au propriétaire (optionnel)</label>
                  <textarea formControlName="message" class="field-textarea"
                            rows="4" placeholder="Présentez-vous brièvement…"></textarea>
                </div>
                <div class="field">
                  <label class="field-label">Pièces justificatives</label>
                  <input type="file" multiple accept=".pdf,.jpg,.png"
                         (change)="onFiles($event)" class="field-input"/>
                  <div class="text-muted" style="font-size:10px;margin-top:4px;">
                    PDF, JPG, PNG · Max 10 Mo par fichier · {{ files().length }} fichier(s) sélectionné(s)
                  </div>
                </div>
                <button class="btn btn--primary btn--full" type="submit"
                        [disabled]="files().length === 0 || loading()">
                  Envoyer ma candidature
                </button>
              </form>
            </div>
          }

          <!-- Liste candidatures -->
          <div class="card">
            <div class="card__head">
              <div class="card__title">Mes candidatures</div>
              <div class="card__sub">{{ candidatures().length }} dossiers transmis · vérifiés niveau 2</div>
            </div>
            <div class="card__body">
              @for (c of candidatures(); track c.id) {
                <div class="cand-item" [class.highlight]="c.statut === 'VISITE_PROPOSEE'">
                  <div class="cand-item__head">
                    <div class="cand-item__thumb">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M2 9L9 3l7 6v6H2V9z" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
                      </svg>
                    </div>
                    <div class="cand-item__info">
                      <div class="cand-item__addr">{{ c.bienTitre }}</div>
                      <div class="text-muted" style="font-size:10px;">{{ c.bienAdresse }}</div>
                    </div>
                    <span class="pill" [ngClass]="statutPill(c.statut)">{{ statutLabel(c.statut) }}</span>
                  </div>
                  <div class="cand-item__body">
                    <div class="text-muted" style="font-size:11px;">
                      Envoyée le {{ c.createdAt | date:'d MMM y':'':'fr' }}
                      @if (c.vueLe) { · Dossier consulté }
                    </div>
                    <span class="pill pill--gray">
                      {{ timeAgo(c.createdAt) }}
                    </span>
                  </div>
                </div>
              }
              @if (loading()) {
                <div class="empty-state">Chargement…</div>
              }
              @if (!loading() && candidatures().length === 0) {
                <div class="empty-state">Vous n'avez encore envoyé aucune candidature.</div>
              }
            </div>
          </div>
        </div>

        <!-- Dossier -->
        <div>
          <div class="card">
            <div class="card__head"><div class="card__title">Mon dossier</div></div>
            <div class="card__body" style="display:flex;flex-direction:column;gap:9px;">
              <div class="dossier-row">
                <span class="text-muted">Vérification</span>
                <span class="pill pill--ok">Niveau 2 ✓</span>
              </div>
              <div class="dossier-row">
                <span class="text-muted">Candidatures</span>
                <span style="font-weight:500;">{{ candidatures().length }}</span>
              </div>
              <div class="dossier-row">
                <span class="text-muted">PDF fusionné</span>
                <span style="font-weight:500;">1 fichier</span>
              </div>
              <button class="btn btn--ghost btn--full" (click)="telechargerDossier()">
                Télécharger mon dossier
              </button>
              <button class="btn btn--danger btn--full" (click)="supprimerDossier()">
                Supprimer mon dossier (RGPD)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; overflow-y: auto; height: calc(100vh - 52px); }
    .two-col { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 16px; }
    .postuler-card { background: #fff; border: 1.5px solid #c9a84c; border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; }
    .postuler-card__title { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
    .postuler-card__code { font-family: monospace; font-size: 14px; color: #1a2744; margin-bottom: 14px; letter-spacing: 0.1em; }
    .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .card__head { padding: 13px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.07); }
    .card__title { font-size: 13px; font-weight: 500; }
    .card__sub { font-size: 11px; color: #888; margin-top: 2px; }
    .card__body { padding: 14px 16px; }
    .cand-item { border: 0.5px solid rgba(0,0,0,0.09); border-radius: 10px; overflow: hidden; margin-bottom: 9px; &.highlight { border-color: #c9a84c; } }
    .cand-item__head { padding: 11px 13px; display: flex; align-items: center; gap: 10px; border-bottom: 0.5px solid rgba(0,0,0,0.06); }
    .cand-item__thumb { width: 38px; height: 38px; border-radius: 8px; background: #1a2744; display: flex; align-items: center; justify-content: center; flex-shrink: 0; opacity: 0.8; }
    .cand-item__info { flex: 1; }
    .cand-item__addr { font-size: 12px; font-weight: 500; }
    .cand-item__body { padding: 9px 13px; display: flex; align-items: center; justify-content: space-between; }
    .dossier-row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 4px 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); &:last-of-type { border-bottom: none; } }
    .empty-state { color: #aaa; font-size: 12px; text-align: center; padding: 20px; }
    .field { margin-bottom: 12px; }
    .field-label { display: block; font-size: 11px; color: #888; margin-bottom: 5px; }
    .field-textarea { width: 100%; padding: 9px 11px; border: 0.5px solid rgba(0,0,0,0.2); border-radius: 8px; font-size: 13px; font-family: inherit; outline: none; resize: vertical; }
    .field-input { width: 100%; }
  `]
})
export class CandidaturesLocComponent implements OnInit {
  candidatures = signal<CandidatureResponse[]>([]);
  loading      = signal(false);
  files        = signal<File[]>([]);
  pendingCode  = signal<string | null>(null);

  postForm = this.fb.group({ message: [''] });

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    const code = sessionStorage.getItem('pendingCode');
    if (code) this.pendingCode.set(code);

    this.loading.set(true);
    this.api.getMesCandidatures().subscribe({
      next: (cs) => { this.candidatures.set(cs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.files.set(Array.from(input.files));
  }

  postuler(): void {
    const code = this.pendingCode();
    if (!code || this.files().length === 0) return;
    this.loading.set(true);

    this.api.postuler(code, this.postForm.value.message ?? '', this.files()).subscribe({
      next: (c) => {
        this.candidatures.update(cs => [c, ...cs]);
        this.loading.set(false);
        this.pendingCode.set(null);
        sessionStorage.removeItem('pendingCode');
        this.snack.open('Candidature envoyée avec succès !', '', { panelClass: 'success-snack' });
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.message ?? 'Erreur lors de l\'envoi', 'Fermer', { panelClass: 'error-snack' });
      }
    });
  }

  telechargerDossier(): void {
    this.api.telechargerMonDossier().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'dossier_location.pdf';
      a.click(); URL.revokeObjectURL(url);
    });
  }

  supprimerDossier(): void {
    if (!confirm('Supprimer définitivement votre dossier ? Cette action est irréversible.')) return;
    this.api.supprimerMonDossier().subscribe({
      next: () => this.snack.open('Dossier supprimé', '', { panelClass: 'success-snack' }),
      error: () => this.snack.open('Erreur', 'Fermer', { panelClass: 'error-snack' })
    });
  }

  statutPill(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'pill--new', VUE: 'pill--gray',
      RETENUE: 'pill--ok', VISITE_PROPOSEE: 'pill--gold', REFUSEE: 'pill--red'
    };
    return map[s] ?? 'pill--gray';
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'En attente', VUE: 'Vu',
      RETENUE: 'Retenu', VISITE_PROPOSEE: 'Visite proposée', REFUSEE: 'Refusée'
    };
    return map[s] ?? s;
  }

  timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    return `Il y a ${days} jours`;
  }
}
