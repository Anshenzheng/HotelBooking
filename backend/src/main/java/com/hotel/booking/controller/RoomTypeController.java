package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.entity.RoomType;
import com.hotel.booking.service.RoomTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
@Tag(name = "房型管理", description = "房型相关的CRUD操作")
public class RoomTypeController {
    
    private final RoomTypeService roomTypeService;
    
    @GetMapping
    @Operation(summary = "获取所有房型")
    public ResponseEntity<ApiResponse<List<RoomType>>> getAllRoomTypes() {
        List<RoomType> roomTypes = roomTypeService.getAllRoomTypes();
        return ResponseEntity.ok(ApiResponse.success(roomTypes));
    }
    
    @GetMapping("/active")
    @Operation(summary = "获取所有启用的房型")
    public ResponseEntity<ApiResponse<List<RoomType>>> getActiveRoomTypes() {
        List<RoomType> roomTypes = roomTypeService.getActiveRoomTypes();
        return ResponseEntity.ok(ApiResponse.success(roomTypes));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取房型")
    public ResponseEntity<ApiResponse<RoomType>> getRoomTypeById(@PathVariable Long id) {
        RoomType roomType = roomTypeService.getRoomTypeById(id);
        return ResponseEntity.ok(ApiResponse.success(roomType));
    }
    
    @PostMapping
    @Operation(summary = "创建新房型")
    public ResponseEntity<ApiResponse<RoomType>> createRoomType(@Valid @RequestBody RoomType roomType) {
        RoomType createdRoomType = roomTypeService.createRoomType(roomType);
        return ResponseEntity.ok(ApiResponse.success("房型创建成功", createdRoomType));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新房型")
    public ResponseEntity<ApiResponse<RoomType>> updateRoomType(
            @PathVariable Long id, 
            @Valid @RequestBody RoomType roomTypeDetails) {
        RoomType updatedRoomType = roomTypeService.updateRoomType(id, roomTypeDetails);
        return ResponseEntity.ok(ApiResponse.success("房型更新成功", updatedRoomType));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "删除房型")
    public ResponseEntity<ApiResponse<Void>> deleteRoomType(@PathVariable Long id) {
        roomTypeService.deleteRoomType(id);
        return ResponseEntity.ok(ApiResponse.success("房型删除成功", null));
    }
}
