import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../../../core/tokens/api-url.token';
import { NotificationService } from '../../../../core/services/notification.service';
import { TrialService } from '../../services/trial.service';
import { Trial } from '../../models/trial.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { TrialFormComponent } from '../../components/trial-form/trial-form.component';

@Component({
  selector: 'app-trial-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, LoadingStateComponent],
  template: `
    <app-page-header title="Trials" subtitle="PDX, PDO, and LC trial data with detailed outcomes">
      <button mat-flat-button (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        Add Trial
      </button>
    </app-page-header>

    @if (trialsResource.isLoading()) {
      <app-loading-state status="loading" />
    } @else if (trialsResource.error()) {
      <app-loading-state status="error" errorMessage="Failed to load trials" (retry)="trialsResource.reload()" />
    } @else if (trialsResource.hasValue() && trialsResource.value()!.length === 0) {
      <app-loading-state status="empty" emptyIcon="assignment" emptyTitle="No trials yet" emptyMessage="Create your first trial." />
    } @else if (trialsResource.hasValue()) {
      <app-data-table [columns]="columns" [data]="trialsResource.value()!" (rowClicked)="onTrialClick($event)" />
    }
  `,
})
export class TrialListPage {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private trialService = inject(TrialService);
  private notification = inject(NotificationService);
  private apiUrl = inject(API_URL);

  columns: ColumnDef[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'success', label: 'Success', type: 'boolean' },
    { key: 'creation_date', label: 'Created', sortable: true, type: 'date' },
    { key: 'biobank_shipment', label: 'Shipment', type: 'boolean' },
    { key: 'passage_id', label: 'Passage', sortable: true },
  ];

  trialsResource = httpResource<Trial[]>(() => `${this.apiUrl}/trials`, { defaultValue: [] });

  onTrialClick(trial: Trial): void {
    this.router.navigate(['/trials', trial.id]);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TrialFormComponent, { width: '600px', data: { mode: 'create' } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.trialService.create(result).subscribe({
          next: () => { this.notification.success('Trial created'); this.trialsResource.reload(); },
          error: () => { this.notification.error('Failed to create trial'); },
        });
      }
    });
  }
}
