import { Component, OnInit } from '@angular/core';
import { ApiService, Room, Reservation } from '../../../services/api.service';

@Component({
  selector: 'app-room-status',
  templateUrl: './room-status.component.html',
  styleUrl: './room-status.component.scss'
})
export class RoomStatusComponent implements OnInit {
  rooms: Room[] = [];
  reservations: Reservation[] = [];
  loading = true;
  selectedDate = new Date();
  selectedRoom: Room | null = null;
  showRoomDetail = false;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getRooms().subscribe({
      next: (res) => {
        this.rooms = res.data || this.getMockRooms();
        this.loading = false;
      },
      error: () => {
        this.rooms = this.getMockRooms();
        this.loading = false;
      }
    });

    this.apiService.getReservations().subscribe({
      next: (res) => {
        this.reservations = res.data || [];
      },
      error: () => {
        this.reservations = [];
      }
    });
  }

  getMockRooms(): Room[] {
    const mockRoomType = {
      id: 1, name: '豪华大床房', description: '', price: 588, capacity: 2, 
      area: 35, bedType: 'King Size', facilities: '', imageUrl: '', 
      status: 'ACTIVE' as const, createdAt: '', updatedAt: ''
    };

    const rooms: Room[] = [];
    const statuses: Room['status'][] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
    
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 6; i++) {
        const roomNumber = `${floor}${String(i).padStart(2, '0')}`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        rooms.push({
          id: parseInt(roomNumber),
          roomNumber,
          floor,
          roomType: mockRoomType,
          status,
          remark: '',
          createdAt: '',
          updatedAt: ''
        });
      }
    }
    return rooms;
  }

  get roomsByFloor(): { [key: number]: Room[] } {
    const grouped: { [key: number]: Room[] } = {};
    this.rooms.forEach(room => {
      if (!grouped[room.floor]) {
        grouped[room.floor] = [];
      }
      grouped[room.floor].push(room);
    });
    return grouped;
  }

  get floors(): number[] {
    return Object.keys(this.roomsByFloor).map(Number).sort((a, b) => a - b);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'available';
      case 'OCCUPIED': return 'occupied';
      case 'RESERVED': return 'reserved';
      case 'MAINTENANCE': return 'maintenance';
      default: return '';
    }
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

  getRoomReservations(room: Room): Reservation[] {
    return this.reservations.filter(r => 
      r.room.id === room.id && 
      (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
    );
  }

  openRoomDetail(room: Room): void {
    this.selectedRoom = room;
    this.showRoomDetail = true;
  }

  closeRoomDetail(): void {
    this.showRoomDetail = false;
    this.selectedRoom = null;
  }

  getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
