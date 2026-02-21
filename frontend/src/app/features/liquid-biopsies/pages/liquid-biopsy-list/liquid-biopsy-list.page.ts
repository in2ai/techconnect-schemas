import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { httpResource } from '@angular/common/http';
import { filter, switchMap, tap, catchError, take, EMPTY } from 'rxjs';
import { API_URL } from '../../../../core/tokens/api-url.token';
import { NotificationService } from '../../../../core/services/notification.service';
import { LiquidBiopsyService } from '../../services/liquid-biopsy.service';
import { LiquidBiopsy } from '../../models/liquid-biopsy.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../../../shared/components/data-table/data-table.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { LiquidBiopsyFormComponent } from '../../components/liquid-biopsy-form/liquid-biopsy-form.component';

@Component({
  selector: 'app-liquid-biopsy-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent, LoadingStateComponent],
  template: `
    <app-page-header title="Liquid Biopsies" subtitle="Serum, buffy coat, and plasma samples from tumors">
      <button mat-flat-button (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        Add Liquid Biopsy
      </button>
    </app-page-header>

    @if (resource.isLoading()) {
      <app-loading-state status="loading" />
    } @else if (resource.error()) {
      <app-loading-state status="error" errorMessage="Failed to load liquid biopsies" (retry)="resource.reload()" />
    } @else if (resource.hasValue() && resource.value()!.length === 0) {
      <app-loading-state status="empty" emptyIcon="bloodtype" emptyTitle="No liquid biopsies yet" emptyMessage="Create your first liquid biopsy record." />
    } @else if (resource.hasValue()) {
      <app-data-table [columns]="columns" [data]="resource.value()!" (rowClicked)="onRowClick($event)" />
    }
  `,
})
export class LiquidBiopsyListPage {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private service = inject(LiquidBiopsyService);
  private notification = inject(NotificationService);
  private apiUrl = inject(API_URL);

  columns: ColumnDef[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'has_serum', label: 'Serum', type: 'boolean' },
    { key: 'has_buffy', label: 'Buffy Coat', type: 'boolean' },
    { key: 'has_plasma', label: 'Plasma', type: 'boolean' },
    { key: 'biopsy_date', label: 'Date', sortable: true, type: 'date' },
    { key: 'tumor_biobank_code', label: 'Tumor', sortable: true },
  ];

  resource = httpResource<LiquidBiopsy[]>(() => `${this.apiUrl}/liquid-biopsies`, { defaultValue: [] });

  onRowClick(biopsy: LiquidBiopsy): void {
    this.router.navigate(['/liquid-biopsies', biopsy.id]);
  }

  openCreateDialog(): void {
    this.dialog
      .open(LiquidBiopsyFormComponent, { width: '500px', data: { mode: 'create' } })
      .afterClosed()
      .pipe(
        take(1),
        filter((result): result is LiquidBiopsy => !!result),
        switchMap((result) => this.service.create(result)),
        tap(() => {
          this.notification.success('Liquid biopsy created');
          this.resource.reload();
        }),
        catchError(() => {
          this.notification.error('Failed to create liquid biopsy');
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
