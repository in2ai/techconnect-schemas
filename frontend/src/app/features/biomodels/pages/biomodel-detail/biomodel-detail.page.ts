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
import { BiomodelService } from '../../services/biomodel.service';
import { Biomodel } from '../../models/biomodel.model';
import { Passage } from '../../../passages/models/passage.model';
import { PageHeaderComponent, Breadcrumb } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { BiomodelFormComponent } from '../../components/biomodel-form/biomodel-form.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-biomodel-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatTabsModule, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, LoadingStateComponent],
  template: `
    <app-page-header [title]="'Biomodel'" [breadcrumbs]="breadcrumbs()">
      <button mat-stroked-button (click)="openEditDialog()"><mat-icon>edit</mat-icon> Edit</button>
      <button mat-stroked-button color="warn" (click)="confirmDelete()"><mat-icon>delete</mat-icon> Delete</button>
    </app-page-header>

    @if (biomodelResource.isLoading()) {
      <app-loading-state status="loading" />
    } @else if (biomodelResource.error()) {
      <app-loading-state status="error" errorMessage="Failed to load biomodel" (retry)="biomodelResource.reload()" />
    } @else if (biomodelResource.hasValue()) {
      <mat-card appearance="outlined" class="detail-card">
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">ID</span><span class="detail-value">{{ biomodelResource.value()!.id }}</span></div>
            <div class="detail-item"><span class="detail-label">Type</span><span class="detail-value">{{ biomodelResource.value()!.type || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">{{ biomodelResource.value()!.status || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Viability</span><span class="detail-value">{{ biomodelResource.value()!.viability ?? '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Progresses</span><span class="detail-value">{{ biomodelResource.value()!.progresses === true ? 'Yes' : biomodelResource.value()!.progresses === false ? 'No' : '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Preclinical Trials</span><span class="detail-value">{{ biomodelResource.value()!.preclinical_trials || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Description</span><span class="detail-value">{{ biomodelResource.value()!.description || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Created</span><span class="detail-value">{{ biomodelResource.value()!.creation_date || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Tumor</span><span class="detail-value">{{ biomodelResource.value()!.tumor_biobank_code }}</span></div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="detail-tabs" animationDuration="200ms">
        <mat-tab label="Passages">
          <div class="tab-content">
            @if (passagesResource.isLoading()) {
              <app-loading-state status="loading" />
            } @else if (passagesResource.error()) {
              <app-loading-state status="error" errorMessage="Failed to load passages" (retry)="passagesResource.reload()" />
            } @else if (filteredPassages().length === 0) {
              <app-loading-state status="empty" emptyIcon="swap_horiz" emptyTitle="No passages" emptyMessage="No passages linked to this biomodel." />
            } @else {
              <app-data-table [columns]="passageColumns" [data]="filteredPassages()" (rowClicked)="onPassageClick($event)" />
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
export class BiomodelDetailPage {
  id = input.required<string>();

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private biomodelService = inject(BiomodelService);
  private notification = inject(NotificationService);
  private apiUrl = inject(API_URL);

  breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Biomodels', route: '/biomodels' },
    { label: this.id() },
  ]);

  biomodelResource = httpResource<Biomodel>(() => `${this.apiUrl}/biomodels/${this.id()}`);
  passagesResource = httpResource<Passage[]>(() => `${this.apiUrl}/passages`, { defaultValue: [] });

  filteredPassages = computed(() =>
    this.passagesResource.value()?.filter((p) => p.biomodel_id === this.id()) ?? [],
  );

  passageColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'number', label: 'Number', sortable: true, type: 'number' },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'viability', label: 'Viability', sortable: true, type: 'number' },
    { key: 's_index', label: 'S-Index', sortable: true, type: 'number' },
  ];

  onPassageClick(passage: Passage): void {
    this.router.navigate(['/passages', passage.id]);
  }

  openEditDialog(): void {
    const biomodel = this.biomodelResource.value();
    if (!biomodel) return;
    const dialogRef = this.dialog.open(BiomodelFormComponent, { width: '600px', data: { mode: 'edit', biomodel } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.biomodelService.update(biomodel.id, result).subscribe({
          next: () => { this.notification.success('Biomodel updated'); this.biomodelResource.reload(); },
          error: () => { this.notification.error('Failed to update biomodel'); },
        });
      }
    });
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Biomodel', message: 'Delete this biomodel? This cannot be undone.', confirmLabel: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.biomodelService.delete(this.id()).subscribe({
          next: () => { this.notification.success('Biomodel deleted'); this.router.navigate(['/biomodels']); },
          error: () => { this.notification.error('Failed to delete biomodel'); },
        });
      }
    });
  }
}
