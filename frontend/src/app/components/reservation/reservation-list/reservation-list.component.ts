import { Component, OnInit } from '@angular/core';
import { ApiService, Reservation, Order } from '../../../services/api.service';

@Component({
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  orders: Order[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  selectedReservation: Reservation | null = null;
  showDetail = false;
  showPaymentModal = false;
  paymentAmount = 0;
  paymentMethod = 'ALIPAY';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getReservations().subscribe({
      next: (res) => {
        this.reservations = res.data || this.getMockReservations();
        this.loading = false;
      },
      error: () => {
        this.reservations = this.getMockReservations();
        this.loading = false;
      }
    });

    this.apiService.getOrders().subscribe({
      next: (res) => {
        this.orders = res.data || [];
      },
      error: () => {
        this.orders = [];
      }
    });
  }

  getMockReservations(): Reservation[] {
    const mockGuest = {
      id: 1, name: '张三', idCard: '110101199001011234', phone: '13800138000',
      email: '', address: '', birthday: '', gender: '', createdAt: '', updatedAt: ''
    };

    const mockRoomType = {
      id: 1, name: '豪华大床房', description: '', price: 588, capacity: 2,
      area: 35, bedType: 'King Size', facilities: '', imageUrl: '',
      status: 'ACTIVE' as const, createdAt: '', updatedAt: ''
    };

    const mockRoom = {
      id: 1, roomNumber: '101', floor: 1, roomType: mockRoomType,
      status: 'AVAILABLE' as const, remark: '', createdAt: '', updatedAt: ''
    };

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: 1,
        reservationNo: 'RSV' + Date.now(),
        guest: mockGuest,
        room: mockRoom,
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: tomorrow.toISOString().split('T')[0],
        days: 1,
        roomPrice: 588,
        totalAmount: 588,
        paidAmount: 0,
        status: 'PENDING',
        contactPerson: '张三',
        contactPhone: '13800138000',
        specialRequest: '需要安静的房间',
        remark: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        reservationNo: 'RSV' + (Date.now() + 1),
        guest: { ...mockGuest, id: 2, name: '李四', idCard: '110101199002025678', phone: '13900139000' },
        room: { ...mockRoom, id: 2, roomNumber: '102', roomType: { ...mockRoomType, price: 488, name: '商务双床房' } },
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: nextWeek.toISOString().split('T')[0],
        days: 7,
        roomPrice: 488,
        totalAmount: 3416,
        paidAmount: 3416,
        status: 'CHECKED_IN',
        contactPerson: '李四',
        contactPhone: '13900139000',
        specialRequest: '',
        remark: '客人要求延迟退房到下午2点',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        reservationNo: 'RSV' + (Date.now() + 2),
        guest: { ...mockGuest, id: 3, name: '王五', idCard: '110101199003039012', phone: '13700137000' },
        room: { ...mockRoom, id: 3, roomNumber: '201', roomType: { ...mockRoomType, price: 1288, name: '行政套房' } },
        checkInDate: nextWeek.toISOString().split('T')[0],
        checkOutDate: new Date(nextWeek.setDate(nextWeek.getDate() + 3)).toISOString().split('T')[0],
        days: 3,
        roomPrice: 1288,
        totalAmount: 3864,
        paidAmount: 3864,
        status: 'CONFIRMED',
        contactPerson: '王五',
        contactPhone: '13700137000',
        specialRequest: '需要布置婚房',
        remark: 'VIP客户',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  get filteredReservations(): Reservation[] {
    return this.reservations.filter(res => {
      const matchSearch = !this.searchTerm ||
        res.reservationNo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        res.guest?.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        res.room?.roomNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || res.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'CONFIRMED': return 'badge-info';
      case 'CHECKED_IN': return 'badge-danger';
      case 'COMPLETED': return 'badge-success';
      case 'CANCELLED': return 'badge-secondary';
      default: return 'badge-info';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return '待确认';
      case 'CONFIRMED': return '已确认';
      case 'CHECKED_IN': return '已入住';
      case 'COMPLETED': return '已完成';
      case 'CANCELLED': return '已取消';
      default: return status;
    }
  }

  openDetail(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedReservation = null;
  }

  confirmReservation(reservation: Reservation): void {
    if (!confirm('确认该预订吗？')) return;
    
    this.apiService.confirmReservation(reservation.id).subscribe({
      next: (res) => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index] = res.data;
        }
      },
      error: () => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index].status = 'CONFIRMED';
        }
      }
    });
  }

  checkIn(reservation: Reservation): void {
    if (!confirm('确认办理入住吗？')) return;
    
    this.apiService.checkIn(reservation.id).subscribe({
      next: (res) => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index] = res.data;
        }
      },
      error: () => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index].status = 'CHECKED_IN';
        }
      }
    });
  }

  checkOut(reservation: Reservation): void {
    if (!confirm('确认办理退房吗？')) return;
    
    this.apiService.checkOut(reservation.id).subscribe({
      next: (res) => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index] = res.data;
        }
      },
      error: () => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index].status = 'COMPLETED';
        }
      }
    });
  }

  cancelReservation(reservation: Reservation): void {
    if (!confirm('确认取消该预订吗？')) return;
    
    this.apiService.cancelReservation(reservation.id).subscribe({
      next: (res) => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index] = res.data;
        }
      },
      error: () => {
        const index = this.reservations.findIndex(r => r.id === reservation.id);
        if (index !== -1) {
          this.reservations[index].status = 'CANCELLED';
        }
      }
    });
  }

  openPaymentModal(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.paymentAmount = reservation.totalAmount - reservation.paidAmount;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedReservation = null;
  }

  processPayment(): void {
    if (!this.selectedReservation || this.paymentAmount <= 0) return;

    const order = this.orders.find(o => o.reservation?.id === this.selectedReservation!.id);
    if (!order) return;

    this.apiService.simulatePayment({
      orderId: order.id,
      amount: this.paymentAmount,
      paymentMethod: this.paymentMethod
    }).subscribe({
      next: () => {
        const index = this.reservations.findIndex(r => r.id === this.selectedReservation!.id);
        if (index !== -1) {
          this.reservations[index].paidAmount += this.paymentAmount;
        }
        this.closePaymentModal();
      },
      error: () => {
        const index = this.reservations.findIndex(r => r.id === this.selectedReservation!.id);
        if (index !== -1) {
          this.reservations[index].paidAmount += this.paymentAmount;
        }
        this.closePaymentModal();
      }
    });
  }
}
