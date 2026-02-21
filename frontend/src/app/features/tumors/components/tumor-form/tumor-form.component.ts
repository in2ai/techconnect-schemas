import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Tumor } from '../../models/tumor.model';

export interface TumorFormData {
  mode: 'create' | 'edit';
  tumor?: Tumor;
}

@Component({
  selector: 'app-tumor-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, FormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Tumor' : 'Edit Tumor' }}</h2>
    <mat-dialog-content>
      <form class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Biobank Code</mat-label>
          <input matInput [(ngModel)]="model.biobank_code" name="biobank_code" required [readonly]="data.mode === 'edit'" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Patient NHC</mat-label>
          <input matInput [(ngModel)]="model.patient_nhc" name="patient_nhc" required />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Lab Code</mat-label>
          <input matInput [(ngModel)]="model.lab_code" name="lab_code" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Classification</mat-label>
          <input matInput [(ngModel)]="model.classification" name="classification" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Grade</mat-label>
          <input matInput [(ngModel)]="model.grade" name="grade" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Organ</mat-label>
          <input matInput [(ngModel)]="model.organ" name="organ" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <input matInput [(ngModel)]="model.status" name="status" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>TNM</mat-label>
          <input matInput [(ngModel)]="model.tnm" name="tnm" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>AP Observation</mat-label>
          <textarea matInput [(ngModel)]="model.ap_observation" name="ap_observation" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Registration Date</mat-label>
          <input matInput [(ngModel)]="model.registration_date" name="registration_date" type="date" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Operation Date</mat-label>
          <input matInput [(ngModel)]="model.operation_date" name="operation_date" type="date" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [mat-dialog-close]="model" [disabled]="!model.biobank_code.trim() || !model.patient_nhc.trim()">
        {{ data.mode === 'create' ? 'Create' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      min-width: 400px;
    }
    .form-grid mat-form-field:first-child,
    .form-grid mat-form-field:nth-child(9) {
      grid-column: 1 / -1;
    }
  `,
})
export class TumorFormComponent {
  data = inject<TumorFormData>(MAT_DIALOG_DATA);

  model: Tumor = this.data.tumor
    ? { ...this.data.tumor }
    : {
        biobank_code: '', lab_code: null, classification: null, ap_observation: null,
        grade: null, organ: null, status: null, tnm: null,
        registration_date: null, operation_date: null, patient_nhc: '',
      };
}
