package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.entity.Room;
import com.hotel.booking.service.RoomService;
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
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "房间管理", description = "房间相关的CRUD操作和房态查询")
public class RoomController {
    
    private final RoomService roomService;
    
    @GetMapping
    @Operation(summary = "获取所有房间")
    public ResponseEntity<ApiResponse<List<Room>>> getAllRooms() {
        List<Room> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取房间")
    public ResponseEntity<ApiResponse<Room>> getRoomById(@PathVariable Long id) {
        Room room = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success(room));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "根据状态获取房间")
    public ResponseEntity<ApiResponse<List<Room>>> getRoomsByStatus(@PathVariable Room.Status status) {
        List<Room> rooms = roomService.getRoomsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }
    
    @GetMapping("/available")
    @Operation(summary = "查询可用房间")
    public ResponseEntity<ApiResponse<List<Room>>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        List<Room> rooms = roomService.getAvailableRooms(checkInDate, checkOutDate);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }
    
    @GetMapping("/available/by-type/{roomTypeId}")
    @Operation(summary = "根据房型查询可用房间")
    public ResponseEntity<ApiResponse<List<Room>>> getAvailableRoomsByType(
            @PathVariable Long roomTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        List<Room> rooms = roomService.getAvailableRoomsByType(roomTypeId, checkInDate, checkOutDate);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }
    
    @PostMapping
    @Operation(summary = "创建新房间")
    public ResponseEntity<ApiResponse<Room>> createRoom(@Valid @RequestBody Room room) {
        Room createdRoom = roomService.createRoom(room);
        return ResponseEntity.ok(ApiResponse.success("房间创建成功", createdRoom));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新房间")
    public ResponseEntity<ApiResponse<Room>> updateRoom(
            @PathVariable Long id, 
            @Valid @RequestBody Room roomDetails) {
        Room updatedRoom = roomService.updateRoom(id, roomDetails);
        return ResponseEntity.ok(ApiResponse.success("房间更新成功", updatedRoom));
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "更新房间状态")
    public ResponseEntity<ApiResponse<Room>> updateRoomStatus(
            @PathVariable Long id, 
            @RequestParam Room.Status status) {
        Room updatedRoom = roomService.updateRoomStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("状态更新成功", updatedRoom));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除房间")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("房间删除成功", null));
    }
}
