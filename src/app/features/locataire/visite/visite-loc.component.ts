import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { VisiteResponse } from '@core/models';

@Component({
  selector: 'app-visite-loc',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      @if (visite()) {
        <!-- Bannière visite -->
        <div class="visite-banner">
          <div class="visite-banner__date">
            <div class="visite-banner__num">{{ visite()!.dateVisite | date:'d' }}</div>
            <div class="visite-banner__month">{{ visite()!.dateVisite | date:'MMM y':'':'fr' }}</div>
          </div>
          <div class="visite-banner__info">
            <div class="visite-banner__title">Visite — {{ visite()!.bienAdresse }}</div>
            <div class="visite-banner__meta">
              {{ visite()!.dateVisite | date:"EEEE d MMMM 'à' HH'h'mm":'':'fr' }}<br/>
              Organisée par {{ visite()!.locatairePrenom }} {{ visite()!.locataireNom }}
            </div>
          </div>
          <div class="visite-banner__actions">
            @if (visite()!.statut === 'PROPOSEE') {
              <button class="btn btn--success" (click)="confirmer()">Confirmer ma présence</button>
              <button class="btn btn--ghost" style="color:rgba(255,255,255,0.6);border-color:rgba(255,255,255,0.2)"
                      (click)="annuler()">Autre créneau</button>
            } @else if (visite()!.statut === 'CONFIRMEE') {
              <span class="pill pill--ok" style="font-size:13px;padding:8px 16px;">Présence confirmée ✓</span>
            } @else {
              <span class="pill pill--red" style="font-size:13px;padding:8px 16px;">Annulée</span>
            }
          </div>
        </div>

        <div class="two-col">
          <!-- Détails -->
          <div>
            <div class="card" style="margin-bottom:14px;">
              <div class="card__head"><div class="card__title">Rappel du bien</div></div>
              <div class="card__body">
                <div class="info-grid">
                  <div class="info-box-sm">
                    <div class="info-box-sm__lbl">Adresse</div>
                    <div class="info-box-sm__val">{{ visite()!.bienAdresse }}</div>
                  </div>
                  <div class="info-box-sm">
                    <div class="info-box-sm__lbl">Heure</div>
                    <div class="info-box-sm__val">{{ visite()!.dateVisite | date:'HH:mm' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card__head"><div class="card__title">Préparer sa visite</div></div>
              <div class="card__body">
                <div class="prep-grid">
                  @for (item of prepItems; track item.title) {
                    <div class="prep-item">
                      <div class="prep-item__icon" [style.background]="item.bg">
                        <span style="font-size:16px;">{{ item.icon }}</span>
                      </div>
                      <div class="prep-item__title">{{ item.title }}</div>
                      <div class="prep-item__desc text-muted">{{ item.desc }}</div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Statut -->
          <div class="card">
            <div class="card__head"><div class="card__title">Statut de la visite</div></div>
            <div class="card__body">
              <div class="step-list">
                <div class="step-item"><div class="step-num step-num--done">✓</div><div class="step-text">Visite proposée par le propriétaire</div></div>
                <div class="step-item" [class.step-item--current]="visite()!.statut === 'PROPOSEE'">
                  <div class="step-num" [ngClass]="visite()!.statut === 'CONFIRMEE' ? 'step-num--done' : visite()!.statut === 'PROPOSEE' ? 'step-num--current' : 'step-num--wait'">
                    {{ visite()!.statut === 'CONFIRMEE' ? '✓' : '2' }}
                  </div>
                  <div class="step-text">Votre confirmation</div>
                </div>
                <div class="step-item"><div class="step-num step-num--wait">3</div><div class="step-text">Rappel automatique 24h avant</div></div>
                <div class="step-item"><div class="step-num step-num--wait">4</div><div class="step-text">La visite a lieu</div></div>
                <div class="step-item"><div class="step-num step-num--wait">5</div><div class="step-text">Retour propriétaire sous 48h</div></div>
              </div>
            </div>
          </div>
        </div>
      } @else if (loading()) {
        <div class="empty-state">Chargement…</div>
      } @else {
        <div class="empty-state">
          <div style="font-size:36px;margin-bottom:10px;">📅</div>
          <div>Aucune visite planifiée pour le moment.</div>
          <div class="text-muted" style="font-size:11px;margin-top:6px;">
            Le propriétaire vous proposera une date après avoir retenu votre dossier.
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; overflow-y: auto; height: calc(100vh - 52px); }
    .visite-banner { background: #1a2744; border-radius: 12px; padding: 18px 22px; color: #fff; display: flex; align-items: center; gap: 18px; margin-bottom: 16px; flex-wrap: wrap; }
    .visite-banner__date { text-align: center; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; flex-shrink: 0; }
    .visite-banner__num { font-size: 28px; font-weight: 500; color: #c9a84c; line-height: 1; }
    .visite-banner__month { font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-top: 2px; }
    .visite-banner__info { flex: 1; }
    .visite-banner__title { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
    .visite-banner__meta { font-size: 11px; color: rgba(255,255,255,0.55); line-height: 1.6; }
    .visite-banner__actions { display: flex; flex-direction: column; gap: 7px; flex-shrink: 0; }
    .two-col { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 16px; }
    .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .card__head { padding: 13px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.07); }
    .card__title { font-size: 13px; font-weight: 500; }
    .card__body { padding: 14px 16px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-box-sm { background: #f5f4f0; border-radius: 8px; padding: 10px; }
    .info-box-sm__lbl { font-size: 10px; color: #aaa; margin-bottom: 3px; }
    .info-box-sm__val { font-size: 12px; font-weight: 500; }
    .prep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .prep-item { background: #f5f4f0; border-radius: 8px; padding: 11px; }
    .prep-item__icon { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 7px; }
    .prep-item__title { font-size: 12px; font-weight: 500; margin-bottom: 2px; }
    .prep-item__desc { font-size: 10px; line-height: 1.4; }
    .step-list { display: flex; flex-direction: column; gap: 8px; }
    .step-item { display: flex; align-items: center; gap: 9px; padding: 9px 11px; background: #f5f4f0; border-radius: 8px; &--current { background: #fffdf7; border: 0.5px solid #c9a84c; } }
    .step-num { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; flex-shrink: 0; &--done { background: #E1F5EE; color: #085041; } &--current { background: #1a2744; color: #fff; } &--wait { background: #fff; border: 0.5px solid rgba(0,0,0,0.12); color: #aaa; } }
    .step-text { font-size: 11px; color: #555; }
    .empty-state { text-align: center; color: #aaa; padding: 60px 20px; }
  `]
})
export class VisiteLocComponent implements OnInit {
  visite  = signal<VisiteResponse | null>(null);
  loading = signal(true);

  prepItems = [
    { icon: '📄', bg: '#E6F1FB', title: 'Pièce d\'identité', desc: 'Apportez l\'original pour confirmation' },
    { icon: '✅', bg: '#E1F5EE', title: 'Questions à poser', desc: 'Charges, voisinage, travaux, gardien' },
    { icon: '🔍', bg: '#FAEEDA', title: 'Points à vérifier', desc: 'Humidité, fenêtres, chauffage, compteurs' },
    { icon: '⏱', bg: '#EEEDFE', title: 'Durée estimée', desc: '30 à 45 minutes pour une visite complète' }
  ];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getVisitesLocataire().subscribe({
      next: (vs) => {
        this.loading.set(false);
        const active = vs.find(v => v.statut === 'PROPOSEE' || v.statut === 'CONFIRMEE');
        this.visite.set(active ?? vs[0] ?? null);
      },
      error: () => this.loading.set(false)
    });
  }

  confirmer(): void {
    if (!this.visite()) return;
    this.api.confirmerVisite(this.visite()!.id).subscribe({
      next: (v) => {
        this.visite.set(v);
        this.snack.open('Présence confirmée !', '', { panelClass: 'success-snack' });
      },
      error: () => this.snack.open('Erreur', 'Fermer', { panelClass: 'error-snack' })
    });
  }

  annuler(): void {
    if (!this.visite()) return;
    this.api.annulerVisite(this.visite()!.id).subscribe({
      next: (v) => {
        this.visite.set(v);
        this.snack.open('Visite annulée. Le propriétaire sera notifié.', '', { panelClass: 'success-snack' });
      },
      error: () => this.snack.open('Erreur', 'Fermer', { panelClass: 'error-snack' })
    });
  }
}
