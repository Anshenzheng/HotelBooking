package com.hotel.booking.repository;

import com.hotel.booking.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNo(String orderNo);
    
    Optional<Order> findByReservationId(Long reservationId);
    
    List<Order> findByGuestIdOrderByCreatedAtDesc(Long guestId);
    
    List<Order> findByStatus(Order.Status status);
    
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findAllOrderByCreatedAtDesc();
}
