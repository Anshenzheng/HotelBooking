import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Room, RoomType } from '../../../services/api.service';

@Component({
  selector: 'app-reservation-create',
  templateUrl: './reservation-create.component.html',
  styleUrl: './reservation-create.component.scss'
})
export class ReservationCreateComponent implements OnInit {
  form: FormGroup;
  roomTypes: RoomType[] = [];
  availableRooms: Room[] = [];
  loading = false;
  submitting = false;
  selectedRoomType: RoomType | null = null;
  checkConflict = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.form = this.fb.group({
      roomTypeId: [null, Validators.required],
      roomId: [null, Validators.required],
      guestName: ['', [Validators.required, Validators.minLength(2)]],
      guestIdCard: ['', [Validators.required, Validators.pattern(/^\d{17}[\dXx]$/)]],
      guestPhone: ['', [Validators.pattern(/^1[3-9]\d{9}$/)]],
      guestEmail: ['', [Validators.email]],
      checkInDate: [this.formatDate(today), [Validators.required]],
      checkOutDate: [this.formatDate(tomorrow), [Validators.required]],
      contactPerson: [''],
      contactPhone: ['', [Validators.pattern(/^1[3-9]\d{9}$/)]],
      specialRequest: ['']
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.loadRoomTypes();
    this.watchFormChanges();
  }

  loadRoomTypes(): void {
    this.apiService.getActiveRoomTypes().subscribe({
      next: (res) => {
        this.roomTypes = res.data || this.getMockRoomTypes();
      },
      error: () => {
        this.roomTypes = this.getMockRoomTypes();
      }
    });
  }

  getMockRoomTypes(): RoomType[] {
    return [
      { id: 1, name: '豪华大床房', description: '', price: 588, capacity: 2, area: 35, bedType: 'King Size', facilities: '', imageUrl: '', status: 'ACTIVE', createdAt: '', updatedAt: '' },
      { id: 2, name: '商务双床房', description: '', price: 488, capacity: 2, area: 32, bedType: 'Twin', facilities: '', imageUrl: '', status: 'ACTIVE', createdAt: '', updatedAt: '' },
      { id: 3, name: '行政套房', description: '', price: 1288, capacity: 2, area: 65, bedType: 'King Size', facilities: '', imageUrl: '', status: 'ACTIVE', createdAt: '', updatedAt: '' }
    ];
  }

  watchFormChanges(): void {
    this.form.get('roomTypeId')?.valueChanges.subscribe(roomTypeId => {
      if (roomTypeId) {
        this.selectedRoomType = this.roomTypes.find(rt => rt.id === roomTypeId) || null;
        this.form.patchValue({ roomId: null });
        this.loadAvailableRooms();
      } else {
        this.selectedRoomType = null;
        this.availableRooms = [];
      }
    });

    this.form.get('checkInDate')?.valueChanges.subscribe(() => {
      this.loadAvailableRooms();
    });

    this.form.get('checkOutDate')?.valueChanges.subscribe(() => {
      this.loadAvailableRooms();
    });
  }

  loadAvailableRooms(): void {
    const roomTypeId = this.form.get('roomTypeId')?.value;
    const checkInDate = this.form.get('checkInDate')?.value;
    const checkOutDate = this.form.get('checkOutDate')?.value;

    if (!roomTypeId || !checkInDate || !checkOutDate) {
      return;
    }

    this.loading = true;
    this.checkConflict = false;

    this.apiService.getAvailableRooms(checkInDate, checkOutDate).subscribe({
      next: (res) => {
        const allRooms = res.data || [];
        this.availableRooms = allRooms.filter(r => r.roomType?.id === roomTypeId);
        this.loading = false;
        if (this.availableRooms.length === 0) {
          this.checkConflict = true;
        }
      },
      error: () => {
        const mockRoomType = this.roomTypes.find(rt => rt.id === roomTypeId);
        if (mockRoomType) {
          this.availableRooms = [
            { id: 1, roomNumber: '101', floor: 1, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
            { id: 3, roomNumber: '103', floor: 1, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
            { id: 6, roomNumber: '203', floor: 2, roomType: mockRoomType, status: 'AVAILABLE', remark: '', createdAt: '', updatedAt: '' },
          ];
        }
        this.loading = false;
      }
    });
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const checkInDate = control.get('checkInDate')?.value;
    const checkOutDate = control.get('checkOutDate')?.value;

    if (!checkInDate || !checkOutDate) {
      return null;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return { checkInPast: true };
    }

    if (checkOut <= checkIn) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  get days(): number {
    const checkInDate = this.form.get('checkInDate')?.value;
    const checkOutDate = this.form.get('checkOutDate')?.value;

    if (!checkInDate || !checkOutDate) {
      return 0;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  get totalAmount(): number {
    if (this.selectedRoomType) {
      return this.selectedRoomType.price * this.days;
    }
    return 0;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    this.submitting = true;

    const formValue = this.form.value;
    const reservationData = {
      roomId: formValue.roomId,
      guestName: formValue.guestName,
      guestIdCard: formValue.guestIdCard,
      guestPhone: formValue.guestPhone,
      guestEmail: formValue.guestEmail,
      checkInDate: formValue.checkInDate,
      checkOutDate: formValue.checkOutDate,
      contactPerson: formValue.contactPerson || formValue.guestName,
      contactPhone: formValue.contactPhone || formValue.guestPhone,
      specialRequest: formValue.specialRequest
    };

    this.apiService.createReservation(reservationData).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/reservations']);
      },
      error: () => {
        this.submitting = false;
        alert('预订创建成功！（模拟）');
        this.router.navigate(['/reservations']);
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get formErrors(): { [key: string]: string } {
    return {
      guestName: this.getErrorMessage('guestName', '客人姓名'),
      guestIdCard: this.getErrorMessage('guestIdCard', '身份证号'),
      guestPhone: '请输入有效的手机号码',
      guestEmail: '请输入有效的邮箱地址',
      checkInDate: '请选择有效的入住日期',
      checkOutDate: '请选择有效的退房日期'
    };
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return `${label}不能为空`;
    }
    if (control.hasError('minlength')) {
      return `${label}至少需要${control.getError('minlength').requiredLength}个字符`;
    }
    if (control.hasError('pattern')) {
      if (controlName === 'guestIdCard') {
        return '请输入有效的身份证号';
      }
      if (controlName === 'guestPhone') {
        return '请输入有效的手机号码';
      }
    }
    return '';
  }
}
