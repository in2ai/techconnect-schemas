import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  viewChild,
  effect,
} from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'boolean' | 'number';
}

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="table-toolbar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          placeholder="Search..."
          [value]="filterValue()"
          (input)="applyFilter($any($event.target).value)"
          aria-label="Search table"
        />
      </mat-form-field>
    </div>

    <div class="table-container">
      <table mat-table [dataSource]="dataSource()" matSort class="data-table">
        @for (col of columns(); track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef [mat-sort-header]="col.key" [disabled]="col.sortable === false">
              {{ col.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              @switch (col.type) {
                @case ('boolean') {
                  @if (row[col.key] === true) {
                    <mat-icon class="bool-icon yes">check_circle</mat-icon>
                  } @else if (row[col.key] === false) {
                    <mat-icon class="bool-icon no">cancel</mat-icon>
                  } @else {
                    <span class="null-value">—</span>
                  }
                }
                @case ('date') {
                  {{ row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '—' }}
                }
                @case ('number') {
                  {{ row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '—' }}
                }
                @default {
                  {{ row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '—' }}
                }
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="columnKeys()"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: columnKeys()"
          class="clickable-row"
          [class.selected]="row === selectedRow()"
          (click)="onRowClick(row)"
          (keydown.enter)="onRowClick(row)"
          (keydown.space)="onRowClick(row); $event.preventDefault()"
          tabindex="0"
          role="button"
        ></tr>
      </table>
    </div>

    <mat-paginator
      [pageSize]="pageSize()"
      [pageSizeOptions]="[10, 25, 50, 100]"
      showFirstLastButtons
      aria-label="Select page"
    ></mat-paginator>
  `,
  styles: `
    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--mat-sys-outline-variant);
    }

    .data-table {
      width: 100%;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--mat-sys-surface-variant);
      }

      &:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: -2px;
      }

      &.selected {
        background-color: var(--mat-sys-secondary-container);
      }
    }

    .bool-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;

      &.yes { color: var(--mat-sys-primary); }
      &.no { color: var(--mat-sys-outline); }
    }

    .null-value {
      color: var(--mat-sys-outline);
    }

    mat-paginator {
      border-top: 1px solid var(--mat-sys-outline-variant);
    }
  `,
})
export class DataTableComponent<T> {
  columns = input.required<ColumnDef[]>();
  data = input.required<T[]>();
  pageSize = input(25);

  rowClicked = output<T>();

  filterValue = signal('');
  selectedRow = signal<T | null>(null);

  columnKeys = computed(() => this.columns().map((c) => c.key));

  private sort = viewChild(MatSort);
  private paginator = viewChild(MatPaginator);

  dataSource = computed(() => {
    const ds = new MatTableDataSource<T>(this.data());
    const sort = this.sort();
    const paginator = this.paginator();
    if (sort) ds.sort = sort;
    if (paginator) ds.paginator = paginator;
    ds.filter = this.filterValue().trim().toLowerCase();
    return ds;
  });

  constructor() {
    effect(() => {
      const sort = this.sort();
      const paginator = this.paginator();
      const ds = this.dataSource();
      if (sort) ds.sort = sort;
      if (paginator) ds.paginator = paginator;
    });
  }

  applyFilter(value: string): void {
    this.filterValue.set(value);
  }

  onRowClick(row: T): void {
    this.selectedRow.set(row);
    this.rowClicked.emit(row);
  }
}
