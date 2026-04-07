import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '@core/services/api.service';
import { BailResponse } from '@core/models';

@Component({
  selector: 'app-signature-loc',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      @if (bail()) {
        <!-- Bannière signature -->
        <div class="sign-banner">
          <div class="sign-banner__icon">✍</div>
          <div>
            <div class="sign-banner__title">Votre bail est prêt à être signé</div>
            <div class="sign-banner__sub text-muted">
              Jean Dupré a déjà signé · délai de signature : 7 jours
            </div>
          </div>
          <button class="btn btn--docusign" (click)="signerDocuSign()">
            Signer via DocuSign
          </button>
        </div>

        <div class="two-col">
          <!-- Aperçu bail -->
          <div class="bail-preview">
            <div class="bail-preview__header">
              <div class="bail-preview__title">Contrat de bail d'habitation</div>
              <div class="bail-preview__sub">Généré par Seren · Loi du 6 juillet 1989</div>
            </div>
            <div class="bail-preview__body">
              <div class="bail-section">
                <div class="bail-section__title">Parties</div>
                <div class="bail-grid">
                  <div class="bail-field">
                    <div class="bail-field__lbl">Bailleur</div>
                    <div class="bail-field__val">Propriétaire</div>
                  </div>
                  <div class="bail-field">
                    <div class="bail-field__lbl">Locataire</div>
                    <div class="bail-field__val">{{ bail()!.locatairePrenom }} {{ bail()!.locataireNom }}</div>
                  </div>
                </div>
              </div>
              <div class="bail-section">
                <div class="bail-section__title">Conditions financières</div>
                <div class="bail-grid">
                  <div class="bail-field"><div class="bail-field__lbl">Loyer HC</div><div class="bail-field__val">{{ bail()!.loyer | number }} €</div></div>
                  <div class="bail-field"><div class="bail-field__lbl">Charges</div><div class="bail-field__val">{{ bail()!.charges | number }} €/mois</div></div>
                  <div class="bail-field"><div class="bail-field__lbl">Total CC</div><div class="bail-field__val">{{ (bail()!.loyer + bail()!.charges) | number }} €</div></div>
                  <div class="bail-field"><div class="bail-field__lbl">Dépôt garantie</div><div class="bail-field__val">{{ bail()!.depot | number }} €</div></div>
                  <div class="bail-field"><div class="bail-field__lbl">Entrée</div><div class="bail-field__val">{{ bail()!.dateEntree | date:'d MMM y':'':'fr' }}</div></div>
                  <div class="bail-field"><div class="bail-field__lbl">Durée</div><div class="bail-field__val">{{ bail()!.dureeAns }} ans renouvelable</div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="card">
              <div class="card__head"><div class="card__title">Étapes</div></div>
              <div class="card__body">
                <div class="step-list">
                  <div class="step-item"><div class="step-num step-num--done">✓</div><div class="step-text"><strong>Bail généré</strong> automatiquement</div></div>
                  <div class="step-item"><div class="step-num step-num--done">✓</div><div class="step-text"><strong>Propriétaire</strong> a signé</div></div>
                  <div class="step-item step-item--current"><div class="step-num step-num--current">3</div><div class="step-text"><strong>Votre signature</strong> en attente</div></div>
                  <div class="step-item"><div class="step-num step-num--wait">4</div><div class="step-text"><strong>Bail finalisé</strong> et archivé</div></div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card__body" style="display:flex;flex-direction:column;gap:8px;">
                <button class="btn btn--docusign btn--full" (click)="signerDocuSign()">
                  DocuSign · Signer maintenant
                </button>
                <button class="btn btn--ghost btn--full">
                  Télécharger le bail en PDF
                </button>
                <div class="text-muted" style="font-size:10px;text-align:center;line-height:1.5;">
                  Conforme eIDAS · valeur juridique équivalente au manuscrit
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else if (loading()) {
        <div class="empty-state">Chargement…</div>
      } @else {
        <div class="empty-state">
          <div style="font-size:36px;margin-bottom:10px;">📄</div>
          <div>Aucun bail en attente de signature.</div>
          <div class="text-muted" style="font-size:11px;margin-top:6px;">
            Le propriétaire génèrera le bail après la visite.
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; overflow-y: auto; height: calc(100vh - 52px); }
    .sign-banner { border: 1.5px solid #c9a84c; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 16px; background: #fffdf7; flex-wrap: wrap; }
    .sign-banner__icon { width: 44px; height: 44px; border-radius: 10px; background: #1a2744; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; }
    .sign-banner__title { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
    .two-col { display: grid; grid-template-columns: minmax(0,1fr) 280px; gap: 16px; }
    .bail-preview { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .bail-preview__header { background: #1a2744; padding: 18px 22px; }
    .bail-preview__title { font-size: 16px; font-weight: 500; color: #fff; margin-bottom: 3px; }
    .bail-preview__sub { font-size: 11px; color: rgba(255,255,255,0.45); }
    .bail-preview__body { padding: 16px 22px; display: flex; flex-direction: column; gap: 14px; }
    .bail-section { border-bottom: 0.5px solid rgba(0,0,0,0.07); padding-bottom: 14px; &:last-child { border-bottom: none; padding-bottom: 0; } }
    .bail-section__title { font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #aaa; margin-bottom: 10px; }
    .bail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .bail-field__lbl { font-size: 10px; color: #aaa; margin-bottom: 2px; }
    .bail-field__val { font-size: 13px; font-weight: 500; }
    .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .card__head { padding: 13px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.07); }
    .card__title { font-size: 13px; font-weight: 500; }
    .card__body { padding: 14px 16px; }
    .step-list { display: flex; flex-direction: column; gap: 7px; }
    .step-item { display: flex; align-items: center; gap: 9px; padding: 9px 11px; background: #f5f4f0; border-radius: 8px; &--current { background: #fffdf7; border: 0.5px solid #c9a84c; } }
    .step-num { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; flex-shrink: 0; &--done { background: #E1F5EE; color: #085041; } &--current { background: #1a2744; color: #fff; } &--wait { background: #fff; border: 0.5px solid rgba(0,0,0,0.12); color: #aaa; } }
    .step-text { font-size: 11px; color: #555; }
    .empty-state { text-align: center; color: #aaa; padding: 60px 20px; }
  `]
})
export class SignatureLocComponent implements OnInit {
  bail    = signal<BailResponse | null>(null);
  loading = signal(true);

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.getBailsLocataire().subscribe({
      next: (bs) => {
        this.loading.set(false);
        const pending = bs.find(b => b.statut === 'SIGNE_PROPRIO');
        this.bail.set(pending ?? null);
      },
      error: () => this.loading.set(false)
    });
  }

  signerDocuSign(): void {
    // En production : ouvrir l'URL DocuSign retournée par l'API
    this.snack.open('Redirection vers DocuSign…', '', { panelClass: 'success-snack' });
    window.open('https://demo.docusign.net', '_blank');
  }
}


// ── BailLocComponent ──────────────────────────────────────────────────────
@Component({
  selector: 'app-bail-loc',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      @if (bail()) {
        <div class="bail-archived">
          <div class="bail-archived__header">
            <div>
              <div class="bail-archived__title">Bail — {{ bail()!.bienAdresse }}</div>
              <div class="bail-archived__sub">
                Signé le {{ bail()!.signeLocataire | date:'d MMM y':'':'fr' }} · DocuSign · eIDAS certifié
              </div>
            </div>
            <span class="pill pill--ok" style="font-size:11px;padding:5px 12px;">Location active</span>
          </div>
          <div class="bail-archived__body">
            <div class="ba-stats">
              <div class="ba-stat"><div class="ba-stat__val">{{ bail()!.dateEntree | date:'d MMM y':'':'fr' }}</div><div class="ba-stat__lbl">Entrée dans les lieux</div></div>
              <div class="ba-stat"><div class="ba-stat__val">{{ (bail()!.loyer + bail()!.charges) | number }} €</div><div class="ba-stat__lbl">Loyer CC</div></div>
              <div class="ba-stat"><div class="ba-stat__val">{{ bail()!.dureeAns }} ans</div><div class="ba-stat__lbl">Durée du bail</div></div>
              <div class="ba-stat"><div class="ba-stat__val">{{ bail()!.dateEcheance | date:'MMM y':'':'fr' }}</div><div class="ba-stat__lbl">Échéance bail</div></div>
            </div>
            <div class="ba-sep"></div>
            <div class="doc-list">
              <div class="doc-item doc-item--green">
                <div class="doc-item__name">Bail d'habitation signé</div>
                <div class="doc-item__meta">{{ bail()!.signeLocataire | date:'d MMM y':'':'fr' }} · 12 pages · SHA-256 certifié</div>
                <button class="btn btn--ghost" style="font-size:11px;padding:5px 14px;">Télécharger</button>
              </div>
              <div class="doc-item">
                <div class="doc-item__name">Attestation d'assurance habitation</div>
                <div class="doc-item__meta">À charger avant le {{ bail()!.dateEntree | date:'d MMM y':'':'fr' }} · obligatoire</div>
                <button class="btn btn--ghost" style="font-size:11px;padding:5px 14px;border-color:#EF9F27;color:#BA7517;">Charger</button>
              </div>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <div class="card__head"><div class="card__title">Mes échéances</div></div>
            <div class="card__body">
              <div class="ech-row">
                <div class="ech-dot" style="background:#BA7517;"></div>
                <div class="ech-info"><div class="ech-lbl">Assurance habitation</div><div class="text-muted" style="font-size:10px;">Avant le {{ bail()!.dateEntree | date:'d MMM y':'':'fr' }}</div></div>
                <span class="pill pill--warn">À faire</span>
              </div>
              <div class="ech-row">
                <div class="ech-dot" style="background:#1D9E75;"></div>
                <div class="ech-info"><div class="ech-lbl">1er loyer + dépôt de garantie</div><div class="text-muted" style="font-size:10px;">{{ bail()!.dateEntree | date:'d MMM y':'':'fr' }}</div></div>
                <div style="text-align:right;"><div style="font-size:13px;font-weight:500;color:#1a2744;">{{ (bail()!.loyer + bail()!.depot) | number }} €</div><span class="pill pill--ok">Prévu</span></div>
              </div>
              <div class="ech-row">
                <div class="ech-dot" style="background:#1D9E75;"></div>
                <div class="ech-info"><div class="ech-lbl">Loyer mensuel</div><div class="text-muted" style="font-size:10px;">1er de chaque mois</div></div>
                <div style="text-align:right;"><div style="font-size:13px;font-weight:500;color:#1a2744;">{{ (bail()!.loyer + bail()!.charges) | number }} €</div><span class="pill pill--gray">Récurrent</span></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card__head"><div class="card__title">Mon propriétaire</div></div>
            <div class="card__body" style="display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;border-radius:50%;background:#FAEEDA;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;color:#633806;">PR</div>
                <div><div style="font-size:13px;font-weight:500;">Votre propriétaire</div><div class="text-muted" style="font-size:10px;">{{ bail()!.bienAdresse }}</div><span class="pill pill--ok" style="margin-top:3px;">Identité vérifiée</span></div>
              </div>
              <button class="btn btn--primary btn--full">Envoyer un message</button>
            </div>
          </div>
        </div>
      } @else if (loading()) {
        <div class="empty-state">Chargement…</div>
      } @else {
        <div class="empty-state">
          <div style="font-size:36px;margin-bottom:10px;">🏠</div>
          <div>Aucun bail actif pour le moment.</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 20px 24px; overflow-y: auto; height: calc(100vh - 52px); }
    .bail-archived { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
    .bail-archived__header { background: #1a2744; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; }
    .bail-archived__title { font-size: 14px; font-weight: 500; color: #fff; margin-bottom: 3px; }
    .bail-archived__sub { font-size: 11px; color: rgba(255,255,255,0.4); }
    .bail-archived__body { padding: 16px 22px; }
    .ba-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 14px; }
    .ba-stat__val { font-size: 14px; font-weight: 500; color: #1a2744; }
    .ba-stat__lbl { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
    .ba-sep { height: 0.5px; background: rgba(0,0,0,0.07); margin-bottom: 14px; }
    .doc-list { display: flex; flex-direction: column; gap: 8px; }
    .doc-item { display: flex; align-items: center; gap: 12px; padding: 11px 13px; background: #f5f4f0; border-radius: 8px; &--green { background: #E1F5EE; } }
    .doc-item__name { font-size: 12px; font-weight: 500; flex: 1; }
    .doc-item__meta { font-size: 10px; color: #aaa; margin-top: 1px; flex: 1; }
    .two-col { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 16px; }
    .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
    .card__head { padding: 13px 16px; border-bottom: 0.5px solid rgba(0,0,0,0.07); }
    .card__title { font-size: 13px; font-weight: 500; }
    .card__body { padding: 14px 16px; }
    .ech-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); &:last-child { border-bottom: none; } }
    .ech-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .ech-info { flex: 1; }
    .ech-lbl { font-size: 12px; font-weight: 500; }
    .empty-state { text-align: center; color: #aaa; padding: 60px 20px; }
  `]
})
export class BailLocComponent implements OnInit {
  bail    = signal<BailResponse | null>(null);
  loading = signal(true);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getBailsLocataire().subscribe({
      next: (bs) => {
        this.loading.set(false);
        const actif = bs.find(b => b.statut === 'SIGNE_COMPLET' || b.statut === 'ACTIF');
        this.bail.set(actif ?? null);
      },
      error: () => this.loading.set(false)
    });
  }
}
