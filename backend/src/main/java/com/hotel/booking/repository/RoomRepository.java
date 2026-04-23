package com.hotel.booking.repository;

import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    List<Room> findByStatus(Room.Status status);
    
    List<Room> findByRoomType(RoomType roomType);
    
    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' " +
           "AND r.id NOT IN (" +
           "    SELECT res.room.id FROM Reservation res " +
           "    WHERE res.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "    AND :checkInDate < res.checkOutDate " +
           "    AND :checkOutDate > res.checkInDate" +
           ")")
    List<Room> findAvailableRooms(@Param("checkInDate") LocalDate checkInDate, 
                                   @Param("checkOutDate") LocalDate checkOutDate);
    
    @Query("SELECT r FROM Room r WHERE r.roomType.id = :roomTypeId " +
           "AND r.status = 'AVAILABLE' " +
           "AND r.id NOT IN (" +
           "    SELECT res.room.id FROM Reservation res " +
           "    WHERE res.status IN ('CONFIRMED', 'CHECKED_IN') " +
           "    AND :checkInDate < res.checkOutDate " +
           "    AND :checkOutDate > res.checkInDate" +
           ")")
    List<Room> findAvailableRoomsByType(@Param("roomTypeId") Long roomTypeId,
                                         @Param("checkInDate") LocalDate checkInDate, 
                                         @Param("checkOutDate") LocalDate checkOutDate);
    
    boolean existsByRoomNumber(String roomNumber);
    
    Room findByRoomNumber(String roomNumber);
}
