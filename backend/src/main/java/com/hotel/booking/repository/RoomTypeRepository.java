package com.hotel.booking.repository;

import com.hotel.booking.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    
    List<RoomType> findByStatus(RoomType.Status status);
    
    boolean existsByName(String name);
}
