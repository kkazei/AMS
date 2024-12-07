import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.css'
})
export class ArchiveComponent {
  userProfile: any; // Holds user profile information
  paymentDetails: any = null; // Payment details list
  archivedMaintenance: any[] = []; // Holds archived maintenance tasks
  selectedInvoices: Set<number> = new Set<number>(); // Holds selected invoice IDs
  selectedMaintenance: Set<number> = new Set<number>(); // Holds selected maintenance IDs

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('User profile loaded:', this.userProfile);
      this.loadArchivedPaymentDetails();
      this.getArchivedMaintenance(); // Load archived maintenance tasks
    } else {
      console.warn('No token found. User is not logged in.');
    }
  }

  // Load payment details
  loadArchivedPaymentDetails(): void {
    this.authService.getArchivedPayments().subscribe(
      (response: any[]) => {
        console.log('Payment details fetched:', response);
        this.paymentDetails = response.map(payment => ({
          ...payment,
          proof_of_payment: `http://localhost/amsAPI/api/${payment.proof_of_payment}`
        }));
      },
      (error) => {
        console.error('Error fetching payment details:', error);
      }
    );
  }

  restorePaymentVisibility(invoiceId: number): void {
    this.authService.restorePaymentVisibility(invoiceId)
      .then((response) => {
        console.log('Payment visibility restored:', response);
        Swal.fire({
          icon: 'success',
          title: 'Payment Restored',
          text: 'The payment visibility has been restored successfully.',
        }).then(() => {
          this.loadArchivedPaymentDetails(); // Refresh the list of archived payments
        });
      })
      .catch((error) => {
        console.error('Error restoring payment visibility:', error);
        Swal.fire({
          icon: 'error',
          title: 'Restore Failed',
          text: 'Failed to restore the payment visibility. Please try again later.',
        });
      });
  }

  restoreMaintenanceVisibility(maintenanceId: number): void {
    this.authService.restoreMaintenance(maintenanceId)
      .then((response) => {
        console.log('Maintenance visibility restored:', response);
        Swal.fire({
          icon: 'success',
          title: 'Maintenance Restored',
          text: 'The maintenance task has been restored successfully.',
        }).then(() => {
          this.getArchivedMaintenance(); // Refresh the list of archived maintenance tasks
        });
      })
      .catch((error) => {
        console.error('Error restoring maintenance visibility:', error);
        Swal.fire({
          icon: 'error',
          title: 'Restore Failed',
          text: 'Failed to restore the maintenance task. Please try again later.',
        });
      });
  }

  getArchivedMaintenance(): void {
    this.authService.getArchivedMaintenance().subscribe(
      (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          console.log('Archived maintenance tasks fetched:', response.data);
          this.archivedMaintenance = response.data; // Assign only the data array
        } else {
          console.warn('Unexpected response format for archived maintenance tasks:', response);
          this.archivedMaintenance = []; // Fallback to an empty array
        }
      },
      (error) => {
        console.error('Error fetching archived maintenance tasks:', error);
        this.archivedMaintenance = []; // Handle error case by clearing the list
      }
    );
  }

  toggleInvoiceSelection(invoiceId: number): void {
    if (this.selectedInvoices.has(invoiceId)) {
      this.selectedInvoices.delete(invoiceId);
    } else {
      this.selectedInvoices.add(invoiceId);
    }
  }

  selectAllInvoices(): void {
    if (this.paymentDetails) {
      this.paymentDetails.forEach((payment: any) => this.selectedInvoices.add(payment.invoice_id));
    }
  }

  deleteSelectedInvoices(): void {
    const invoiceIds = Array.from(this.selectedInvoices);
    invoiceIds.forEach(invoiceId => {
      this.authService.deleteInvoice(invoiceId).subscribe(
        (response) => {
          console.log('Invoice deleted:', response);
          this.selectedInvoices.delete(invoiceId);
          this.loadArchivedPaymentDetails(); // Refresh the list of archived payments
        },
        (error) => {
          console.error('Error deleting invoice:', error);
        }
      );
    });
  }
  toggleMaintenanceSelection(maintenanceId: number): void {
    if (this.selectedMaintenance.has(maintenanceId)) {
      this.selectedMaintenance.delete(maintenanceId);
    } else {
      this.selectedMaintenance.add(maintenanceId);
    }
  }

  selectAllMaintenance(): void {
    if (this.archivedMaintenance) {
      this.archivedMaintenance.forEach((maintenance: any) => this.selectedMaintenance.add(maintenance.maintenance_id));
    }
  }

  deleteSelectedMaintenance(): void {
    const maintenanceIds = Array.from(this.selectedMaintenance);
    maintenanceIds.forEach(maintenanceId => {
      this.authService.deleteMaintenance(maintenanceId).subscribe(
        (response) => {
          console.log('Maintenance task deleted:', response);
          this.selectedMaintenance.delete(maintenanceId);
          this.getArchivedMaintenance(); // Refresh the list of archived maintenance tasks
        },
        (error) => {
          console.error('Error deleting maintenance task:', error);
        }
      );
    });
  }
}
