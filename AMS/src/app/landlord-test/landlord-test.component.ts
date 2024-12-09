import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-landlord-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landlord-test.component.html',
  styleUrl: './landlord-test.component.css'
})
export class LandlordTestComponent implements OnInit {
  userProfile: any;
  tenants: any[] = [];
  selectedApartmentId: number | null = null;
  selectedTenantId: number | null = null;
  isCollapsed = false;
  TotalIncome = 0;
  apartments: any[] = [];
  message: string = '';

  title: string = '';
  content: string = '';
  room: string = '';
  rent: number = 0;
  description: string = '';

  posts: any[] = [];

  selectedFile: File | null = null; // Add this line
  payments: any[] = []; // Payments array

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      this.userProfile = this.authService.getUserProfileFromToken();
      console.log('Token:', token);
      console.log('User profile:', this.userProfile);
      this.loadPayments();
    }
  }

  loadPayments(): void {
    this.authService.getPaymentDetails().subscribe(
      (response: any[]) => {
        this.payments = response;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching payment details:', error);
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.importFromExcel();
    }
  }

  importFromExcel(): void {
    if (this.selectedFile) {
      this.authService.importPayments(this.selectedFile).subscribe(
        response => {
          console.log('Data successfully imported to the database:', response);
          this.loadPayments(); // Reload payments after successful import
        },
        error => {
          console.error('Error importing data to the database:', error);
        }
      );
    }
  }

  getTenants() {
    this.authService.getTenants().subscribe(
      (response) => {
        console.log('Tenants fetched:', response);
        // Directly assign response to tenants if it's an array
        if (Array.isArray(response)) {
          this.tenants = response;  // No need for a 'data' check here
        } else {
          console.error('Unexpected response format:', response);
          this.tenants = [];  // Reset to empty array in case of error
        }
        console.log('Tenants array:', this.tenants); // Log to verify
      },
      (error) => {
        console.error('Error fetching tenants:', error);
        this.tenants = [];  // Reset to empty array in case of error
      }
    );
  }

  getApartments() {
    this.authService.getApartments().subscribe(
      (response) => {
        console.log('Apartments fetched:', response);
        this.apartments = response;
      },
      (error) => {
        console.error('Error fetching apartments:', error);
      }
    );
  }
}