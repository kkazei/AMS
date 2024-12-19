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
import { LandlordTestComponent } from './landlord-test/landlord-test.component';
import { ArchiveComponent } from './archive/archive.component';
import { TenantsProfileComponent } from './tenants-profile/tenants-profile.component';
import { LandlordAnnouncementsComponent } from './landlord-announcements/landlord-announcements.component';
import { ViewAnnouncementComponent } from './view-announcement/view-announcement.component';
import { ViewConcernComponent } from './view-concern/view-concern.component';
import { ViewPostAnnouncementComponent } from './view-post-announcement/view-post-announcement.component';
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
  {path: 'archive', component: ArchiveComponent, canActivate: [AuthGuard]},
  {path: 'tenants-profile', component: TenantsProfileComponent, canActivate: [AuthGuard]},
  {path: 'landlord-announcements', component: LandlordAnnouncementsComponent, canActivate: [AuthGuard]},
  {path: 'view-announcement/:id', component: ViewAnnouncementComponent, canActivate: [AuthGuard]},
  {path: 'view-concern/:id', component: ViewConcernComponent, canActivate: [AuthGuard]},
  {path: 'view-post-announcement/:id', component: ViewPostAnnouncementComponent, canActivate: [AuthGuard]},
  {path: 'landlord-test', component: LandlordTestComponent}
 


 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
