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
import { Sample } from '../../models/sample.model';

interface Tumor {
  biobank_code: string;
}

export interface SampleFormData {
  mode: 'create' | 'edit';
  biopsy?: Sample;
}

@Component({
  selector: 'app-sample-form',
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
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Sample' : 'Edit Sample' }}</h2>
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
          <mat-label>Biopsy Date</mat-label>
          <input matInput [(ngModel)]="model.biopsy_date" name="biopsy_date" type="date" />
        </mat-form-field>
        <div class="checkbox-group">
          <mat-checkbox [(ngModel)]="model.has_serum" name="has_serum">Has Serum</mat-checkbox>
          <mat-checkbox [(ngModel)]="model.has_buffy" name="has_buffy">Has Buffy Coat</mat-checkbox>
          <mat-checkbox [(ngModel)]="model.has_plasma" name="has_plasma">Has Plasma</mat-checkbox>
        </div>
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
      min-width: 360px;
    }
    .checkbox-group {
      grid-column: 1 / -1;
      display: flex;
      gap: 1.5rem;
      padding: 0.5rem 0;
    }
  `,
})
export class SampleFormComponent {
  private readonly apiUrl = inject(API_URL);
  data = inject<SampleFormData>(MAT_DIALOG_DATA);

  tumorsResource = httpResource<Tumor[]>(() => `${this.apiUrl}/tumors`, { defaultValue: [] });

  model: Sample = this.data.biopsy
    ? { ...this.data.biopsy }
    : {
        id: '',
        has_serum: null,
        has_buffy: null,
        has_plasma: null,
        biopsy_date: null,
        tumor_biobank_code: '',
      };
}
