import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RoomType {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  area: number;
  bedType: string;
  facilities: string;
  imageUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  floor: number;
  roomType?: RoomType | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: number;
  name: string;
  idCard: string;
  phone: string;
  email: string;
  address: string;
  birthday: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: number;
  reservationNo: string;
  guest?: Guest | null;
  room?: Room | null;
  checkInDate: string;
  checkOutDate: string;
  days: number;
  roomPrice: number;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  contactPerson?: string | null;
  contactPhone?: string | null;
  specialRequest?: string | null;
  remark?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Order {
  id: number;
  orderNo: string;
  reservation: Reservation;
  guest: Guest;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: string;
  paidAt: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  paymentNo: string;
  order: Order;
  amount: number;
  paymentMethod: 'ALIPAY' | 'WECHAT' | 'CREDIT_CARD' | 'CASH' | 'BANK_TRANSFER';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  transactionId: string;
  remark: string;
  createdAt: string;
  completedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getRoomTypes(): Observable<ApiResponse<RoomType[]>> {
    return this.http.get<ApiResponse<RoomType[]>>(`${this.baseUrl}/room-types`);
  }

  getActiveRoomTypes(): Observable<ApiResponse<RoomType[]>> {
    return this.http.get<ApiResponse<RoomType[]>>(`${this.baseUrl}/room-types/active`);
  }

  getRoomTypeById(id: number): Observable<ApiResponse<RoomType>> {
    return this.http.get<ApiResponse<RoomType>>(`${this.baseUrl}/room-types/${id}`);
  }

  createRoomType(roomType: Partial<RoomType>): Observable<ApiResponse<RoomType>> {
    return this.http.post<ApiResponse<RoomType>>(`${this.baseUrl}/room-types`, roomType);
  }

  updateRoomType(id: number, roomType: Partial<RoomType>): Observable<ApiResponse<RoomType>> {
    return this.http.put<ApiResponse<RoomType>>(`${this.baseUrl}/room-types/${id}`, roomType);
  }

  deleteRoomType(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/room-types/${id}`);
  }

  getRooms(): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.baseUrl}/rooms`);
  }

  getRoomById(id: number): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`${this.baseUrl}/rooms/${id}`);
  }

  getRoomsByStatus(status: string): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.baseUrl}/rooms/status/${status}`);
  }

  getAvailableRooms(checkInDate: string, checkOutDate: string): Observable<ApiResponse<Room[]>> {
    const params = new HttpParams()
      .set('checkInDate', checkInDate)
      .set('checkOutDate', checkOutDate);
    return this.http.get<ApiResponse<Room[]>>(`${this.baseUrl}/rooms/available`, { params });
  }

  createRoom(room: Partial<Room>): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(`${this.baseUrl}/rooms`, room);
  }

  updateRoom(id: number, room: Partial<Room>): Observable<ApiResponse<Room>> {
    return this.http.put<ApiResponse<Room>>(`${this.baseUrl}/rooms/${id}`, room);
  }

  updateRoomStatus(id: number, status: string): Observable<ApiResponse<Room>> {
    const params = new HttpParams().set('status', status);
    return this.http.put<ApiResponse<Room>>(`${this.baseUrl}/rooms/${id}/status`, null, { params });
  }

  getReservations(): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.baseUrl}/reservations`);
  }

  getReservationById(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.get<ApiResponse<Reservation>>(`${this.baseUrl}/reservations/${id}`);
  }

  getReservationsByStatus(status: string): Observable<ApiResponse<Reservation[]>> {
    return this.http.get<ApiResponse<Reservation[]>>(`${this.baseUrl}/reservations/status/${status}`);
  }

  createReservation(data: {
    roomId: number;
    guestName: string;
    guestIdCard: string;
    guestPhone?: string;
    guestEmail?: string;
    checkInDate: string;
    checkOutDate: string;
    contactPerson?: string;
    contactPhone?: string;
    specialRequest?: string;
  }): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.baseUrl}/reservations`, data);
  }

  confirmReservation(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.baseUrl}/reservations/${id}/confirm`, {});
  }

  checkIn(reservationId: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.baseUrl}/reservations/check-in`, { reservationId });
  }

  checkOut(reservationId: number, extraCharge?: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.baseUrl}/reservations/check-out`, { 
      reservationId, 
      extraCharge 
    });
  }

  cancelReservation(id: number): Observable<ApiResponse<Reservation>> {
    return this.http.post<ApiResponse<Reservation>>(`${this.baseUrl}/reservations/${id}/cancel`, {});
  }

  getOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/orders`);
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`);
  }

  simulatePayment(data: { orderId: number; amount: number; paymentMethod: string; remark?: string }): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(`${this.baseUrl}/payments/pay`, data);
  }
}
