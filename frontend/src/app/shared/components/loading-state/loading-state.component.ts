import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  template: `
    @switch (status()) {
      @case ('loading') {
        <div class="state-container" role="status" aria-live="polite">
          <mat-spinner diameter="48" aria-label="Loading content"></mat-spinner>
          <p class="state-text">Loading...</p>
        </div>
      }
      @case ('error') {
        <div class="state-container">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <p class="state-text">{{ errorMessage() || 'Something went wrong' }}</p>
          <button mat-stroked-button (click)="retry.emit()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      }
      @case ('empty') {
        <div class="state-container">
          <mat-icon class="empty-icon" aria-hidden="true">{{ emptyIcon() }}</mat-icon>
          <p class="state-title">{{ emptyTitle() || 'No data found' }}</p>
          <p class="state-text">{{ emptyMessage() || 'There are no items to display yet.' }}</p>
        </div>
      }
    }
  `,
  styles: `
    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      gap: 1rem;
      text-align: center;
    }

    .state-text {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-large);
      margin: 0;
    }

    .state-title {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
      margin: 0;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-sys-error);
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-outline);
      opacity: 0.6;
    }
  `,
})
export class LoadingStateComponent {
  status = input.required<'loading' | 'error' | 'empty'>();
  errorMessage = input<string>();
  emptyTitle = input<string>();
  emptyMessage = input<string>();
  emptyIcon = input('inbox');

  retry = output<void>();
}
