import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { CandidatureResponse, VisiteResponse } from '@core/models';

@Component({
  selector: 'app-visites',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <!-- Pipeline -->
      <div class="pipeline">
        <div class="pipeline__step pipeline__step--done">
          <div class="pipeline__circle pipeline__circle--done">✓</div>
          <div class="pipeline__label">Candidatures</div>
          <div class="pipeline__sub pipeline__sub--ok">Terminé</div>
        </div>
        <div class="pipeline__step pipeline__step--done">
          <div class="pipeline__circle pipeline__circle--current">📅</div>
          <div class="pipeline__label pipeline__label--current">Visites</div>
          <div class="pipeline__sub pipeline__sub--current">En cours</div>
        </div>
        <div class="pipeline__step">
          <div class="pipeline__circle">✍</div>
          <div class="pipeline__label pipeline__label--muted">Signature</div>
          <div class="pipeline__sub">En attente</div>
        </div>
        <div class="pipeline__step">
          <div class="pipeline__circle">📊</div>
          <div class="pipeline__label pipeline__label--muted">Suivi</div>
          <div class="pipeline__sub">En attente</div>
        </div>
      </div>

      <div class="two-col">
        <div>
          <!-- Candidats retenus -->
          <div class="card" style="margin-bottom:14px;">
            <div class="card__head">
              <div class="card__title">Candidats retenus</div>
              <div class="card__sub">Sélectionnez un candidat pour planifier sa visite</div>
            </div>
            <div class="card__body">
              @for (c of candidaturesRetenues(); track c.id) {
                <div class="cand-row"
                     [class.selected]="selectedCand()?.id === c.id"
                     (click)="selectedCand.set(c)">
                  <div class="av av-blue">{{ c.locatairePrenom[0] }}{{ c.locataireNom[0] }}</div>
                  <div class="cr-info">
                    <div class="cr-name">{{ c.locatairePrenom }} {{ c.locataireNom }}</div>
                    <div class="cr-detail text-muted">Score {{ c.score }} · {{ c.statut }}</div>
                  </div>
                  <span class="pill" [ngClass]="visiteStatutForCand(c.id)">
                    {{ visiteLabel(c.id) }}
                  </span>
                </div>
              }
              @if (candidaturesRetenues().length === 0) {
                <div class="empty-state">Aucun candidat retenu.</div>
              }
            </div>
          </div>

          <!-- Visites planifiées -->
          <div class="card">
            <div class="card__head"><div class="card__title">Visites planifiées</div></div>
            <div class="card__body">
              @for (v of visites(); track v.id) {
                <div class="visit-card">
                  <div class="visit-card__date">
                    {{ v.dateVisite | date:'EEEE d MMMM y · HH\'h\'mm':'':'fr' }}
                  </div>
                  <div class="visit-card__meta text-muted">
                    {{ v.locatairePrenom }} {{ v.locataireNom }} · {{ v.bienAdresse }}
                  </div>
                  <span class="pill" [ngClass]="visiteStatutPill(v.statut)">
                    {{ visiteStatutTxt(v.statut) }}
                  </span>
                </div>
              }
              @if (visites().length === 0) {
                <div class="empty-state" style="padding:16px;">Aucune visite planifiée.</div>
              }
            </div>
          </div>
        </div>

        <!-- Calendrier -->
        <div class="card">
          <div class="card__head">
            <div class="card__title">
              {{ selectedCand() ? (selectedCand()!.locatairePrenom + ' ' + selectedCand()!.locataireNom) : 'Sélectionnez un candidat' }}
            </div>
            <div class="card__sub">Choisissez une date et un créneau</div>
          </div>
          <div class="card__body">
            <form [formGroup]="form" (ngSubmit)="proposer()">
              <div class="field">
                <label class="field-label">Date de visite</label>
                <input type="datetime-local" formControlName="dateVisite"
                       class="field-input" [min]="minDate()"/>
              </div>
              <div class="recap-box">
                <div class="recap-box__val">
                  @if (form.get('dateVisite')?.value) {
                    {{ form.get('dateVisite')!.value | date:"EEEE d MMMM y 'à' HH'h'mm" : '' : 'fr' }}
                  } @else {
                    Aucune date sélectionnée
                  }
                </div>
                @if (selectedCand()) {
                  <div class="recap-box__hint">
                    {{ selectedCand()!.locatairePrenom }} {{ selectedCand()!.locataireNom }}
                    sera notifié(e) par email
                  </div>
                }
              </div>
              <button class="btn btn--primary btn--full" type="submit"
                      [disabled]="form.invalid || !selectedCand() || loading()">
                Envoyer la convocation
              </button>
              <button class="btn btn--ghost btn--full" type="button" style="margin-top:6px"
                      (click)="form.reset(); selectedCand.set(null)">
                Annuler
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; overflow-y: auto; height: calc(100vh - 52px); }
    .two-col { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 16px; }
    .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; margin-bottom: 14px; }
    .card:last-child { margin-bottom: 0; }
    .card__head { padding: 13px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.07); }
    .card__title { font-size: 13px; font-weight: 500; }
    .card__sub { font-size: 11px; color: #888; margin-top: 2px; }
    .card__body { padding: 14px 16px; }
    .cand-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border: 0.5px solid rgba(0,0,0,0.08);
      border-radius: 8px; margin-bottom: 7px; cursor: pointer;
      &.selected { border-color: #c9a84c; border-width: 1.5px; background: #fffdf7; }
      &:hover:not(.selected) { border-color: #c9a84c; }
    }
    .av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; flex-shrink: 0; }
    .av-blue { background: #E6F1FB; color: #185fa5; }
    .cr-info { flex: 1; }
    .cr-name { font-size: 12px; font-weight: 500; }
    .cr-detail { font-size: 10px; }
    .visit-card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 12px; margin-bottom: 7px; }
    .visit-card__date { font-size: 13px; font-weight: 500; color: #1a2744; margin-bottom: 3px; }
    .visit-card__meta { font-size: 11px; }
    .empty-state { color: #aaa; font-size: 12px; text-align: center; padding: 20px; }
    .field { margin-bottom: 12px; }
    .field-label { display: block; font-size: 11px; color: #888; margin-bottom: 5px; }
    .field-input { width: 100%; padding: 9px 11px; border: 0.5px solid rgba(0,0,0,0.2); border-radius: 8px; font-size: 13px; outline: none; &:focus { border-color: #1a2744; } }
    .recap-box { background: #f5f4f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
    .recap-box__val { font-size: 12px; font-weight: 500; }
    .recap-box__hint { font-size: 10px; color: #888; margin-top: 2px; }
  `]
})
export class VisitesComponent implements OnInit {
  candidaturesRetenues = signal<CandidatureResponse[]>([]);
  visites = signal<VisiteResponse[]>([]);
  selectedCand = signal<CandidatureResponse | null>(null);
  loading = signal(false);

  form = this.fb.group({
    dateVisite: ['', Validators.required]
  });

  constructor(private api: ApiService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getBiens().subscribe(biens => {
      biens.forEach(b => {
        this.api.getCandidaturesParBien(b.id).subscribe(cs => {
          const retenues = cs.filter(c =>
            c.statut === 'RETENUE' || c.statut === 'VISITE_PROPOSEE'
          );
          this.candidaturesRetenues.update(prev => [...prev, ...retenues]);
        });
      });
    });
    this.api.getVisitesProprietaire().subscribe(v => this.visites.set(v));
  }

  proposer(): void {
    const cand = this.selectedCand();
    if (!cand || this.form.invalid) return;
    this.loading.set(true);

    this.api.proposerVisite({
      candidatureId: cand.id,
      dateVisite: new Date(this.form.value.dateVisite!).toISOString()
    }).subscribe({
      next: (v) => {
        this.visites.update(vs => [...vs, v]);
        this.loading.set(false);
        this.form.reset();
        this.selectedCand.set(null);
        this.snack.open('Convocation envoyée !', '', { panelClass: 'success-snack' });
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Erreur lors de la proposition', 'Fermer', { panelClass: 'error-snack' });
      }
    });
  }

  minDate(): string {
    return new Date().toISOString().slice(0, 16);
  }

  visiteStatutForCand(candId: number): string {
    const v = this.visites().find(v => v.candidatureId === candId);
    if (!v) return 'pill--gray';
    return { PROPOSEE: 'pill--warn', CONFIRMEE: 'pill--ok', ANNULEE: 'pill--red' }[v.statut] ?? 'pill--gray';
  }

  visiteLabel(candId: number): string {
    const v = this.visites().find(v => v.candidatureId === candId);
    if (!v) return 'Sans visite';
    return { PROPOSEE: 'En attente', CONFIRMEE: 'Confirmée', ANNULEE: 'Annulée' }[v.statut] ?? v.statut;
  }

  visiteStatutPill(s: string): string {
    return { PROPOSEE: 'pill--warn', CONFIRMEE: 'pill--ok', ANNULEE: 'pill--red', EFFECTUEE: 'pill--gray' }[s] ?? 'pill--gray';
  }

  visiteStatutTxt(s: string): string {
    return { PROPOSEE: 'En attente', CONFIRMEE: 'Confirmée', ANNULEE: 'Annulée', EFFECTUEE: 'Effectuée' }[s] ?? s;
  }
}
