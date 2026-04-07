import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { BienResponse, CandidatureResponse } from '@core/models';

@Component({
  selector: 'app-candidatures',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="cand-layout">

      <!-- SIDEBAR GAUCHE -->
      <aside class="sidebar">
        <div class="sidebar__section">Mes annonces</div>

        @for (bien of biens(); track bien.id) {
          <div class="bien-item"
               [class.active]="selectedBienId() === bien.id"
               (click)="selectBien(bien)">
            <div class="bien-item__name">{{ bien.titre }}</div>
            <div class="bien-item__addr">{{ bien.adresse }}</div>
            <div class="bien-item__badges">
              @if (bien.nbCandidatures > 0) {
                <span class="pill pill--new">{{ bien.nbCandidatures }} candidatures</span>
              }
              @if (bien.nbAnomalies > 0) {
                <span class="pill pill--warn">{{ bien.nbAnomalies }} anomalie(s)</span>
              }
              @if (bien.statut === 'LOUE') {
                <span class="pill pill--ok">Loué</span>
              }
            </div>

            @if (selectedBienId() === bien.id && bien.codeAcces) {
              <div class="code-block">
                <div class="code-block__val">{{ bien.codeAcces }}</div>
                <div class="code-block__exp">
                  Expire dans {{ daysLeft(bien.codeExpiresAt) }} jours ·
                  <span class="code-block__regen" (click)="regenererCode(bien.id, $event)">
                    Regénérer
                  </span>
                </div>
              </div>
            }
          </div>
        }

        @if (biens().length === 0 && !loadingBiens()) {
          <div class="sidebar__empty">Aucun bien enregistré</div>
        }
      </aside>

      <!-- COLONNE CENTRALE -->
      <main class="main-col">
        @if (selectedBien()) {
          <div class="main-header">
            <div class="main-title">{{ selectedBien()!.titre }}</div>
            <div class="text-muted" style="font-size:11px;margin-top:2px;">
              {{ selectedBien()!.loyer | number }} €/mois ·
              {{ candidatures().length }} candidatures
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-box__num">{{ candidatures().length }}</div>
              <div class="stat-box__lbl">Candidatures</div>
            </div>
            <div class="stat-box">
              <div class="stat-box__num">{{ verified() }}</div>
              <div class="stat-box__lbl">Vérifiées</div>
            </div>
            <div class="stat-box" [style.background]="anomalies() > 0 ? '#FCEBEB' : ''">
              <div class="stat-box__num" [style.color]="anomalies() > 0 ? '#A32D2D' : ''">
                {{ anomalies() }}
              </div>
              <div class="stat-box__lbl" [style.color]="anomalies() > 0 ? '#A32D2D' : ''">
                Anomalie(s)
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-box__num">{{ avgScore() }}</div>
              <div class="stat-box__lbl">Score moy.</div>
            </div>
          </div>

          <!-- Filtres -->
          <div class="filters">
            <button class="filter-btn" [class.on]="activeFilter() === 'all'"
                    (click)="activeFilter.set('all')">
              Toutes ({{ candidatures().length }})
            </button>
            <button class="filter-btn" [class.on]="activeFilter() === 'new'"
                    (click)="activeFilter.set('new')">
              Non lues ({{ newCount() }})
            </button>
            <button class="filter-btn" [class.on]="activeFilter() === 'anomalie'"
                    (click)="activeFilter.set('anomalie')"
                    [style.border-color]="anomalies() > 0 ? '#F09595' : ''"
                    [style.color]="anomalies() > 0 ? '#A32D2D' : ''">
              Anomalies ({{ anomalies() }})
            </button>
          </div>

          <!-- Liste candidatures -->
          @for (c of filteredCandidatures(); track c.id) {
            <div class="cand-card"
                 [class.selected]="selectedCand()?.id === c.id"
                 [class.anomaly]="c.anomalieDetectee"
                 (click)="selectCand(c)">
              <div class="cand-card__top">
                <div class="avatar" [ngClass]="avatarClass(c.locataireNom)">
                  {{ initials(c) }}
                </div>
                <div class="cand-card__info">
                  <div class="cand-card__name">
                    {{ c.locatairePrenom }} {{ c.locataireNom }}
                  </div>
                  <div class="cand-card__job text-muted">Score {{ c.score }}/100</div>
                </div>
                <div class="cand-card__right">
                  <div class="cand-card__score">{{ c.score }}</div>
                  <span class="pill" [ngClass]="statutPill(c.statut)">
                    {{ statutLabel(c.statut) }}
                  </span>
                </div>
              </div>

              <!-- Barres -->
              <div class="cand-card__bars">
                <div class="bar-row">
                  <div class="bar-row__label">Score</div>
                  <div class="bar-row__track">
                    <div class="bar-row__fill bar-row__fill--gold"
                         [style.width.%]="c.score"></div>
                  </div>
                  <div class="bar-row__value">{{ c.score }}/100</div>
                </div>
              </div>

              <!-- Anomalie -->
              @if (c.anomalieDetectee) {
                <div class="anomaly-bar">
                  <div class="anomaly-bar__icon">!</div>
                  <div class="anomaly-bar__text">
                    {{ c.anomalieDetail | slice:0:80 }}...
                  </div>
                </div>
              }

              <!-- Actions -->
              <div class="cand-card__foot">
                <button class="btn btn--primary" style="flex:1"
                        (click)="retenir(c, $event)">Retenir</button>
                <button class="btn btn--ghost" (click)="openDossier(c, $event)">Dossier</button>
                <button class="btn btn--danger" (click)="refuser(c, $event)">Refuser</button>
              </div>
            </div>
          }

          @if (loadingCands()) {
            <div class="loading-state">Chargement des candidatures…</div>
          }
          @if (!loadingCands() && filteredCandidatures().length === 0 && candidatures().length > 0) {
            <div class="loading-state">Aucune candidature dans ce filtre.</div>
          }
          @if (!loadingCands() && candidatures().length === 0) {
            <div class="loading-state">Aucune candidature reçue pour ce bien.</div>
          }
        } @else {
          <div class="empty-state">
            <mat-icon>home_work</mat-icon>
            <p>Sélectionnez un bien pour voir ses candidatures</p>
          </div>
        }
      </main>

      <!-- PANEL DROIT -->
      @if (selectedCand()) {
        <aside class="panel-right">
          <div class="panel-right__head">
            <div>
              <div class="panel-right__title">
                {{ selectedCand()!.locatairePrenom }} {{ selectedCand()!.locataireNom }}
              </div>
              <div class="text-muted" style="font-size:10px;margin-top:2px;">
                Dossier vérifié · niveau 2
              </div>
            </div>
            <button class="panel-right__close" (click)="selectedCand.set(null)">✕</button>
          </div>

          <!-- Vignette dossier -->
          <div class="dossier-cover">
            <div class="dossier-cover__logo">
              <div class="dossier-cover__dot"></div>
              <span>Seren</span>
            </div>
            <div class="dossier-cover__label">Dossier de location</div>
            <div class="dossier-cover__name">
              {{ selectedCand()!.locatairePrenom }} {{ selectedCand()!.locataireNom }}
            </div>
            <div class="dossier-cover__score-row">
              <div class="dossier-cover__score">{{ selectedCand()!.score }}</div>
              <div class="dossier-cover__score-lbl">Score<br>vérifié</div>
            </div>
            <div class="dossier-cover__line"></div>
            <div class="dossier-cover__badge"
                 [class.anomaly]="selectedCand()!.anomalieDetectee">
              <div class="dossier-cover__badge-dot"></div>
              <span>{{ selectedCand()!.anomalieDetectee
                ? 'Anomalie détectée'
                : 'Revenus vérifiés · Niveau 2' }}</span>
            </div>
          </div>

          <button class="btn btn--primary btn--full" style="margin:0 14px 12px;width:calc(100% - 28px)"
                  (click)="telecharger()">
            Télécharger le dossier PDF
          </button>

          <!-- Anomalie detail -->
          @if (selectedCand()!.anomalieDetectee) {
            <div class="pr-section">
              <div class="pr-section__title" style="color:#A32D2D">Anomalie détectée</div>
              <div class="anomaly-detail">
                <div class="anomaly-detail__row">
                  <div class="anomaly-detail__label">Détail</div>
                  <div class="anomaly-detail__value">{{ selectedCand()!.anomalieDetail }}</div>
                </div>
              </div>
            </div>
          }

          <!-- Actions panel -->
          <div class="panel-actions">
            <button class="btn btn--primary btn--full"
                    (click)="retenir(selectedCand()!)">
              Retenir cette candidature
            </button>
            <button class="btn btn--ghost btn--full"
                    (click)="goVisites()">
              Planifier une visite →
            </button>
            <button class="btn btn--danger btn--full"
                    (click)="refuser(selectedCand()!)">
              Refuser la candidature
            </button>
          </div>
        </aside>
      }
    </div>
  `,
  styles: [`
    .cand-layout {
      display: grid;
      grid-template-columns: 240px minmax(0,1fr) 300px;
      height: calc(100vh - 52px);
      overflow: hidden;
    }
    .sidebar {
      background: #fff;
      border-right: 0.5px solid rgba(0,0,0,0.08);
      padding: 16px 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .sidebar__section {
      font-size: 10px; font-weight: 500;
      letter-spacing: 0.09em; text-transform: uppercase;
      color: #aaa; padding: 8px 8px 4px;
    }
    .sidebar__empty { font-size: 12px; color: #aaa; padding: 8px; }
    .bien-item {
      padding: 10px; border-radius: 8px; cursor: pointer;
      &.active { background: #f0ece4; }
      &:hover:not(.active) { background: #f9f8f5; }
    }
    .bien-item__name { font-size: 12px; font-weight: 500; }
    .bien-item__addr { font-size: 10px; color: #888; margin-top: 1px; }
    .bien-item__badges {
      display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px;
    }
    .code-block {
      background: #f5f4f0; border-radius: 6px; padding: 8px; margin-top: 8px;
      &__val {
        font-family: monospace; font-size: 14px; font-weight: 500;
        color: #1a2744; letter-spacing: 0.14em; margin-bottom: 3px;
      }
      &__exp { font-size: 9px; color: #aaa; }
      &__regen { color: #1D9E75; cursor: pointer; }
    }
    .main-col {
      overflow-y: auto; padding: 18px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .main-header { }
    .main-title { font-size: 15px; font-weight: 500; }
    .stats-row {
      display: grid; grid-template-columns: repeat(4,1fr); gap: 8px;
    }
    .stat-box {
      background: #f5f4f0; border-radius: 8px; padding: 10px 12px;
      &__num { font-size: 20px; font-weight: 500; color: #1a2744; }
      &__lbl { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.06em; }
    }
    .filters { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-btn {
      font-size: 11px; padding: 4px 11px;
      border-radius: 20px; border: 0.5px solid rgba(0,0,0,0.12);
      background: #fff; cursor: pointer; color: #555;
      &.on { background: #1a2744; color: #fff; border-color: #1a2744; }
    }
    .cand-card {
      background: #fff; border: 0.5px solid rgba(0,0,0,0.1);
      border-radius: 10px; overflow: hidden; cursor: pointer;
      transition: border-color 0.15s;
      &:hover { border-color: #c9a84c; }
      &.selected { border: 1.5px solid #c9a84c; }
      &.anomaly { border-color: #F09595; }
      &.anomaly.selected { border: 1.5px solid #E24B4A; }
    }
    .cand-card__top {
      padding: 12px 14px; display: flex; align-items: center; gap: 10px;
      border-bottom: 0.5px solid rgba(0,0,0,0.06);
    }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 500; flex-shrink: 0;
    }
    .av-blue   { background: #E6F1FB; color: #185fa5; }
    .av-green  { background: #E1F5EE; color: #085041; }
    .av-purple { background: #EEEDFE; color: #534AB7; }
    .av-amber  { background: #FAEEDA; color: #633806; }
    .cand-card__info { flex: 1; }
    .cand-card__name { font-size: 13px; font-weight: 500; }
    .cand-card__right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .cand-card__score { font-size: 20px; font-weight: 500; color: #1a2744; }
    .cand-card__bars { padding: 10px 14px; }
    .anomaly-bar {
      background: #FCEBEB; border-top: 0.5px solid #F7C1C1;
      padding: 8px 14px; display: flex; align-items: center; gap: 8px;
      &__icon {
        width: 16px; height: 16px; border-radius: 50%; background: #E24B4A;
        color: #fff; font-size: 10px; font-weight: bold;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      &__text { font-size: 10px; color: #791F1F; flex: 1; }
    }
    .cand-card__foot {
      padding: 8px 14px; display: flex; gap: 6px;
      border-top: 0.5px solid rgba(0,0,0,0.06);
    }
    .loading-state, .empty-state {
      text-align: center; color: #aaa; padding: 40px;
      font-size: 13px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; display: block; margin: 0 auto 10px; }
    }
    .panel-right {
      background: #fff; border-left: 0.5px solid rgba(0,0,0,0.08);
      overflow-y: auto; display: flex; flex-direction: column;
    }
    .panel-right__head {
      padding: 14px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.08);
      display: flex; align-items: center; justify-content: space-between;
    }
    .panel-right__title { font-size: 13px; font-weight: 500; }
    .panel-right__close {
      width: 24px; height: 24px; border-radius: 6px; background: #f5f4f0;
      border: none; cursor: pointer; font-size: 13px; color: #888;
    }
    .dossier-cover {
      background: #1a2744; margin: 14px; border-radius: 8px; padding: 14px;
      &__logo { display: flex; align-items: center; gap: 5px; margin-bottom: 10px; font-size: 10px; color: rgba(255,255,255,0.5); }
      &__dot { width: 5px; height: 5px; border-radius: 50%; background: #c9a84c; }
      &__label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); margin-bottom: 3px; }
      &__name { font-size: 14px; font-weight: 500; color: #fff; margin-bottom: 8px; }
      &__score-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      &__score { font-size: 26px; font-weight: 500; color: #c9a84c; }
      &__score-lbl { font-size: 8px; color: rgba(255,255,255,0.35); text-align: right; }
      &__line { height: 0.5px; background: rgba(255,255,255,0.1); margin-bottom: 8px; }
      &__badge {
        background: rgba(29,158,117,0.2); border: 0.5px solid #1D9E75;
        border-radius: 4px; padding: 4px 8px;
        display: flex; align-items: center; gap: 5px;
        font-size: 8px; color: #5DCAA5; font-weight: 500;
        &.anomaly { background: rgba(226,75,74,0.2); border-color: #E24B4A; color: #F09595; }
      }
      &__badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    }
    .pr-section {
      padding: 12px 16px; border-top: 0.5px solid rgba(0,0,0,0.08);
      &__title { font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #aaa; margin-bottom: 8px; }
    }
    .anomaly-detail {
      background: #FCEBEB; border: 0.5px solid #F7C1C1; border-radius: 8px; padding: 10px;
      &__label { font-size: 9px; font-weight: 500; color: #A32D2D; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
      &__value { font-size: 11px; color: #791F1F; line-height: 1.4; }
    }
    .panel-actions {
      display: flex; flex-direction: column; gap: 6px;
      padding: 12px 16px; border-top: 0.5px solid rgba(0,0,0,0.08);
      margin-top: auto;
    }
  `]
})
export class CandidaturesComponent implements OnInit {
  biens          = signal<BienResponse[]>([]);
  candidatures   = signal<CandidatureResponse[]>([]);
  selectedBienId = signal<number | null>(null);
  selectedCand   = signal<CandidatureResponse | null>(null);
  activeFilter   = signal<'all' | 'new' | 'anomalie'>('all');
  loadingBiens   = signal(false);
  loadingCands   = signal(false);

  selectedBien = computed(() =>
    this.biens().find(b => b.id === this.selectedBienId()) ?? null
  );

  verified  = computed(() => this.candidatures().length);
  anomalies = computed(() => this.candidatures().filter(c => c.anomalieDetectee).length);
  newCount  = computed(() => this.candidatures().filter(c => c.statut === 'EN_ATTENTE').length);
  avgScore  = computed(() => {
    const cs = this.candidatures();
    if (!cs.length) return 0;
    return Math.round(cs.reduce((s, c) => s + (c.score ?? 0), 0) / cs.length);
  });

  filteredCandidatures = computed(() => {
    const all = this.candidatures();
    switch (this.activeFilter()) {
      case 'new':      return all.filter(c => c.statut === 'EN_ATTENTE');
      case 'anomalie': return all.filter(c => c.anomalieDetectee);
      default:         return all;
    }
  });

  constructor(
    private api: ApiService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadingBiens.set(true);
    this.api.getBiens().subscribe({
      next: (biens) => {
        this.biens.set(biens);
        this.loadingBiens.set(false);
        if (biens.length > 0) this.selectBien(biens[0]);
      },
      error: () => {
        this.loadingBiens.set(false);
        this.snack.open('Erreur lors du chargement des biens', 'Fermer', { panelClass: 'error-snack' });
      }
    });
  }

  selectBien(bien: BienResponse): void {
    this.selectedBienId.set(bien.id);
    this.selectedCand.set(null);
    this.loadingCands.set(true);
    this.api.getCandidaturesParBien(bien.id).subscribe({
      next: (cs) => { this.candidatures.set(cs); this.loadingCands.set(false); },
      error: () => this.loadingCands.set(false)
    });
  }

  selectCand(c: CandidatureResponse): void {
    this.selectedCand.set(c);
  }

  retenir(c: CandidatureResponse, event?: Event): void {
    event?.stopPropagation();
    this.api.retenirCandidature(c.id).subscribe({
      next: (updated) => {
        this.candidatures.update(cs => cs.map(x => x.id === updated.id ? updated : x));
        if (this.selectedCand()?.id === updated.id) this.selectedCand.set(updated);
        this.snack.open('Candidature retenue', '', { panelClass: 'success-snack' });
      },
      error: () => this.snack.open('Erreur', 'Fermer', { panelClass: 'error-snack' })
    });
  }

  refuser(c: CandidatureResponse, event?: Event): void {
    event?.stopPropagation();
    this.api.refuserCandidature(c.id).subscribe({
      next: (updated) => {
        this.candidatures.update(cs => cs.map(x => x.id === updated.id ? updated : x));
        if (this.selectedCand()?.id === updated.id) this.selectedCand.set(null);
        this.snack.open('Candidature refusée', '', { panelClass: 'error-snack' });
      },
      error: () => this.snack.open('Erreur', 'Fermer', { panelClass: 'error-snack' })
    });
  }

  telecharger(): void {
    const c = this.selectedCand();
    if (!c) return;
    this.api.telechargerDossier(c.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `dossier_${c.locataireNom}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    });
  }

  openDossier(c: CandidatureResponse, event?: Event): void {
    event?.stopPropagation();
    this.selectedCand.set(c);
  }

  goVisites(): void {
    this.router.navigate(['/proprietaire/visites']);
  }

  regenererCode(bienId: number, event: Event): void {
    event.stopPropagation();
    this.api.regenererCode(bienId).subscribe({
      next: (updated) => {
        this.biens.update(bs => bs.map(b => b.id === updated.id ? updated : b));
        this.snack.open('Code regénéré', '', { panelClass: 'success-snack' });
      }
    });
  }

  daysLeft(expiresAt: string): number {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.round(diff / 86_400_000));
  }

  initials(c: CandidatureResponse): string {
    return `${c.locatairePrenom[0]}${c.locataireNom[0]}`.toUpperCase();
  }

  avatarClass(nom: string): string {
    const classes = ['av-blue', 'av-green', 'av-purple', 'av-amber'];
    return classes[nom.charCodeAt(0) % classes.length];
  }

  statutPill(statut: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'pill--new', VUE: 'pill--gray',
      RETENUE: 'pill--ok', VISITE_PROPOSEE: 'pill--gold', REFUSEE: 'pill--red'
    };
    return map[statut] ?? 'pill--gray';
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'Nouveau', VUE: 'Vu',
      RETENUE: 'Retenu', VISITE_PROPOSEE: 'Visite', REFUSEE: 'Refusé'
    };
    return map[statut] ?? statut;
  }
}
