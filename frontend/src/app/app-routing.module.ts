import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RoomTypeListComponent } from './components/room-type/room-type-list/room-type-list.component';
import { RoomListComponent } from './components/room/room-list/room-list.component';
import { RoomStatusComponent } from './components/room/room-status/room-status.component';
import { ReservationListComponent } from './components/reservation/reservation-list/reservation-list.component';
import { ReservationCreateComponent } from './components/reservation/reservation-create/reservation-create.component';
import { OrderListComponent } from './components/order/order-list/order-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'room-types', component: RoomTypeListComponent },
  { path: 'rooms', component: RoomListComponent },
  { path: 'room-status', component: RoomStatusComponent },
  { path: 'reservations', component: ReservationListComponent },
  { path: 'reservations/create', component: ReservationCreateComponent },
  { path: 'orders', component: OrderListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
