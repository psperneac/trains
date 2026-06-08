import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PlaceTypesFacade } from '../../store/place-type';

@Component({
  selector: 'app-place-types',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Place Types</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading$ | async) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <span>Loading...</span>
            </div>
          }

          @if (error$ | async; as error) {
            <div class="error-message">
              {{ error }}
            </div>
          }

          @if (!(loading$ | async) && !(error$ | async)) {
            <table mat-table [dataSource]="(placeTypes$ | async) ?? []" class="place-types-table">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let pt">{{ pt.type }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let pt">{{ pt.name }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let pt">{{ pt.description }}</td>
              </ng-container>

              <ng-container matColumnDef="content">
                <th mat-header-cell *matHeaderCellDef>Content</th>
                <td mat-cell *matCellDef="let pt">
                  <pre class="content-pre">{{ pt.content | json }}</pre>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 40px;
    }

    .error-message {
      background-color: #fee;
      border: 1px solid #fcc;
      padding: 15px;
      border-radius: 4px;
      color: #c33;
    }

    .place-types-table {
      width: 100%;
    }

    .content-pre {
      background-color: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      max-width: 300px;
      overflow-x: auto;
      margin: 0;
    }

    th.mat-header-cell {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
    }

    td.mat-cell {
      vertical-align: top;
    }
  `]
})
export class PlaceTypesComponent implements OnInit {
  private placeTypesFacade = inject(PlaceTypesFacade);

  placeTypes$ = this.placeTypesFacade.allPlaceTypes$;
  loading$ = this.placeTypesFacade.loading$;
  error$ = this.placeTypesFacade.error$;

  displayedColumns = ['type', 'name', 'description', 'content'];

  ngOnInit(): void {
  }
}