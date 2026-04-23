import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RoomTypeListComponent } from './components/room-type/room-type-list/room-type-list.component';
import { RoomListComponent } from './components/room/room-list/room-list.component';
import { RoomStatusComponent } from './components/room/room-status/room-status.component';
import { ReservationListComponent } from './components/reservation/reservation-list/reservation-list.component';
import { ReservationCreateComponent } from './components/reservation/reservation-create/reservation-create.component';
import { OrderListComponent } from './components/order/order-list/order-list.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RoomTypeListComponent,
    RoomListComponent,
    RoomStatusComponent,
    ReservationListComponent,
    ReservationCreateComponent,
    OrderListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
