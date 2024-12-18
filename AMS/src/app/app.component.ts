import { Component, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './sidenav/sidenav.component';
import { TopnavComponent } from './topnav/topnav.component';
import { TenantTopnavComponent } from './tenant-topnav/tenant-topnav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterOutlet,
    CommonModule,
    SidenavComponent,
    TopnavComponent,
    TenantTopnavComponent
  ],
})
export class AppComponent {
  title = 'UnitPay';
  innerWidth: number;

  constructor(private router: Router) {
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  // Function to check if the sidebar should be shown based on current route
  shouldShowNav() {
    const hiddenRoutes = [
      '/login', 
      '/register', 
      '/tenant-login', 
      '/tenant-register', 
      '/tenant-dashboard',
    ];
    // Exclude routes with dynamic IDs like /view-announcement/:id
    return !hiddenRoutes.includes(this.router.url) && !this.router.url.startsWith('/view-announcement/');
  }

  // Function to check if the tenant topnav should be shown based on current route
shouldShowTenantNav() {
  const tenantRoutes = [
    '/tenant-dashboard',
    '/view-announcement'  // This includes both /view-announcement and /view-announcement/:id
  ];
  
  // Check if the current route starts with any of the tenant-related routes
  return tenantRoutes.some(route => this.router.url.startsWith(route));
}


  // Function to check if the screen size is mobile
  isMobile() {
    return this.innerWidth <= 768; // Adjust the width as per your requirement
  }
}