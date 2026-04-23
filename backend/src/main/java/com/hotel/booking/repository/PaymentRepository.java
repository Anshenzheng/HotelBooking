package com.hotel.booking.repository;

import com.hotel.booking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByPaymentNo(String paymentNo);
    
    List<Payment> findByOrderId(Long orderId);
    
    List<Payment> findByStatus(Payment.Status status);
}
