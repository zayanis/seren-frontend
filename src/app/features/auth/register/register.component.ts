import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { Role } from '@core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatButtonToggleModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo" routerLink="/">
          <div class="auth-logo__dot"></div>
          <span>Seren</span>
        </div>

        <h1 class="auth-title">Créer un compte</h1>
        <p class="auth-sub">
          Déjà inscrit ? <a routerLink="/auth/login">Se connecter</a>
        </p>

        <div class="role-toggle">
          <button class="role-btn"
                  [class.active]="selectedRole() === 'PROPRIETAIRE'"
                  (click)="selectedRole.set('PROPRIETAIRE')">
            Propriétaire
          </button>
          <button class="role-btn"
                  [class.active]="selectedRole() === 'LOCATAIRE'"
                  (click)="selectedRole.set('LOCATAIRE')">
            Locataire
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="name-row">
            <mat-form-field appearance="outline">
              <mat-label>Prénom</mat-label>
              <input matInput formControlName="firstName"/>
              <mat-error>Requis</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nom</mat-label>
              <input matInput formControlName="lastName"/>
              <mat-error>Requis</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email"/>
            <mat-error *ngIf="form.get('email')?.hasError('required')">Requis</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput formControlName="password"
                   [type]="showPwd() ? 'text' : 'password'"/>
            <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
              <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-hint>8 caractères minimum</mat-hint>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">
              8 caractères minimum
            </mat-error>
          </mat-form-field>

          <button mat-raised-button class="auth-submit"
                  type="submit" [disabled]="form.invalid || loading()">
            <mat-spinner *ngIf="loading()" diameter="18"></mat-spinner>
            <span *ngIf="!loading()">Créer mon compte</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; background: #1a2744;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .auth-card {
      background: #fff; border-radius: 16px;
      padding: 40px; width: 100%; max-width: 420px;
    }
    .auth-logo {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 28px; cursor: pointer;
      font-size: 18px; font-weight: 500; color: #1a2744;
    }
    .auth-logo__dot { width: 8px; height: 8px; border-radius: 50%; background: #c9a84c; }
    .auth-title { font-size: 22px; font-weight: 500; margin: 0 0 6px; }
    .auth-sub {
      font-size: 13px; color: #888; margin: 0 0 20px;
    }
    .auth-sub a { color: #1a2744; font-weight: 500; text-decoration: none; }
    .role-toggle {
      display: flex; gap: 8px; margin-bottom: 20px;
    }
    .role-btn {
      flex: 1; padding: 10px;
      border: 0.5px solid rgba(0,0,0,0.15);
      border-radius: 8px; background: transparent;
      font-size: 12px; cursor: pointer; transition: all 0.15s;
    }
    .role-btn.active {
      background: #1a2744; color: #fff; border-color: #1a2744;
    }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .name-row { display: flex; gap: 10px; }
    .auth-submit {
      margin-top: 8px;
      background: #1a2744 !important;
      color: #fff !important;
      height: 44px; font-size: 13px;
    }
  `]
})
export class RegisterComponent {
  loading  = signal(false);
  showPwd  = signal(false);
  selectedRole = signal<Role>('LOCATAIRE');

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.auth.register({ ...this.form.value as any, role: this.selectedRole() }).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.message || 'Erreur lors de l\'inscription', 'Fermer',
          { panelClass: 'error-snack' });
      }
    });
  }
}
