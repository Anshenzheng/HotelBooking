package com.hotel.booking.service;

import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomType;
import com.hotel.booking.exception.BusinessException;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {
    
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
    
    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new BusinessException("房间不存在"));
    }
    
    public List<Room> getRoomsByStatus(Room.Status status) {
        return roomRepository.findByStatus(status);
    }
    
    public List<Room> getAvailableRooms(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new BusinessException("入住日期不能早于今天");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new BusinessException("退房日期必须晚于入住日期");
        }
        return roomRepository.findAvailableRooms(checkInDate, checkOutDate);
    }
    
    public List<Room> getAvailableRoomsByType(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new BusinessException("入住日期不能早于今天");
        }
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isEqual(checkInDate)) {
            throw new BusinessException("退房日期必须晚于入住日期");
        }
        return roomRepository.findAvailableRoomsByType(roomTypeId, checkInDate, checkOutDate);
    }
    
    @Transactional
    public Room createRoom(Room room) {
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            throw new BusinessException("房间号已存在");
        }
        
        RoomType roomType = roomTypeRepository.findById(room.getRoomType().getId())
                .orElseThrow(() -> new BusinessException("房型不存在"));
        room.setRoomType(roomType);
        
        return roomRepository.save(room);
    }
    
    @Transactional
    public Room updateRoom(Long id, Room roomDetails) {
        Room room = getRoomById(id);
        
        if (!room.getRoomNumber().equals(roomDetails.getRoomNumber())) {
            if (roomRepository.existsByRoomNumber(roomDetails.getRoomNumber())) {
                throw new BusinessException("房间号已存在");
            }
        }
        
        RoomType roomType = roomTypeRepository.findById(roomDetails.getRoomType().getId())
                .orElseThrow(() -> new BusinessException("房型不存在"));
        
        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setFloor(roomDetails.getFloor());
        room.setRoomType(roomType);
        room.setStatus(roomDetails.getStatus());
        room.setRemark(roomDetails.getRemark());
        
        return roomRepository.save(room);
    }
    
    @Transactional
    public Room updateRoomStatus(Long id, Room.Status status) {
        Room room = getRoomById(id);
        room.setStatus(status);
        return roomRepository.save(room);
    }
    
    @Transactional
    public void deleteRoom(Long id) {
        Room room = getRoomById(id);
        if (room.getStatus() == Room.Status.OCCUPIED) {
            throw new BusinessException("房间已被占用，无法删除");
        }
        room.setStatus(Room.Status.MAINTENANCE);
        roomRepository.save(room);
    }
}
