import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../../../core/tokens/api-url.token';
import { Trial } from '../../models/trial.model';

interface Passage {
  id: string;
  number: number | null;
  biomodel_id: string;
}

export interface TrialFormData {
  mode: 'create' | 'edit';
  trial?: Trial;
}

@Component({
  selector: 'app-trial-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule,
    SlicePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'New Trial' : 'Edit Trial' }}</h2>
    <mat-dialog-content>
      <form class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Passage</mat-label>
          @if (passagesResource.isLoading()) {
            <mat-select disabled>
              <mat-option>Loading…</mat-option>
            </mat-select>
          } @else {
            <mat-select [(ngModel)]="model.passage_id" name="passage_id" required>
              @for (passage of passagesResource.value(); track passage.id) {
                <mat-option [value]="passage.id">
                  {{ passage.id | slice: 0 : 8 }}… (P{{ passage.number ?? '?' }})
                </mat-option>
              }
            </mat-select>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Creation Date</mat-label>
          <input matInput [(ngModel)]="model.creation_date" name="creation_date" type="date" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Biobank Arrival Date</mat-label>
          <input
            matInput
            [(ngModel)]="model.biobank_arrival_date"
            name="biobank_arrival_date"
            type="date"
          />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="model.description" name="description" rows="3"></textarea>
        </mat-form-field>
        <div class="checkbox-group">
          <mat-checkbox [(ngModel)]="model.success" name="success">Success</mat-checkbox>
          <mat-checkbox [(ngModel)]="model.biobank_shipment" name="biobank_shipment"
            >Biobank Shipment</mat-checkbox
          >
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [mat-dialog-close]="model" [disabled]="!model.passage_id">
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
    .checkbox-group {
      grid-column: 1 / -1;
      display: flex;
      gap: 1.5rem;
      padding: 0.5rem 0;
    }
  `,
})
export class TrialFormComponent {
  private readonly apiUrl = inject(API_URL);
  data = inject<TrialFormData>(MAT_DIALOG_DATA);

  passagesResource = httpResource<Passage[]>(() => `${this.apiUrl}/passages`, { defaultValue: [] });

  model: Trial = this.data.trial
    ? { ...this.data.trial }
    : {
        id: '',
        success: null,
        description: null,
        status: null,
        preclinical_trials: null,
        creation_date: null,
        biobank_shipment: null,
        biobank_arrival_date: null,
        passage_id: '',
      };
}
