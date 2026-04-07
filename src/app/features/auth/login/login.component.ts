import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo" routerLink="/">
          <div class="auth-logo__dot"></div>
          <span>Seren</span>
        </div>

        <h1 class="auth-title">Connexion</h1>
        <p class="auth-sub">
          Pas encore de compte ?
          <a routerLink="/auth/register">Créer un compte</a>
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email"/>
            <mat-error *ngIf="form.get('email')?.hasError('required')">Email requis</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Email invalide</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput formControlName="password"
                   [type]="showPwd() ? 'text' : 'password'"
                   autocomplete="current-password"/>
            <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
              <mat-icon>{{ showPwd() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Mot de passe requis</mat-error>
          </mat-form-field>

          <button mat-raised-button class="auth-submit"
                  type="submit"
                  [disabled]="form.invalid || loading()">
            <mat-spinner *ngIf="loading()" diameter="18"></mat-spinner>
            <span *ngIf="!loading()">Se connecter</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      background: #1a2744;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .auth-card {
      background: #fff;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    .auth-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 28px;
      cursor: pointer;
      font-size: 18px;
      font-weight: 500;
      color: #1a2744;
      &__dot {
        width: 8px; height: 8px;
        border-radius: 50%; background: #c9a84c;
      }
    }
    .auth-title { font-size: 22px; font-weight: 500; margin: 0 0 6px; }
    .auth-sub {
      font-size: 13px; color: #888; margin: 0 0 24px;
      a { color: #1a2744; font-weight: 500; text-decoration: none; }
    }
    .auth-form {
      display: flex; flex-direction: column; gap: 4px;
    }
    .auth-submit {
      margin-top: 8px;
      background: #1a2744 !important;
      color: #fff !important;
      height: 44px;
      font-size: 13px;
      mat-spinner { display: inline-block; margin: auto; }
    }
  `]
})
export class LoginComponent {
  loading = signal(false);
  showPwd = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.snack.open(
          err.error?.message || 'Email ou mot de passe incorrect',
          'Fermer', { panelClass: 'error-snack' }
        );
      }
    });
  }
}
