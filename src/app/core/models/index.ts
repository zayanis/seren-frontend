// ── Auth ──────────────────────────────────────────────────────────────────
export type Role = 'PROPRIETAIRE' | 'LOCATAIRE';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface CurrentUser {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  initials: string;
}

// ── Bien ──────────────────────────────────────────────────────────────────
export type StatutBien = 'VACANT' | 'LOUE';

export interface BienRequest {
  titre: string;
  adresse: string;
  ville?: string;
  codePostal?: string;
  surface?: number;
  nbPieces?: number;
  etage?: number;
  loyer: number;
  charges?: number;
  depot?: number;
  dpe?: string;
  description?: string;
  disponibilite?: string;
}

export interface BienResponse {
  id: number;
  titre: string;
  adresse: string;
  ville: string;
  codePostal: string;
  surface: number;
  nbPieces: number;
  etage: number;
  loyer: number;
  charges: number;
  depot: number;
  dpe: string;
  description: string;
  disponibilite: string;
  codeAcces: string;
  codeExpiresAt: string;
  statut: StatutBien;
  nbCandidatures: number;
  nbAnomalies: number;
}

// ── Candidature ───────────────────────────────────────────────────────────
export type StatutCandidature =
  | 'EN_ATTENTE'
  | 'VUE'
  | 'RETENUE'
  | 'VISITE_PROPOSEE'
  | 'REFUSEE';

export interface CandidatureResponse {
  id: number;
  bienId: number;
  bienTitre: string;
  bienAdresse: string;
  locataireId: number;
  locataireNom: string;
  locatairePrenom: string;
  message: string;
  score: number;
  statut: StatutCandidature;
  anomalieDetectee: boolean;
  anomalieDetail: string;
  createdAt: string;
  vueLe: string;
}

// ── Visite ────────────────────────────────────────────────────────────────
export type StatutVisite = 'PROPOSEE' | 'CONFIRMEE' | 'ANNULEE' | 'EFFECTUEE';

export interface VisiteRequest {
  candidatureId: number;
  dateVisite: string;
}

export interface VisiteResponse {
  id: number;
  candidatureId: number;
  locataireNom: string;
  locatairePrenom: string;
  bienAdresse: string;
  dateVisite: string;
  statut: StatutVisite;
  createdAt: string;
}

// ── Bail ──────────────────────────────────────────────────────────────────
export type StatutBail = 'GENERE' | 'SIGNE_PROPRIO' | 'SIGNE_COMPLET' | 'ACTIF';

export interface BailResponse {
  id: number;
  candidatureId: number;
  locataireNom: string;
  locatairePrenom: string;
  bienAdresse: string;
  loyer: number;
  charges: number;
  depot: number;
  dateEntree: string;
  dateEcheance: string;
  dureeAns: number;
  statut: StatutBail;
  docusignEnvelopeId: string;
  signeProprio: string;
  signeLocataire: string;
  createdAt: string;
}
