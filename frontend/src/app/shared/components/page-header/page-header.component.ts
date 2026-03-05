import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, RouterLink],
  template: `
    <div class="page-header">
      @if (breadcrumbs().length) {
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
            @if (crumb.route && !last) {
              <a [routerLink]="crumb.route" class="breadcrumb-link">{{ crumb.label }}</a>
              <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
            } @else {
              <span class="breadcrumb-current" [attr.aria-current]="last ? 'page' : null">{{
                crumb.label
              }}</span>
            }
          }
        </nav>
      }
      <div class="header-row">
        <div class="header-text">
          <h1 class="page-title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="page-subtitle">{{ subtitle() }}</p>
          }
        </div>
        <div class="header-actions">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-header {
      margin-bottom: 1.75rem;
      animation: headerEnter 0.35s ease-out;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      margin-bottom: 0.625rem;
      font: var(--mat-sys-body-small);
    }

    .breadcrumb-link {
      color: var(--mat-sys-primary);
      text-decoration: none;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent);
        text-decoration: none;
      }
    }

    .breadcrumb-sep {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--mat-sys-outline);
    }

    .breadcrumb-current {
      color: var(--mat-sys-on-surface-variant);
      padding: 0.125rem 0.375rem;
      font-weight: 500;
    }

    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-title {
      font: var(--mat-sys-headline-medium);
      color: var(--mat-sys-on-surface);
      margin: 0;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
      margin: 0.375rem 0 0;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    @keyframes headerEnter {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  breadcrumbs = input<Breadcrumb[]>([]);
}
