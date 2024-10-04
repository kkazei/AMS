import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterOutlet,
    CommonModule,
  ],
})
export class AppComponent {
  title = 'blogSyt';

  constructor(private router: Router) {}

  shouldShowNav() {
    const hiddenRoutes = ['/login', '/registration'];
    return !hiddenRoutes.includes(this.router.url);
  }
}
