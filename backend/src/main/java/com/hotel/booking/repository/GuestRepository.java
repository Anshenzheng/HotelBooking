package com.hotel.booking.repository;

import com.hotel.booking.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    
    Optional<Guest> findByIdCard(String idCard);
    
    Optional<Guest> findByPhone(String phone);
    
    boolean existsByIdCard(String idCard);
}
