import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../core/tokens/api-url.token';

interface DashboardCard {
  title: string;
  icon: string;
  route: string;
  endpoint: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard-hero">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to TechConnect</h1>
        <p class="hero-subtitle">
          Biomedical research data management platform. Navigate through your registry,
          biomodels, and clinical trial data.
        </p>
      </div>
    </div>

    <section class="dashboard-grid" aria-label="Entity overview">
      @for (card of cards; track card.route; let i = $index) {
        <a [routerLink]="card.route" class="card-link" [style.animation-delay]="i * 60 + 'ms'">
          <mat-card class="entity-card" appearance="outlined">
            <mat-card-content>
              <div class="card-header">
                <div class="card-icon-wrap" [style.background]="card.color + '18'" [style.color]="card.color">
                  <mat-icon>{{ card.icon }}</mat-icon>
                </div>
                <div class="card-count">
                  @if (getResource(card.endpoint).isLoading()) {
                    <mat-spinner diameter="20" aria-label="Loading count"></mat-spinner>
                  } @else if (getResource(card.endpoint).error()) {
                    <mat-icon class="count-error-icon" aria-label="Error loading data">error_outline</mat-icon>
                  } @else if (getResource(card.endpoint).hasValue()) {
                    {{ getResource(card.endpoint).value()!.length }}
                  } @else {
                    —
                  }
                </div>
              </div>
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-desc">{{ card.description }}</p>
            </mat-card-content>
          </mat-card>
        </a>
      }
    </section>
  `,
  styles: `
    .dashboard-hero {
      margin-bottom: 2rem;
      padding: 2.5rem 2rem;
      background: linear-gradient(135deg, var(--mat-sys-primary-container), var(--mat-sys-tertiary-container));
      border-radius: 16px;
    }

    .hero-title {
      font: var(--mat-sys-display-small);
      color: var(--mat-sys-on-primary-container);
      margin: 0 0 0.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .hero-subtitle {
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-primary-container);
      opacity: 0.85;
      margin: 0;
      max-width: 600px;
      line-height: 1.6;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .card-link {
      text-decoration: none;
      color: inherit;
      animation: fadeSlideUp 0.4s ease backwards;
    }

    .entity-card {
      height: 100%;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      border-radius: 12px !important;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .card-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .card-count {
      font: var(--mat-sys-headline-medium);
      font-weight: 700;
      color: var(--mat-sys-on-surface);
    }

    .count-error-icon {
      color: var(--mat-sys-error);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .card-title {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
      margin: 0 0 0.25rem;
    }

    .card-desc {
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
      line-height: 1.5;
    }

    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class DashboardPage {
  private apiUrl = inject(API_URL);

  cards: DashboardCard[] = [
    { title: 'Patients', icon: 'person', route: '/patients', endpoint: 'patients', color: '#2563eb', description: 'View and manage patient records and demographics.' },
    { title: 'Tumors', icon: 'coronavirus', route: '/tumors', endpoint: 'tumors', color: '#dc2626', description: 'Track tumor samples, classifications, and biobank codes.' },
    { title: 'Liquid Biopsies', icon: 'water_drop', route: '/liquid-biopsies', endpoint: 'liquid-biopsies', color: '#0891b2', description: 'Manage serum, buffy coat, and plasma samples.' },
    { title: 'Biomodels', icon: 'science', route: '/biomodels', endpoint: 'biomodels', color: '#7c3aed', description: 'Preclinical biomodels derived from tumor samples.' },
    { title: 'Passages', icon: 'swap_horiz', route: '/passages', endpoint: 'passages', color: '#059669', description: 'Track biomodel passages, viability, and growth indices.' },
    { title: 'Trials', icon: 'assignment', route: '/trials', endpoint: 'trials', color: '#d97706', description: 'PDX, PDO, and LC trial data with detailed outcomes.' },
  ];

  private resources = new Map<string, ReturnType<typeof httpResource<unknown[]>>>();

  constructor() {
    for (const card of this.cards) {
      const endpoint = card.endpoint;
      const url = this.apiUrl;
      this.resources.set(
        endpoint,
        httpResource<unknown[]>(() => `${url}/${endpoint}`),
      );
    }
  }

  getResource(endpoint: string) {
    const resource = this.resources.get(endpoint);
    if (!resource) {
      throw new Error(`No resource found for endpoint: ${endpoint}`);
    }
    return resource;
  }
}
