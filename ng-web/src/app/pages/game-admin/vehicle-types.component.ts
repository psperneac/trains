import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehicleTypesFacade } from '../../store/vehicle-type';

@Component({
  selector: 'app-vehicle-types',
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
          <mat-card-title>Vehicle Types</mat-card-title>
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
            <table mat-table [dataSource]="(vehicleTypes$ | async) ?? []" class="vehicle-types-table">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let vt">{{ vt.type }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let vt">{{ vt.name }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let vt">{{ vt.description }}</td>
              </ng-container>

              <ng-container matColumnDef="content">
                <th mat-header-cell *matHeaderCellDef>Content</th>
                <td mat-cell *matCellDef="let vt">
                  <pre class="content-pre">{{ vt.content | json }}</pre>
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

    .vehicle-types-table {
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
export class VehicleTypesComponent {
  private vehicleTypesFacade = inject(VehicleTypesFacade);

  vehicleTypes$ = this.vehicleTypesFacade.allVehicleTypes$;
  loading$ = this.vehicleTypesFacade.loading$;
  error$ = this.vehicleTypesFacade.error$;

  displayedColumns = ['type', 'name', 'description', 'content'];

  constructor() {
    this.vehicleTypesFacade.loadAllVehicleTypes();
  }
}