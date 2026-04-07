import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  BienRequest, BienResponse,
  CandidatureResponse,
  VisiteRequest, VisiteResponse,
  BailResponse
} from '@core/models';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Biens ────────────────────────────────────────────────────────────────
  creerBien(request: BienRequest): Observable<BienResponse> {
    return this.http.post<BienResponse>(`${this.base}/biens`, request);
  }

  getBiens(): Observable<BienResponse[]> {
    return this.http.get<BienResponse[]>(`${this.base}/biens`);
  }

  getBienById(id: number): Observable<BienResponse> {
    return this.http.get<BienResponse>(`${this.base}/biens/${id}`);
  }

  accederParCode(code: string): Observable<BienResponse> {
    return this.http.get<BienResponse>(`${this.base}/biens/acces/${code}`);
  }

  regenererCode(bienId: number): Observable<BienResponse> {
    return this.http.patch<BienResponse>(`${this.base}/biens/${bienId}/regenerer-code`, {});
  }

  // ── Candidatures ─────────────────────────────────────────────────────────
  postuler(codeAcces: string, message: string, fichiers: File[]): Observable<CandidatureResponse> {
    const formData = new FormData();
    formData.append('codeAcces', codeAcces);
    if (message) formData.append('message', message);
    fichiers.forEach(f => formData.append('fichiers', f));
    return this.http.post<CandidatureResponse>(`${this.base}/candidatures`, formData);
  }

  getCandidaturesParBien(bienId: number): Observable<CandidatureResponse[]> {
    return this.http.get<CandidatureResponse[]>(`${this.base}/candidatures/bien/${bienId}`);
  }

  getMesCandidatures(): Observable<CandidatureResponse[]> {
    return this.http.get<CandidatureResponse[]>(`${this.base}/candidatures/mes`);
  }

  retenirCandidature(id: number): Observable<CandidatureResponse> {
    return this.http.patch<CandidatureResponse>(`${this.base}/candidatures/${id}/retenir`, {});
  }

  refuserCandidature(id: number): Observable<CandidatureResponse> {
    return this.http.patch<CandidatureResponse>(`${this.base}/candidatures/${id}/refuser`, {});
  }

  // ── Visites ───────────────────────────────────────────────────────────────
  proposerVisite(request: VisiteRequest): Observable<VisiteResponse> {
    return this.http.post<VisiteResponse>(`${this.base}/visites`, request);
  }

  getVisitesProprietaire(): Observable<VisiteResponse[]> {
    return this.http.get<VisiteResponse[]>(`${this.base}/visites/proprietaire`);
  }

  getVisitesLocataire(): Observable<VisiteResponse[]> {
    return this.http.get<VisiteResponse[]>(`${this.base}/visites/locataire`);
  }

  confirmerVisite(id: number): Observable<VisiteResponse> {
    return this.http.patch<VisiteResponse>(`${this.base}/visites/${id}/confirmer`, {});
  }

  annulerVisite(id: number): Observable<VisiteResponse> {
    return this.http.patch<VisiteResponse>(`${this.base}/visites/${id}/annuler`, {});
  }

  // ── Bails ─────────────────────────────────────────────────────────────────
  genererBail(candidatureId: number): Observable<BailResponse> {
    return this.http.post<BailResponse>(`${this.base}/bails/generer/${candidatureId}`, {});
  }

  signerEtEnvoyerBail(bailId: number): Observable<BailResponse> {
    return this.http.post<BailResponse>(`${this.base}/bails/${bailId}/signer-envoyer`, {});
  }

  getBailsProprietaire(): Observable<BailResponse[]> {
    return this.http.get<BailResponse[]>(`${this.base}/bails/proprietaire`);
  }

  getBailsLocataire(): Observable<BailResponse[]> {
    return this.http.get<BailResponse[]>(`${this.base}/bails/locataire`);
  }

  getBailById(id: number): Observable<BailResponse> {
    return this.http.get<BailResponse>(`${this.base}/bails/${id}`);
  }

  // ── Dossiers ──────────────────────────────────────────────────────────────
  telechargerDossier(candidatureId: number): Observable<Blob> {
    return this.http.get(
      `${this.base}/dossiers/candidature/${candidatureId}/telecharger`,
      { responseType: 'blob' }
    );
  }

  telechargerMonDossier(): Observable<Blob> {
    return this.http.get(`${this.base}/dossiers/mon-dossier/telecharger`, { responseType: 'blob' });
  }

  supprimerMonDossier(): Observable<void> {
    return this.http.delete<void>(`${this.base}/dossiers/mon-dossier`);
  }
}
