package com.hotel.booking.service;

import com.hotel.booking.entity.RoomType;
import com.hotel.booking.exception.BusinessException;
import com.hotel.booking.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomTypeService {
    
    private final RoomTypeRepository roomTypeRepository;
    
    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }
    
    public List<RoomType> getActiveRoomTypes() {
        return roomTypeRepository.findByStatus(RoomType.Status.ACTIVE);
    }
    
    public RoomType getRoomTypeById(Long id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("房型不存在"));
    }
    
    @Transactional
    public RoomType createRoomType(RoomType roomType) {
        if (roomTypeRepository.existsByName(roomType.getName())) {
            throw new BusinessException("房型名称已存在");
        }
        return roomTypeRepository.save(roomType);
    }
    
    @Transactional
    public RoomType updateRoomType(Long id, RoomType roomTypeDetails) {
        RoomType roomType = getRoomTypeById(id);
        
        if (!roomType.getName().equals(roomTypeDetails.getName())) {
            if (roomTypeRepository.existsByName(roomTypeDetails.getName())) {
                throw new BusinessException("房型名称已存在");
            }
        }
        
        roomType.setName(roomTypeDetails.getName());
        roomType.setDescription(roomTypeDetails.getDescription());
        roomType.setPrice(roomTypeDetails.getPrice());
        roomType.setCapacity(roomTypeDetails.getCapacity());
        roomType.setArea(roomTypeDetails.getArea());
        roomType.setBedType(roomTypeDetails.getBedType());
        roomType.setFacilities(roomTypeDetails.getFacilities());
        roomType.setImageUrl(roomTypeDetails.getImageUrl());
        roomType.setStatus(roomTypeDetails.getStatus());
        
        return roomTypeRepository.save(roomType);
    }
    
    @Transactional
    public void deleteRoomType(Long id) {
        RoomType roomType = getRoomTypeById(id);
        roomType.setStatus(RoomType.Status.INACTIVE);
        roomTypeRepository.save(roomType);
    }
}
