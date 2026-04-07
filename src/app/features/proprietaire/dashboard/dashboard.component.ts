import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '@core/services/api.service';
import { BienResponse, BailResponse } from '@core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="page-title">Suivi des locations</div>
        <div class="text-muted" style="font-size:11px;">
          {{ bails().length }} bail(s) actif(s) · {{ biens().filter(b => b.statut === 'VACANT').length }} vacant(s)
        </div>
      </div>

      <!-- Métriques -->
      <div class="metrics">
        <div class="metric">
          <div class="metric__num">{{ totalLoyer() | number }} €</div>
          <div class="metric__lbl">Loyers ce mois</div>
          <div class="metric__trend text-green">↑ Tous à jour</div>
        </div>
        <div class="metric">
          <div class="metric__num">{{ bails().length }}</div>
          <div class="metric__lbl">Biens loués</div>
          <div class="metric__trend text-muted">{{ biens().filter(b => b.statut === 'VACANT').length }} vacant(s)</div>
        </div>
        <div class="metric" [style.background]="echeances().length > 0 ? '#FAEEDA' : ''">
          <div class="metric__num" [style.color]="echeances().length > 0 ? '#854F0B' : ''">
            {{ echeances().length }}
          </div>
          <div class="metric__lbl" [style.color]="echeances().length > 0 ? '#854F0B' : ''">Échéances</div>
          <div class="metric__trend" [class.text-gold]="echeances().length > 0">
            {{ echeances().length > 0 ? 'Action requise' : 'RAS' }}
          </div>
        </div>
        <div class="metric">
          <div class="metric__num">{{ candidatureCount() }}</div>
          <div class="metric__lbl">Candidatures</div>
          <div class="metric__trend text-muted">En cours</div>
        </div>
      </div>

      <div class="dash-grid">
        <!-- Locations actives -->
        <div class="card">
          <div class="card__head"><div class="card__title">Locations actives</div></div>
          <div class="card__body">
            @for (b of bails(); track b.id) {
              <div class="loc-row">
                <div class="loc-info">
                  <div class="loc-addr">{{ b.bienAdresse }}</div>
                  <div class="text-muted" style="font-size:10px;margin-top:1px;">
                    {{ b.locatairePrenom }} {{ b.locataireNom }} · depuis {{ b.dateEntree | date:'MMM y':'':'fr' }}
                  </div>
                  <span class="pill pill--ok" style="margin-top:4px;">Bail signé</span>
                </div>
                <div class="loc-right">
                  <div class="loc-price">{{ b.loyer | number }} €</div>
                  <div class="text-muted" style="font-size:10px;">Prochain loyer : 1er du mois</div>
                  <div class="text-green" style="font-size:10px;margin-top:2px;">À jour ✓</div>
                </div>
              </div>
            }
            @if (bails().length === 0) {
              <div class="empty-state">Aucune location active.</div>
            }
          </div>
        </div>

        <!-- Biens vacants -->
        <div class="card">
          <div class="card__head"><div class="card__title">Biens vacants</div></div>
          <div class="card__body">
            @for (b of biens(); track b.id) {
              @if (b.statut === 'VACANT') {
                <div class="bien-row">
                  <div class="bien-row__info">
                    <div class="bien-row__name">{{ b.titre }}</div>
                    <div class="text-muted" style="font-size:10px;">{{ b.adresse }}</div>
                  </div>
                  <div class="bien-row__right">
                    <div style="font-size:13px;font-weight:500;color:#1a2744;">{{ b.loyer | number }} €</div>
                    <span class="pill pill--new">{{ b.nbCandidatures }} cand.</span>
                  </div>
                </div>
              }
            }
            @if (biens().filter(b => b.statut === 'VACANT').length === 0) {
              <div class="empty-state" style="padding:16px;">Tous vos biens sont loués.</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; overflow-y: auto; height: calc(100vh - 52px); }
    .page-header { margin-bottom: 16px; }
    .page-title { font-size: 15px; font-weight: 500; }
    .metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
    .metric { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 12px 14px; }
    .metric__num { font-size: 22px; font-weight: 500; color: #1a2744; }
    .metric__lbl { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
    .metric__trend { font-size: 10px; margin-top: 3px; }
    .dash-grid { display: grid; grid-template-columns: minmax(0,1.4fr) minmax(0,1fr); gap: 16px; }
    .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .card__head { padding: 13px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.07); }
    .card__title { font-size: 13px; font-weight: 500; }
    .card__body { padding: 14px 16px; }
    .loc-row { display: flex; align-items: flex-start; gap: 12px; padding: 11px 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); &:last-child { border-bottom: none; padding-bottom: 0; } }
    .loc-info { flex: 1; }
    .loc-addr { font-size: 12px; font-weight: 500; }
    .loc-right { text-align: right; }
    .loc-price { font-size: 13px; font-weight: 500; color: #1a2744; }
    .bien-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); &:last-child { border-bottom: none; } }
    .bien-row__info { flex: 1; }
    .bien-row__name { font-size: 12px; font-weight: 500; }
    .bien-row__right { text-align: right; display: flex; flex-direction: column; gap: 3px; align-items: flex-end; }
    .empty-state { color: #aaa; font-size: 12px; text-align: center; padding: 20px; }
    .text-green { color: #1D9E75; }
    .text-gold  { color: #854F0B; }
  `]
})
export class DashboardComponent implements OnInit {
  biens            = signal<BienResponse[]>([]);
  bails            = signal<BailResponse[]>([]);
  candidatureCount = signal(0);

  totalLoyer = computed(() =>
    this.bails().reduce((sum, b) => sum + Number(b.loyer), 0)
  );

  echeances = computed(() =>
    this.bails().filter(b => {
      if (!b.dateEcheance) return false;
      const diff = new Date(b.dateEcheance).getTime() - Date.now();
      return diff < 90 * 86_400_000;
    })
  );

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getBiens().subscribe(biens => {
      this.biens.set(biens);
      this.candidatureCount.set(biens.reduce((s, b) => s + b.nbCandidatures, 0));
    });
    this.api.getBailsProprietaire().subscribe(bs => this.bails.set(bs));
  }
}
