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
import { TumorService } from '../../services/tumor.service';
import { Tumor } from '../../models/tumor.model';
import { Biomodel } from '../../../biomodels/models/biomodel.model';
import { LiquidBiopsy } from '../../../liquid-biopsies/models/liquid-biopsy.model';
import { PageHeaderComponent, Breadcrumb } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { TumorFormComponent } from '../../components/tumor-form/tumor-form.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tumor-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatTabsModule, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, LoadingStateComponent],
  template: `
    <app-page-header [title]="'Tumor ' + biobank_code()" [breadcrumbs]="breadcrumbs()">
      <button mat-stroked-button (click)="openEditDialog()">
        <mat-icon>edit</mat-icon>
        Edit
      </button>
      <button mat-stroked-button color="warn" (click)="confirmDelete()">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </app-page-header>

    @if (tumorResource.isLoading()) {
      <app-loading-state status="loading" />
    } @else if (tumorResource.error()) {
      <app-loading-state status="error" errorMessage="Failed to load tumor" (retry)="tumorResource.reload()" />
    } @else if (tumorResource.hasValue()) {
      <mat-card appearance="outlined" class="detail-card">
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">Biobank Code</span><span class="detail-value">{{ tumorResource.value()!.biobank_code }}</span></div>
            <div class="detail-item"><span class="detail-label">Lab Code</span><span class="detail-value">{{ tumorResource.value()!.lab_code || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Classification</span><span class="detail-value">{{ tumorResource.value()!.classification || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Grade</span><span class="detail-value">{{ tumorResource.value()!.grade || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Organ</span><span class="detail-value">{{ tumorResource.value()!.organ || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">{{ tumorResource.value()!.status || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">TNM</span><span class="detail-value">{{ tumorResource.value()!.tnm || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Patient NHC</span><span class="detail-value">{{ tumorResource.value()!.patient_nhc }}</span></div>
            <div class="detail-item"><span class="detail-label">Registration Date</span><span class="detail-value">{{ tumorResource.value()!.registration_date || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">Operation Date</span><span class="detail-value">{{ tumorResource.value()!.operation_date || '—' }}</span></div>
            <div class="detail-item"><span class="detail-label">AP Observation</span><span class="detail-value">{{ tumorResource.value()!.ap_observation || '—' }}</span></div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="detail-tabs" animationDuration="200ms">
        <mat-tab label="Biomodels">
          <div class="tab-content">
            @if (biomodelsResource.isLoading()) {
              <app-loading-state status="loading" />
            } @else if (biomodelsResource.error()) {
              <app-loading-state status="error" errorMessage="Failed to load biomodels" (retry)="biomodelsResource.reload()" />
            } @else if (filteredBiomodels().length === 0) {
              <app-loading-state status="empty" emptyIcon="science" emptyTitle="No biomodels" emptyMessage="No biomodels linked to this tumor." />
            } @else {
              <app-data-table [columns]="biomodelColumns" [data]="filteredBiomodels()" (rowClicked)="onBiomodelClick($event)" />
            }
          </div>
        </mat-tab>
        <mat-tab label="Liquid Biopsies">
          <div class="tab-content">
            @if (liquidBiopsiesResource.isLoading()) {
              <app-loading-state status="loading" />
            } @else if (liquidBiopsiesResource.error()) {
              <app-loading-state status="error" errorMessage="Failed to load liquid biopsies" (retry)="liquidBiopsiesResource.reload()" />
            } @else if (filteredLiquidBiopsies().length === 0) {
              <app-loading-state status="empty" emptyIcon="water_drop" emptyTitle="No liquid biopsies" emptyMessage="No liquid biopsies linked to this tumor." />
            } @else {
              <app-data-table [columns]="lbColumns" [data]="filteredLiquidBiopsies()" />
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
export class TumorDetailPage {
  biobank_code = input.required<string>();

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private tumorService = inject(TumorService);
  private notification = inject(NotificationService);
  private apiUrl = inject(API_URL);

  breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Tumors', route: '/tumors' },
    { label: this.biobank_code() },
  ]);

  tumorResource = httpResource<Tumor>(() => `${this.apiUrl}/tumors/${this.biobank_code()}`);
  biomodelsResource = httpResource<Biomodel[]>(() => `${this.apiUrl}/biomodels`, { defaultValue: [] });
  liquidBiopsiesResource = httpResource<LiquidBiopsy[]>(() => `${this.apiUrl}/liquid-biopsies`, { defaultValue: [] });

  filteredBiomodels = computed(() =>
    this.biomodelsResource.value()?.filter((b) => b.tumor_biobank_code === this.biobank_code()) ?? [],
  );

  filteredLiquidBiopsies = computed(() =>
    this.liquidBiopsiesResource.value()?.filter((lb) => lb.tumor_biobank_code === this.biobank_code()) ?? [],
  );

  biomodelColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'viability', label: 'Viability', sortable: true, type: 'number' },
    { key: 'creation_date', label: 'Created', sortable: true, type: 'date' },
  ];

  lbColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'has_serum', label: 'Serum', type: 'boolean' },
    { key: 'has_buffy', label: 'Buffy Coat', type: 'boolean' },
    { key: 'has_plasma', label: 'Plasma', type: 'boolean' },
    { key: 'biopsy_date', label: 'Date', sortable: true, type: 'date' },
  ];

  onBiomodelClick(biomodel: Biomodel): void {
    this.router.navigate(['/biomodels', biomodel.id]);
  }

  openEditDialog(): void {
    const tumor = this.tumorResource.value();
    if (!tumor) return;
    const dialogRef = this.dialog.open(TumorFormComponent, { width: '600px', data: { mode: 'edit', tumor } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.tumorService.update(tumor.biobank_code, result).subscribe({
          next: () => { this.notification.success('Tumor updated'); this.tumorResource.reload(); },
          error: () => { this.notification.error('Failed to update tumor'); },
        });
      }
    });
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Tumor', message: `Delete tumor ${this.biobank_code()}? This cannot be undone.`, confirmLabel: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.tumorService.delete(this.biobank_code()).subscribe({
          next: () => { this.notification.success('Tumor deleted'); this.router.navigate(['/tumors']); },
          error: () => this.notification.error('Failed to delete tumor'),
        });
      }
    });
  }
}
