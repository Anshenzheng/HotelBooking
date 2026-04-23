import { Component, OnInit } from '@angular/core';
import { ApiService, Room, Reservation, Order } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = true;
  rooms: Room[] = [];
  reservations: Reservation[] = [];
  orders: Order[] = [];
  
  stats = {
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    todayReservations: 0,
    pendingReservations: 0,
    checkedInCount: 0,
    todayRevenue: 0
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.apiService.getRooms().subscribe({
      next: (res) => {
        this.rooms = res.data || [];
        this.calculateStats();
      },
      error: () => {
        this.rooms = this.getMockRooms();
        this.calculateStats();
      }
    });

    this.apiService.getReservations().subscribe({
      next: (res) => {
        this.reservations = res.data || [];
        this.calculateStats();
      },
      error: () => {
        this.reservations = [];
        this.calculateStats();
      }
    });

    this.apiService.getOrders().subscribe({
      next: (res) => {
        this.orders = res.data || [];
        this.calculateStats();
      },
      error: () => {
        this.orders = [];
        this.calculateStats();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.totalRooms = this.rooms.length;
    this.stats.availableRooms = this.rooms.filter(r => r.status === 'AVAILABLE').length;
    this.stats.occupiedRooms = this.rooms.filter(r => r.status === 'OCCUPIED').length;
    this.stats.maintenanceRooms = this.rooms.filter(r => r.status === 'MAINTENANCE').length;
    
    const today = new Date().toISOString().split('T')[0];
    this.stats.todayReservations = this.reservations.filter(r => 
      r.checkInDate === today || r.checkOutDate === today
    ).length;
    
    this.stats.pendingReservations = this.reservations.filter(r => 
      r.status === 'PENDING' || r.status === 'CONFIRMED'
    ).length;
    
    this.stats.checkedInCount = this.reservations.filter(r => r.status === 'CHECKED_IN').length;
    
    this.stats.todayRevenue = this.orders
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + o.paidAmount, 0);
  }

  getMockRooms(): Room[] {
    const mockRoomType = {
      id: 1,
      name: '豪华大床房',
      description: '宽敞舒适的豪华客房',
      price: 588,
      capacity: 2,
      area: 35,
      bedType: 'King Size',
      facilities: '免费WiFi,空调,电视,迷你吧',
      imageUrl: '',
      status: 'ACTIVE' as const,
      createdAt: '',
      updatedAt: ''
    };

    return [
      { id: 1, roomNumber: '101', floor: 1, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
      { id: 2, roomNumber: '102', floor: 1, roomType: mockRoomType, status: 'OCCUPIED', remark: '', createdAt: '', updatedAt: '' },
      { id: 3, roomNumber: '103', floor: 1, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
      { id: 4, roomNumber: '201', floor: 2, roomType: mockRoomType, status: 'RESERVED', remark: '', createdAt: '', updatedAt: '' },
      { id: 5, roomNumber: '202', floor: 2, roomType: mockRoomType, status: 'MAINTENANCE', remark: '', createdAt: '', updatedAt: '' },
      { id: 6, roomNumber: '203', floor: 2, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
    ];
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'badge-success';
      case 'OCCUPIED': return 'badge-danger';
      case 'RESERVED': return 'badge-warning';
      case 'MAINTENANCE': return 'badge-secondary';
      default: return 'badge-info';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '空闲';
      case 'OCCUPIED': return '已入住';
      case 'RESERVED': return '已预订';
      case 'MAINTENANCE': return '维护中';
      default: return status;
    }
  }
}
