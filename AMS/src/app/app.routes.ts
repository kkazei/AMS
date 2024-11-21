import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LandlordDashboardComponent } from './landlord-dashboard/landlord-dashboard.component';
import { TenantManagementComponent } from './tenant-management/tenant-management.component';
import { LandlordApartmentComponent } from './landlord-apartment/landlord-apartment.component';
import { ComposeMailComponent } from './compose-mail/compose-mail.component';
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';
import { RegisterComponent } from './register/register.component';
import { TenantLoginComponent } from './tenant-login/tenant-login.component';
import { TenantRegisterComponent } from './tenant-register/tenant-register.component';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'landlord-dashboard', component: LandlordDashboardComponent },
  { path: 'tenant-management', component: TenantManagementComponent },
  { path: 'landlord-apartment', component: LandlordApartmentComponent },
  { path: 'compose-mail', component: ComposeMailComponent },
  { path: 'tenant-dashboard', component: TenantDashboardComponent },
  {path: 'register', component: RegisterComponent},
  {path: 'tenant-login', component: TenantLoginComponent},
  {path: 'tenant-register', component: TenantRegisterComponent},

 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
