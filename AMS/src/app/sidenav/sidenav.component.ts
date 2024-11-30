import { Component } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  isCollapsed = false;

  toggleSidenav() {
    this.isCollapsed = !this.isCollapsed;
  }
}
