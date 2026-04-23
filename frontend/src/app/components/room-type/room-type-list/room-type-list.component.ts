import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, RoomType } from '../../../services/api.service';

@Component({
  selector: 'app-room-type-list',
  templateUrl: './room-type-list.component.html',
  styleUrl: './room-type-list.component.scss'
})
export class RoomTypeListComponent implements OnInit {
  roomTypes: RoomType[] = [];
  loading = true;
  showModal = false;
  isEdit = false;
  selectedRoomType: RoomType | null = null;
  form: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      area: [0, Validators.min(0)],
      bedType: [''],
      facilities: [''],
      imageUrl: [''],
      status: ['ACTIVE']
    });
  }

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes(): void {
    this.apiService.getRoomTypes().subscribe({
      next: (res) => {
        this.roomTypes = res.data || this.getMockRoomTypes();
        this.loading = false;
      },
      error: () => {
        this.roomTypes = this.getMockRoomTypes();
        this.loading = false;
      }
    });
  }

  getMockRoomTypes(): RoomType[] {
    return [
      {
        id: 1,
        name: '豪华大床房',
        description: '宽敞舒适的豪华客房，配备King Size大床，俯瞰城市美景',
        price: 588,
        capacity: 2,
        area: 35,
        bedType: 'King Size',
        facilities: '免费WiFi, 中央空调, 液晶电视, 迷你吧, 保险箱, 浴袍拖鞋',
        imageUrl: '',
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 2,
        name: '商务双床房',
        description: '专为商务人士打造，配备两张单人床，独立办公区域',
        price: 488,
        capacity: 2,
        area: 32,
        bedType: 'Twin',
        facilities: '免费WiFi, 中央空调, 液晶电视, 办公桌, 人体工学椅, 迷你吧',
        imageUrl: '',
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: ''
      },
      {
        id: 3,
        name: '行政套房',
        description: '尊享行政楼层礼遇，独立客厅与卧室，奢华舒适体验',
        price: 1288,
        capacity: 2,
        area: 65,
        bedType: 'King Size',
        facilities: '免费WiFi, 中央空调, 智能电视, 独立客厅, 行政礼遇, Nespresso咖啡机',
        imageUrl: '',
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: ''
      }
    ];
  }

  openAddModal(): void {
    this.isEdit = false;
    this.selectedRoomType = null;
    this.form.reset({
      name: '',
      description: '',
      price: 0,
      capacity: 1,
      area: 0,
      bedType: '',
      facilities: '',
      imageUrl: '',
      status: 'ACTIVE'
    });
    this.showModal = true;
  }

  openEditModal(roomType: RoomType): void {
    this.isEdit = true;
    this.selectedRoomType = roomType;
    this.form.patchValue(roomType);
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

    const roomTypeData = this.form.value;

    if (this.isEdit && this.selectedRoomType) {
      this.apiService.updateRoomType(this.selectedRoomType.id, roomTypeData).subscribe({
        next: () => {
          this.loadRoomTypes();
          this.closeModal();
        },
        error: () => {
          const index = this.roomTypes.findIndex(r => r.id === this.selectedRoomType!.id);
          if (index !== -1) {
            this.roomTypes[index] = { ...this.selectedRoomType!, ...roomTypeData };
          }
          this.closeModal();
        }
      });
    } else {
      this.apiService.createRoomType(roomTypeData).subscribe({
        next: () => {
          this.loadRoomTypes();
          this.closeModal();
        },
        error: () => {
          const newRoomType: RoomType = {
            ...roomTypeData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          this.roomTypes.push(newRoomType);
          this.closeModal();
        }
      });
    }
  }

  deleteRoomType(id: number): void {
    if (!confirm('确定要删除这个房型吗？')) {
      return;
    }

    this.apiService.deleteRoomType(id).subscribe({
      next: () => {
        this.loadRoomTypes();
      },
      error: () => {
        const index = this.roomTypes.findIndex(r => r.id === id);
        if (index !== -1) {
          this.roomTypes[index].status = 'INACTIVE';
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ACTIVE' ? 'badge-success' : 'badge-secondary';
  }

  getStatusText(status: string): string {
    return status === 'ACTIVE' ? '启用' : '禁用';
  }
}
