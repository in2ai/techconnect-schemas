import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../../../core/tokens/api-url.token';
import { NotificationService } from '../../../../core/services/notification.service';
import { PassageService } from '../../services/passage.service';
import { Passage } from '../../models/passage.model';
import { Trial } from '../../../trials/models/trial.model';
import { PageHeaderComponent, Breadcrumb } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-passage-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatTabsModule, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, LoadingStateComponent],
  template: `
    <app-page-header title="Passage" [breadcrumbs]="breadcrumbs()">
      <button mat-stroked-button color="warn" (click)="confirmDelete()"><mat-icon>delete</mat-icon> Delete</button>
    </app-page-header>

    @if (passageResource.isLoading()) {
      <app-loading-state status="loading" />
    } @else if (passageResource.error()) {
      <app-loading-state status="error" errorMessage="Failed to load passage" (retry)="passageResource.reload()" />
    } @else if (passageResource.hasValue()) {
      <mat-card appearance="outlined" class="detail-card">
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">ID</span><span class="detail-value">{{ passageResource.value()!.id }}</span></div>
            <div class="detail-item"><span class="detail-label">Number</span><span class="detail-value">{{ passageResource.value()!.number ?? '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">{{ passageResource.value()!.status || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Viability</span><span class="detail-value">{{ passageResource.value()!.viability ?? '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">S-Index</span><span class="detail-value">{{ passageResource.value()!.s_index ?? '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Description</span><span class="detail-value">{{ passageResource.value()!.description || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Biomodel</span><span class="detail-value">{{ passageResource.value()!.biomodel_id }}</span></div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="detail-tabs" animationDuration="200ms">
        <mat-tab label="Trials">
          <div class="tab-content">
            @if (trialsResource.isLoading()) {
              <app-loading-state status="loading" />
            } @else if (trialsResource.error()) {
              <app-loading-state status="error" errorMessage="Unable to load trials" (retry)="trialsResource.reload()" />
            } @else if (filteredTrials().length === 0) {
              <app-loading-state status="empty" emptyIcon="assignment" emptyTitle="No trials" emptyMessage="No trials linked to this passage." />
            } @else {
              <app-data-table [columns]="trialColumns" [data]="filteredTrials()" (rowClicked)="onTrialClick($event)" />
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    .detail-card { margin-bottom: 1.5rem; border-radius: 12px !important; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
    .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-label { font: var(--mat-sys-label-medium); color: var(--mat-sys-on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-value { font: var(--mat-sys-body-large); color: var(--mat-sys-on-surface); }
    .detail-tabs { margin-top: 1rem; }
    .tab-content { padding: 1.5rem 0; }
  `,
})
export class PassageDetailPage {
  id = input.required<string>();

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private passageService = inject(PassageService);
  private notification = inject(NotificationService);
  private apiUrl = inject(API_URL);

  breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Passages', route: '/passages' },
    { label: this.id() },
  ]);

  passageResource = httpResource<Passage>(() => `${this.apiUrl}/passages/${this.id()}`);
  trialsResource = httpResource<Trial[]>(() => `${this.apiUrl}/trials`, { defaultValue: [] });

  filteredTrials = computed(() =>
    this.trialsResource.value()?.filter((t) => t.passage_id === this.id()) ?? [],
  );

  trialColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'success', label: 'Success', type: 'boolean' },
    { key: 'creation_date', label: 'Created', sortable: true, type: 'date' },
    { key: 'biobank_shipment', label: 'Shipment', type: 'boolean' },
  ];

  onTrialClick(trial: Trial): void {
    this.router.navigate(['/trials', trial.id]);
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Passage', message: 'Delete this passage? This cannot be undone.', confirmLabel: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.passageService.delete(this.id()).subscribe({
          next: () => { this.notification.success('Passage deleted'); this.router.navigate(['/passages']); },
          error: () => { this.notification.error('Failed to delete passage'); },
        });
      }
    });
  }
}
