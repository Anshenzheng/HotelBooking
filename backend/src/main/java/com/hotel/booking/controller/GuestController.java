package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.entity.Guest;
import com.hotel.booking.service.GuestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
@Tag(name = "客人管理", description = "客人信息管理")
public class GuestController {
    
    private final GuestService guestService;
    
    @GetMapping
    @Operation(summary = "获取所有客人")
    public ResponseEntity<ApiResponse<List<Guest>>> getAllGuests() {
        List<Guest> guests = guestService.getAllGuests();
        return ResponseEntity.ok(ApiResponse.success(guests));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取客人")
    public ResponseEntity<ApiResponse<Guest>> getGuestById(@PathVariable Long id) {
        Guest guest = guestService.getGuestById(id);
        return ResponseEntity.ok(ApiResponse.success(guest));
    }
    
    @GetMapping("/id-card/{idCard}")
    @Operation(summary = "根据身份证号查询客人")
    public ResponseEntity<ApiResponse<Guest>> getGuestByIdCard(@PathVariable String idCard) {
        Optional<Guest> guest = guestService.getGuestByIdCard(idCard);
        return guest.map(g -> ResponseEntity.ok(ApiResponse.success(g)))
                .orElse(ResponseEntity.ok(ApiResponse.error("客人不存在")));
    }
    
    @PostMapping
    @Operation(summary = "创建客人")
    public ResponseEntity<ApiResponse<Guest>> createGuest(@Valid @RequestBody Guest guest) {
        Guest createdGuest = guestService.createGuest(guest);
        return ResponseEntity.ok(ApiResponse.success("客人创建成功", createdGuest));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "更新客人信息")
    public ResponseEntity<ApiResponse<Guest>> updateGuest(
            @PathVariable Long id, 
            @Valid @RequestBody Guest guestDetails) {
        Guest updatedGuest = guestService.updateGuest(id, guestDetails);
        return ResponseEntity.ok(ApiResponse.success("客人信息更新成功", updatedGuest));
    }
}
