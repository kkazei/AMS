import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LandlordDashboardComponent } from './landlord-dashboard/landlord-dashboard.component';
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';
import { RegisterComponent } from './register/register.component';
import { TenantLoginComponent } from './tenant-login/tenant-login.component';
import { TenantRegisterComponent } from './tenant-register/tenant-register.component';
import { LandlordConcernsComponent } from './landlord-concerns/landlord-concerns.component';
import { LeaseManagementComponent } from './lease-management/lease-management.component';
import { InvoicesListComponent } from './invoices-list/invoices-list.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { AuthGuard } from './auth.guard';



export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'landlord-dashboard', component: LandlordDashboardComponent, canActivate: [AuthGuard] },
  { path: 'tenant-dashboard', component: TenantDashboardComponent, canActivate: [AuthGuard] },
  {path: 'register', component: RegisterComponent},
  {path: 'tenant-login', component: TenantLoginComponent},
  {path: 'tenant-register', component: TenantRegisterComponent},
  { path: 'landlord-concerns', component: LandlordConcernsComponent, canActivate: [AuthGuard]},
  {path: 'lease-management', component: LeaseManagementComponent, canActivate: [AuthGuard]},
  {path: 'invoices-list', component: InvoicesListComponent, canActivate: [AuthGuard]},
  {path: 'maintenance', component: MaintenanceComponent, canActivate: [AuthGuard]},
 


 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
