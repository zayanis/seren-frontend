import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { BailResponse, CandidatureResponse } from '@core/models';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="pipeline">
        <div class="pipeline__step pipeline__step--done"><div class="pipeline__circle pipeline__circle--done">✓</div><div class="pipeline__label">Candidatures</div><div class="pipeline__sub pipeline__sub--ok">Terminé</div></div>
        <div class="pipeline__step pipeline__step--done"><div class="pipeline__circle pipeline__circle--done">✓</div><div class="pipeline__label">Visites</div><div class="pipeline__sub pipeline__sub--ok">Terminé</div></div>
        <div class="pipeline__step pipeline__step--done"><div class="pipeline__circle pipeline__circle--current">✍</div><div class="pipeline__label pipeline__label--current">Signature</div><div class="pipeline__sub pipeline__sub--current">En cours</div></div>
        <div class="pipeline__step"><div class="pipeline__circle">📊</div><div class="pipeline__label pipeline__label--muted">Suivi</div><div class="pipeline__sub">En attente</div></div>
      </div>

      <div class="two-col">
        <div>
          <h3 style="font-size:14px;font-weight:500;margin-bottom:12px;">Candidatures retenues — prêtes pour le bail</h3>
          @for (c of candidatures(); track c.id) {
            <div class="cand-card">
              <div class="cand-card__info">
                <div class="cand-card__name">{{ c.locatairePrenom }} {{ c.locataireNom }}</div>
                <div class="text-muted" style="font-size:11px;">{{ c.bienAdresse }}</div>
              </div>
              <div class="cand-card__actions">
                @if (!getBailForCand(c.id)) {
                  <button class="btn btn--primary" (click)="generer(c.id)">Générer le bail</button>
                } @else {
                  <span class="pill pill--ok">Bail généré</span>
                  @if (getBailForCand(c.id)!.statut === 'GENERE') {
                    <button class="btn btn--docusign" (click)="signerEnvoyer(getBailForCand(c.id)!.id)">
                      DocuSign · Signer &amp; envoyer
                    </button>
                  }
                  @if (getBailForCand(c.id)!.statut === 'SIGNE_PROPRIO') {
                    <span class="pill pill--warn">En attente locataire</span>
                  }
                  @if (getBailForCand(c.id)!.statut === 'SIGNE_COMPLET') {
                    <span class="pill pill--ok">Signé complet ✓</span>
                  }
                }
              </div>
            </div>
          }
          @if (candidatures().length === 0) {
            <div class="empty-state">Aucune candidature retenue en attente de bail.</div>
          }
        </div>

        <div class="card">
          <div class="card__head"><div class="card__title">Mes baux</div></div>
          <div class="card__body">
            @for (b of bails(); track b.id) {
              <div class="bail-item">
                <div class="bail-item__name">{{ b.locatairePrenom }} {{ b.locataireNom }}</div>
                <div class="text-muted" style="font-size:10px;">{{ b.bienAdresse }}</div>
                <div class="bail-item__row">
                  <span>{{ b.loyer | number }} €/mois</span>
                  <span class="pill" [ngClass]="bailPill(b.statut)">{{ bailLabel(b.statut) }}</span>
                </div>
              </div>
            }
            @if (bails().length === 0) {
              <div class="empty-state" style="padding:16px;font-size:12px;">Aucun bail pour le moment.</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; overflow-y: auto; height: calc(100vh - 52px); }
    .two-col { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 16px; }
    .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .card__head { padding: 13px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.07); }
    .card__title { font-size: 13px; font-weight: 500; }
    .card__body { padding: 14px 16px; }
    .cand-card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; }
    .cand-card__info { flex: 1; }
    .cand-card__name { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
    .cand-card__actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
    .bail-item { padding: 10px 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); &:last-child { border-bottom: none; } }
    .bail-item__name { font-size: 12px; font-weight: 500; }
    .bail-item__row { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; }
    .empty-state { color: #aaa; font-size: 12px; text-align: center; padding: 20px; }
  `]
})
export class SignatureComponent implements OnInit {
  candidatures = signal<CandidatureResponse[]>([]);
  bails        = signal<BailResponse[]>([]);

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getBiens().subscribe(biens => {
      biens.forEach(b => {
        this.api.getCandidaturesParBien(b.id).subscribe(cs => {
          const retenues = cs.filter(c => c.statut === 'RETENUE' || c.statut === 'VISITE_PROPOSEE');
          this.candidatures.update(prev => [...prev, ...retenues]);
        });
      });
    });
    this.api.getBailsProprietaire().subscribe(bs => this.bails.set(bs));
  }

  generer(candidatureId: number): void {
    this.api.genererBail(candidatureId).subscribe({
      next: (b) => {
        this.bails.update(bs => [...bs, b]);
        this.snack.open('Bail généré avec succès', '', { panelClass: 'success-snack' });
      },
      error: () => this.snack.open('Erreur lors de la génération', 'Fermer', { panelClass: 'error-snack' })
    });
  }

  signerEnvoyer(bailId: number): void {
    this.api.signerEtEnvoyerBail(bailId).subscribe({
      next: (updated) => {
        this.bails.update(bs => bs.map(b => b.id === updated.id ? updated : b));
        this.snack.open('Bail envoyé via DocuSign au locataire', '', { panelClass: 'success-snack' });
      },
      error: () => this.snack.open('Erreur DocuSign', 'Fermer', { panelClass: 'error-snack' })
    });
  }

  getBailForCand(candId: number): BailResponse | undefined {
    return this.bails().find(b => b.candidatureId === candId);
  }

  bailPill(statut: string): string {
    return { GENERE: 'pill--warn', SIGNE_PROPRIO: 'pill--new', SIGNE_COMPLET: 'pill--ok', ACTIF: 'pill--ok' }[statut] ?? 'pill--gray';
  }

  bailLabel(statut: string): string {
    return { GENERE: 'Généré', SIGNE_PROPRIO: 'Att. locataire', SIGNE_COMPLET: 'Signé ✓', ACTIF: 'Actif' }[statut] ?? statut;
  }
}
