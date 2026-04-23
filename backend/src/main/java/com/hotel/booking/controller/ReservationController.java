package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.CheckInRequest;
import com.hotel.booking.dto.CheckOutRequest;
import com.hotel.booking.dto.ReservationRequest;
import com.hotel.booking.entity.Reservation;
import com.hotel.booking.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "预订管理", description = "预订、入住、退房全流程管理")
public class ReservationController {
    
    private final ReservationService reservationService;
    
    @GetMapping
    @Operation(summary = "获取所有预订")
    public ResponseEntity<ApiResponse<List<Reservation>>> getAllReservations() {
        List<Reservation> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取预订")
    public ResponseEntity<ApiResponse<Reservation>> getReservationById(@PathVariable Long id) {
        Reservation reservation = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }
    
    @GetMapping("/no/{reservationNo}")
    @Operation(summary = "根据预订号获取预订")
    public ResponseEntity<ApiResponse<Reservation>> getReservationByNo(@PathVariable String reservationNo) {
        Reservation reservation = reservationService.getReservationByNo(reservationNo);
        return ResponseEntity.ok(ApiResponse.success(reservation));
    }
    
    @GetMapping("/guest/{guestId}")
    @Operation(summary = "根据客人ID获取预订记录")
    public ResponseEntity<ApiResponse<List<Reservation>>> getReservationsByGuestId(@PathVariable Long guestId) {
        List<Reservation> reservations = reservationService.getReservationsByGuestId(guestId);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "根据状态获取预订")
    public ResponseEntity<ApiResponse<List<Reservation>>> getReservationsByStatus(
            @PathVariable Reservation.Status status) {
        List<Reservation> reservations = reservationService.getReservationsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }
    
    @GetMapping("/date/{date}")
    @Operation(summary = "获取某日期的预订")
    public ResponseEntity<ApiResponse<List<Reservation>>> getReservationsForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Reservation> reservations = reservationService.getReservationsForDate(date);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }
    
    @PostMapping
    @Operation(summary = "创建预订")
    public ResponseEntity<ApiResponse<Reservation>> createReservation(
            @Valid @RequestBody ReservationRequest request) {
        Reservation reservation = reservationService.createReservation(request);
        return ResponseEntity.ok(ApiResponse.success("预订创建成功", reservation));
    }
    
    @PostMapping("/{id}/confirm")
    @Operation(summary = "确认预订")
    public ResponseEntity<ApiResponse<Reservation>> confirmReservation(@PathVariable Long id) {
        Reservation reservation = reservationService.confirmReservation(id);
        return ResponseEntity.ok(ApiResponse.success("预订确认成功", reservation));
    }
    
    @PostMapping("/check-in")
    @Operation(summary = "办理入住")
    public ResponseEntity<ApiResponse<Reservation>> checkIn(@Valid @RequestBody CheckInRequest request) {
        Reservation reservation = reservationService.checkIn(request.getReservationId());
        return ResponseEntity.ok(ApiResponse.success("入住办理成功", reservation));
    }
    
    @PostMapping("/check-out")
    @Operation(summary = "办理退房")
    public ResponseEntity<ApiResponse<Reservation>> checkOut(@Valid @RequestBody CheckOutRequest request) {
        Reservation reservation = reservationService.checkOut(
                request.getReservationId(), 
                request.getExtraCharge());
        return ResponseEntity.ok(ApiResponse.success("退房办理成功", reservation));
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "取消预订")
    public ResponseEntity<ApiResponse<Reservation>> cancelReservation(@PathVariable Long id) {
        Reservation reservation = reservationService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.success("预订已取消", reservation));
    }
}
