import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../../../core/tokens/api-url.token';
import { NotificationService } from '../../../../core/services/notification.service';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { Tumor } from '../../../tumors/models/tumor.model';
import { TumorService } from '../../../tumors/services/tumor.service';
import { PageHeaderComponent, Breadcrumb } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { PatientFormComponent } from '../../components/patient-form/patient-form.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    PageHeaderComponent,
    DataTableComponent,
    LoadingStateComponent,
  ],
  template: `
    <app-page-header
      [title]="'Patient ' + nhc()"
      [breadcrumbs]="breadcrumbs()"
    >
      <button mat-stroked-button (click)="openEditDialog()">
        <mat-icon>edit</mat-icon>
        Edit
      </button>
      <button mat-stroked-button color="warn" (click)="confirmDelete()">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </app-page-header>

    @if (patientResource.isLoading()) {
      <app-loading-state status="loading" />
    } @else if (patientResource.error()) {
      <app-loading-state status="error" errorMessage="Failed to load patient" (retry)="patientResource.reload()" />
    } @else if (patientResource.hasValue()) {
      <mat-card appearance="outlined" class="detail-card">
        <mat-card-content>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">NHC</span>
              <span class="detail-value">{{ patientResource.value()!.nhc }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sex</span>
              <span class="detail-value">{{ patientResource.value()!.sex || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Birth Date</span>
              <span class="detail-value">{{ patientResource.value()!.birth_date || '—' }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-tab-group class="detail-tabs" animationDuration="200ms">
        <mat-tab label="Tumors">
          <div class="tab-content">
            @if (tumorsResource.isLoading()) {
              <app-loading-state status="loading" />
            } @else if (tumorsResource.error()) {
              <app-loading-state
                status="error"
                errorMessage="Failed to load tumors"
                (retry)="tumorsResource.reload()"
              />
            } @else if (tumorsResource.hasValue() && filteredTumors().length === 0) {
              <app-loading-state
                status="empty"
                emptyIcon="coronavirus"
                emptyTitle="No tumors"
                emptyMessage="No tumor samples linked to this patient."
              />
            } @else if (tumorsResource.hasValue()) {
              <app-data-table
                [columns]="tumorColumns"
                [data]="filteredTumors()"
                (rowClicked)="onTumorClick($event)"
              />
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    .detail-card {
      margin-bottom: 1.5rem;
      border-radius: 12px !important;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface);
    }

    .detail-tabs {
      margin-top: 1rem;
    }

    .tab-content {
      padding: 1.5rem 0;
    }
  `,
})
export class PatientDetailPage {
  nhc = input.required<string>();

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private patientService = inject(PatientService);
  private tumorService = inject(TumorService);
  private notification = inject(NotificationService);
  private apiUrl = inject(API_URL);

  breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: 'Patients', route: '/patients' },
    { label: this.nhc() },
  ]);

  patientResource = httpResource<Patient>(() => `${this.apiUrl}/patients/${this.nhc()}`);

  tumorsResource = httpResource<Tumor[]>(() => `${this.apiUrl}/tumors`, {
    defaultValue: [],
  });

  filteredTumors = computed(() =>
    this.tumorsResource.value()?.filter((t) => t.patient_nhc === this.nhc()) ?? [],
  );

  tumorColumns: ColumnDef[] = [
    { key: 'biobank_code', label: 'Biobank Code', sortable: true },
    { key: 'lab_code', label: 'Lab Code', sortable: true },
    { key: 'classification', label: 'Classification', sortable: true },
    { key: 'organ', label: 'Organ', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'registration_date', label: 'Registration', sortable: true, type: 'date' },
  ];

  onTumorClick(tumor: Tumor): void {
    this.router.navigate(['/tumors', tumor.biobank_code]);
  }

  openEditDialog(): void {
    const patient = this.patientResource.value();
    if (!patient) return;
    const dialogRef = this.dialog.open(PatientFormComponent, {
      width: '500px',
      data: { mode: 'edit', patient },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.patientService.update(patient.nhc, result).subscribe({
          next: () => {
            this.notification.success('Patient updated successfully');
            this.patientResource.reload();
          },
          error: () => {
            this.notification.error('Failed to update patient');
          },
        });
      }
    });
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Patient',
        message: `Are you sure you want to delete patient ${this.nhc()}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'warn',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.patientService.delete(this.nhc()).subscribe({
          next: () => {
            this.notification.success('Patient deleted');
            this.router.navigate(['/patients']);
          },
          error: () => {
            this.notification.error('Failed to delete patient');
          },
        });
      }
    });
  }
}
