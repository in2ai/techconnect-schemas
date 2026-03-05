import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../../../core/tokens/api-url.token';
import { Biomodel } from '../../models/biomodel.model';

interface Tumor {
  biobank_code: string;
  classification: string | null;
}

export interface BiomodelFormData {
  mode: 'create' | 'edit';
  biomodel?: Biomodel;
}

@Component({
  selector: 'app-biomodel-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Biomodel' : 'Edit Biomodel' }}</h2>
    <mat-dialog-content>
      <form class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Tumor</mat-label>
          @if (tumorsResource.isLoading()) {
            <mat-select disabled>
              <mat-option>Loading…</mat-option>
            </mat-select>
          } @else {
            <mat-select [(ngModel)]="model.tumor_biobank_code" name="tumor_biobank_code" required>
              @for (tumor of tumorsResource.value(); track tumor.biobank_code) {
                <mat-option [value]="tumor.biobank_code">{{ tumor.biobank_code }}</mat-option>
              }
            </mat-select>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <input matInput [(ngModel)]="model.type" name="type" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <input matInput [(ngModel)]="model.status" name="status" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Viability</mat-label>
          <input
            matInput
            [(ngModel)]="model.viability"
            name="viability"
            type="number"
            step="0.01"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Creation Date</mat-label>
          <input matInput [(ngModel)]="model.creation_date" name="creation_date" type="date" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="model.description" name="description" rows="2"></textarea>
        </mat-form-field>
        <mat-checkbox [(ngModel)]="model.progresses" name="progresses">Progresses</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [mat-dialog-close]="model" [disabled]="!model.tumor_biobank_code">
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
    .full-width {
      grid-column: 1 / -1;
    }
  `,
})
export class BiomodelFormComponent {
  private readonly apiUrl = inject(API_URL);
  data = inject<BiomodelFormData>(MAT_DIALOG_DATA);

  tumorsResource = httpResource<Tumor[]>(() => `${this.apiUrl}/tumors`, { defaultValue: [] });

  model: Biomodel = this.data.biomodel
    ? { ...this.data.biomodel }
    : {
        id: '',
        type: null,
        description: null,
        creation_date: null,
        status: null,
        progresses: null,
        viability: null,
        tumor_biobank_code: '',
        parent_trial_id: null,
      };
}
