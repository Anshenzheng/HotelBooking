import { Component, OnInit } from '@angular/core';
import { ApiService, Order } from '../../../services/api.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  selectedOrder: Order | null = null;
  showDetail = false;
  showPaymentModal = false;
  paymentAmount = 0;
  paymentMethod = 'ALIPAY';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (res) => {
        this.orders = res.data || this.getMockOrders();
        this.loading = false;
      },
      error: () => {
        this.orders = this.getMockOrders();
        this.loading = false;
      }
    });
  }

  getMockOrders(): Order[] {
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

    const mockReservation = {
      id: 1,
      reservationNo: 'RSV' + Date.now(),
      guest: mockGuest,
      room: mockRoom,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      days: 1,
      roomPrice: 588,
      totalAmount: 588,
      paidAmount: 0,
      status: 'PENDING' as const,
      contactPerson: '张三',
      contactPhone: '13800138000',
      specialRequest: '',
      remark: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const today = new Date();
    
    return [
      {
        id: 1,
        orderNo: 'ORD' + Date.now(),
        reservation: mockReservation,
        guest: mockGuest,
        totalAmount: 588,
        paidAmount: 0,
        status: 'PENDING',
        paymentMethod: '',
        paidAt: '',
        remark: '',
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        id: 2,
        orderNo: 'ORD' + (Date.now() + 1),
        reservation: { ...mockReservation, id: 2, reservationNo: 'RSV' + (Date.now() + 1), days: 3, totalAmount: 1764 },
        guest: { ...mockGuest, id: 2, name: '李四', idCard: '110101199002025678', phone: '13900139000' },
        totalAmount: 1764,
        paidAmount: 1764,
        status: 'PAID',
        paymentMethod: 'ALIPAY',
        paidAt: today.toISOString(),
        remark: '',
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        id: 3,
        orderNo: 'ORD' + (Date.now() + 2),
        reservation: { ...mockReservation, id: 3, reservationNo: 'RSV' + (Date.now() + 2), status: 'COMPLETED' as const },
        guest: { ...mockGuest, id: 3, name: '王五', idCard: '110101199003039012', phone: '13700137000' },
        totalAmount: 1288,
        paidAmount: 1288,
        status: 'PAID',
        paymentMethod: 'WECHAT',
        paidAt: new Date(today.getTime() - 86400000).toISOString(),
        remark: '',
        createdAt: new Date(today.getTime() - 172800000).toISOString(),
        updatedAt: new Date(today.getTime() - 86400000).toISOString()
      },
      {
        id: 4,
        orderNo: 'ORD' + (Date.now() + 3),
        reservation: { ...mockReservation, id: 4, reservationNo: 'RSV' + (Date.now() + 3), status: 'CANCELLED' as const },
        guest: { ...mockGuest, id: 4, name: '赵六', idCard: '110101199004043456', phone: '13600136000' },
        totalAmount: 888,
        paidAmount: 888,
        status: 'REFUNDED',
        paymentMethod: 'CREDIT_CARD',
        paidAt: new Date(today.getTime() - 172800000).toISOString(),
        remark: '客人临时取消',
        createdAt: new Date(today.getTime() - 259200000).toISOString(),
        updatedAt: new Date(today.getTime() - 86400000).toISOString()
      }
    ];
  }

  get filteredOrders(): Order[] {
    return this.orders.filter(order => {
      const matchSearch = !this.searchTerm ||
        order.orderNo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.guest?.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.reservation?.reservationNo.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || order.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'PAID': return 'badge-success';
      case 'REFUNDED': return 'badge-info';
      case 'CANCELLED': return 'badge-secondary';
      default: return 'badge-info';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return '待支付';
      case 'PAID': return '已支付';
      case 'REFUNDED': return '已退款';
      case 'CANCELLED': return '已取消';
      default: return status;
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'ALIPAY': return '支付宝';
      case 'WECHAT': return '微信支付';
      case 'CREDIT_CARD': return '信用卡';
      case 'CASH': return '现金';
      case 'BANK_TRANSFER': return '银行转账';
      default: return method || '-';
    }
  }

  openDetail(order: Order): void {
    this.selectedOrder = order;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedOrder = null;
  }

  openPaymentModal(order: Order): void {
    this.selectedOrder = order;
    this.paymentAmount = order.totalAmount - order.paidAmount;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedOrder = null;
  }

  processPayment(): void {
    if (!this.selectedOrder || this.paymentAmount <= 0) return;

    this.apiService.simulatePayment({
      orderId: this.selectedOrder.id,
      amount: this.paymentAmount,
      paymentMethod: this.paymentMethod
    }).subscribe({
      next: () => {
        const index = this.orders.findIndex(o => o.id === this.selectedOrder!.id);
        if (index !== -1) {
          this.orders[index].paidAmount += this.paymentAmount;
          this.orders[index].status = this.orders[index].paidAmount >= this.orders[index].totalAmount ? 'PAID' : 'PENDING';
          this.orders[index].paymentMethod = this.paymentMethod;
        }
        this.closePaymentModal();
      },
      error: () => {
        const index = this.orders.findIndex(o => o.id === this.selectedOrder!.id);
        if (index !== -1) {
          this.orders[index].paidAmount += this.paymentAmount;
          this.orders[index].status = this.orders[index].paidAmount >= this.orders[index].totalAmount ? 'PAID' : 'PENDING';
          this.orders[index].paymentMethod = this.paymentMethod;
        }
        this.closePaymentModal();
      }
    });
  }
}
