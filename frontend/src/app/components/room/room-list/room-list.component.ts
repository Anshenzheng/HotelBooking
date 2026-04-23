import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, Room, RoomType } from '../../../services/api.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  roomTypes: RoomType[] = [];
  loading = true;
  showModal = false;
  isEdit = false;
  selectedRoom: Room | null = null;
  form: FormGroup;
  searchTerm = '';
  statusFilter = '';

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      roomNumber: ['', Validators.required],
      floor: [1, [Validators.required, Validators.min(1)]],
      roomTypeId: [null, Validators.required],
      status: ['AVAILABLE'],
      remark: ['']
    });
  }

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

    this.apiService.getActiveRoomTypes().subscribe({
      next: (res) => {
        this.roomTypes = res.data || this.getMockRoomTypes();
      },
      error: () => {
        this.roomTypes = this.getMockRoomTypes();
      }
    });
  }

  getMockRooms(): Room[] {
    const mockRoomType = this.getMockRoomTypes()[0];
    return [
      { id: 1, roomNumber: '101', floor: 1, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
      { id: 2, roomNumber: '102', floor: 1, roomType: mockRoomType, status: 'OCCUPIED', remark: '', createdAt: '', updatedAt: '' },
      { id: 3, roomNumber: '103', floor: 1, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
      { id: 4, roomNumber: '201', floor: 2, roomType: mockRoomType, status: 'RESERVED', remark: '', createdAt: '', updatedAt: '' },
      { id: 5, roomNumber: '202', floor: 2, roomType: mockRoomType, status: 'MAINTENANCE', remark: '', createdAt: '', updatedAt: '' },
      { id: 6, roomNumber: '203', floor: 2, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
    ];
  }

  getMockRoomTypes(): RoomType[] {
    return [
      { id: 1, name: '豪华大床房', description: '', price: 588, capacity: 2, area: 35, bedType: 'King Size', facilities: '', imageUrl: '', status: 'ACTIVE', createdAt: '', updatedAt: '' },
      { id: 2, name: '商务双床房', description: '', price: 488, capacity: 2, area: 32, bedType: 'Twin', facilities: '', imageUrl: '', status: 'ACTIVE', createdAt: '', updatedAt: '' },
      { id: 3, name: '行政套房', description: '', price: 1288, capacity: 2, area: 65, bedType: 'King Size', facilities: '', imageUrl: '', status: 'ACTIVE', createdAt: '', updatedAt: '' }
    ];
  }

  get filteredRooms(): Room[] {
    return this.rooms.filter(room => {
      const matchSearch = !this.searchTerm || 
        room.roomNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        room.roomType?.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || room.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  openAddModal(): void {
    this.isEdit = false;
    this.selectedRoom = null;
    this.form.reset({
      roomNumber: '',
      floor: 1,
      roomTypeId: null,
      status: 'AVAILABLE',
      remark: ''
    });
    this.showModal = true;
  }

  openEditModal(room: Room): void {
    this.isEdit = true;
    this.selectedRoom = room;
    this.form.patchValue({
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomTypeId: room.roomType?.id,
      status: room.status,
      remark: room.remark
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const roomTypeId = this.form.value.roomTypeId;
    const roomType = this.roomTypes.find(rt => rt.id === roomTypeId);
    
    const roomData: Partial<Room> = {
      roomNumber: this.form.value.roomNumber,
      floor: this.form.value.floor,
      status: this.form.value.status,
      remark: this.form.value.remark,
      roomType: roomType
    };

    if (this.isEdit && this.selectedRoom) {
      const index = this.rooms.findIndex(r => r.id === this.selectedRoom!.id);
      if (index !== -1) {
        this.rooms[index] = { ...this.selectedRoom!, ...roomData };
      }
    } else {
      const newRoom: Room = {
        ...roomData as Room,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.rooms.push(newRoom);
    }

    this.closeModal();
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
