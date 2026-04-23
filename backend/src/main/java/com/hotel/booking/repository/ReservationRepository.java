package com.hotel.booking.repository;

import com.hotel.booking.entity.Reservation;
import com.hotel.booking.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    Optional<Reservation> findByReservationNo(String reservationNo);
    
    List<Reservation> findByStatus(Reservation.Status status);
    
    List<Reservation> findByRoomId(Long roomId);
    
    @Query("SELECT r FROM Reservation r WHERE r.room = :room " +
           "AND r.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "AND :checkInDate < r.checkOutDate " +
           "AND :checkOutDate > r.checkInDate")
    List<Reservation> findConflictingReservations(@Param("room") Room room,
                                                   @Param("checkInDate") LocalDate checkInDate,
                                                   @Param("checkOutDate") LocalDate checkOutDate);
    
    @Query("SELECT r FROM Reservation r WHERE r.room.id = :roomId " +
           "AND r.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "AND :checkInDate < r.checkOutDate " +
           "AND :checkOutDate > r.checkInDate " +
           "AND r.id <> :excludeReservationId")
    List<Reservation> findConflictingReservationsExcluding(@Param("roomId") Long roomId,
                                                             @Param("checkInDate") LocalDate checkInDate,
                                                             @Param("checkOutDate") LocalDate checkOutDate,
                                                             @Param("excludeReservationId") Long excludeReservationId);
    
    @Query("SELECT r FROM Reservation r WHERE r.checkInDate <= :date " +
           "AND r.checkOutDate >= :date " +
           "AND r.status IN ('CONFIRMED', 'CHECKED_IN')")
    List<Reservation> findReservationsForDate(@Param("date") LocalDate date);
    
    List<Reservation> findByGuestIdOrderByCreatedAtDesc(Long guestId);
    
    @Query("SELECT r FROM Reservation r ORDER BY r.createdAt DESC")
    List<Reservation> findAllOrderByCreatedAtDesc();
}
