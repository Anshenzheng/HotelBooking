package com.hotel.booking.service;

import com.hotel.booking.dto.ReservationRequest;
import com.hotel.booking.entity.*;
import com.hotel.booking.exception.BusinessException;
import com.hotel.booking.exception.ReservationConflictException;
import com.hotel.booking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;
    private final OrderRepository orderRepository;
    
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAllOrderByCreatedAtDesc();
    }
    
    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("预订不存在"));
    }
    
    public Reservation getReservationByNo(String reservationNo) {
        return reservationRepository.findByReservationNo(reservationNo)
                .orElseThrow(() -> new BusinessException("预订不存在"));
    }
    
    public List<Reservation> getReservationsByGuestId(Long guestId) {
        return reservationRepository.findByGuestIdOrderByCreatedAtDesc(guestId);
    }
    
    public List<Reservation> getReservationsByStatus(Reservation.Status status) {
        return reservationRepository.findByStatus(status);
    }
    
    public List<Reservation> getReservationsForDate(LocalDate date) {
        return reservationRepository.findReservationsForDate(date);
    }
    
    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new BusinessException("房间不存在"));
        
        if (room.getStatus() == Room.Status.MAINTENANCE) {
            throw new BusinessException("房间正在维护，无法预订");
        }
        
        validateDates(request.getCheckInDate(), request.getCheckOutDate());
        
        List<Reservation> conflictingReservations = reservationRepository.findConflictingReservations(
                room, request.getCheckInDate(), request.getCheckOutDate());
        
        if (!conflictingReservations.isEmpty()) {
            throw new ReservationConflictException(
                    "该房间在 " + request.getCheckInDate() + " 至 " + request.getCheckOutDate() + " 期间已被预订");
        }
        
        final String guestName = request.getGuestName();
        final String guestIdCard = request.getGuestIdCard();
        final String guestPhone = request.getGuestPhone();
        final String guestEmail = request.getGuestEmail();
        
        Guest newGuest = new Guest();
        newGuest.setName(guestName);
        newGuest.setIdCard(guestIdCard);
        newGuest.setPhone(guestPhone);
        newGuest.setEmail(guestEmail);
        
        Guest guest = guestRepository.findByIdCard(guestIdCard)
                .map(existingGuest -> {
                    existingGuest.setName(guestName);
                    if (guestPhone != null) existingGuest.setPhone(guestPhone);
                    if (guestEmail != null) existingGuest.setEmail(guestEmail);
                    return guestRepository.save(existingGuest);
                })
                .orElseGet(() -> guestRepository.save(newGuest));
        
        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal roomPrice = room.getRoomType().getPrice();
        BigDecimal totalAmount = roomPrice.multiply(BigDecimal.valueOf(days));
        
        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        reservation.setGuest(guest);
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setDays((int) days);
        reservation.setRoomPrice(roomPrice);
        reservation.setTotalAmount(totalAmount);
        reservation.setStatus(Reservation.Status.PENDING);
        reservation.setContactPerson(request.getContactPerson());
        reservation.setContactPhone(request.getContactPhone());
        reservation.setSpecialRequest(request.getSpecialRequest());
        
        reservation = reservationRepository.save(reservation);
        
        Order order = new Order();
        order.setOrderNo("ORD" + System.currentTimeMillis());
        order.setReservation(reservation);
        order.setGuest(guest);
        order.setTotalAmount(totalAmount);
        order.setStatus(Order.Status.PENDING);
        orderRepository.save(order);
        
        return reservation;
    }
    
    @Transactional
    public Reservation confirmReservation(Long id) {
        Reservation reservation = getReservationById(id);
        
        if (reservation.getStatus() != Reservation.Status.PENDING) {
            throw new BusinessException("只有待确认的预订才能确认");
        }
        
        List<Reservation> conflictingReservations = reservationRepository.findConflictingReservationsExcluding(
                reservation.getRoom().getId(),
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                reservation.getId());
        
        if (!conflictingReservations.isEmpty()) {
            throw new ReservationConflictException("该房间在此期间已被其他预订占用");
        }
        
        reservation.setStatus(Reservation.Status.CONFIRMED);
        Room room = reservation.getRoom();
        room.setStatus(Room.Status.RESERVED);
        roomRepository.save(room);
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation checkIn(Long reservationId) {
        Reservation reservation = getReservationById(reservationId);
        
        if (reservation.getStatus() != Reservation.Status.CONFIRMED) {
            throw new BusinessException("只有已确认的预订才能入住");
        }
        
        if (LocalDate.now().isBefore(reservation.getCheckInDate())) {
            throw new BusinessException("未到入住日期");
        }
        
        reservation.setStatus(Reservation.Status.CHECKED_IN);
        
        Room room = reservation.getRoom();
        room.setStatus(Room.Status.OCCUPIED);
        roomRepository.save(room);
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation checkOut(Long reservationId, BigDecimal extraCharge) {
        Reservation reservation = getReservationById(reservationId);
        
        if (reservation.getStatus() != Reservation.Status.CHECKED_IN) {
            throw new BusinessException("只有已入住的预订才能退房");
        }
        
        if (extraCharge != null && extraCharge.compareTo(BigDecimal.ZERO) > 0) {
            reservation.setTotalAmount(reservation.getTotalAmount().add(extraCharge));
        }
        
        reservation.setStatus(Reservation.Status.COMPLETED);
        
        Room room = reservation.getRoom();
        room.setStatus(Room.Status.AVAILABLE);
        roomRepository.save(room);
        
        Order order = orderRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new BusinessException("订单不存在"));
        order.setStatus(Order.Status.PAID);
        order.setPaidAmount(reservation.getTotalAmount());
        orderRepository.save(order);
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation cancelReservation(Long id) {
        Reservation reservation = getReservationById(id);
        Reservation.Status originalStatus = reservation.getStatus();
        
        if (originalStatus == Reservation.Status.COMPLETED || 
            originalStatus == Reservation.Status.CANCELLED) {
            throw new BusinessException("该预订无法取消");
        }
        
        if (originalStatus == Reservation.Status.CHECKED_IN) {
            throw new BusinessException("客人已入住，请先办理退房");
        }
        
        if (originalStatus == Reservation.Status.CONFIRMED) {
            Room room = reservation.getRoom();
            room.setStatus(Room.Status.AVAILABLE);
            roomRepository.save(room);
        }
        
        reservation.setStatus(Reservation.Status.CANCELLED);
        
        Order order = orderRepository.findByReservationId(id)
                .orElseThrow(() -> new BusinessException("订单不存在"));
        order.setStatus(Order.Status.CANCELLED);
        orderRepository.save(order);
        
        return reservationRepository.save(reservation);
    }
    
    private void validateDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new BusinessException("入住日期不能早于今天");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new BusinessException("退房日期必须晚于入住日期");
        }
    }
}
