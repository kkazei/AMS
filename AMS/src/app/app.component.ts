import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from "./sidenav/sidenav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // Note: should be `styleUrls` not `styleUrl`
  imports: [
    RouterOutlet,
    CommonModule,
    SidenavComponent
  ],
})
export class AppComponent {
  title = 'UnitPay';

  constructor(private router: Router) {}

  // Function to check if the sidebar should be shown based on current route
  shouldShowNav() {
    const hiddenRoutes = [
      '/login', 
      '/register', 
      '/tenant-login', 
      '/tenant-register', 
      '/tenant-dashboard'
    ];
    return !hiddenRoutes.includes(this.router.url);
  }
}
