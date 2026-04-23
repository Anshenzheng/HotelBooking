package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.entity.Order;
import com.hotel.booking.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "订单管理", description = "订单查询和管理")
public class OrderController {
    
    private final OrderService orderService;
    
    @GetMapping
    @Operation(summary = "获取所有订单")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取订单")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @GetMapping("/no/{orderNo}")
    @Operation(summary = "根据订单号获取订单")
    public ResponseEntity<ApiResponse<Order>> getOrderByNo(@PathVariable String orderNo) {
        Order order = orderService.getOrderByNo(orderNo);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @GetMapping("/guest/{guestId}")
    @Operation(summary = "根据客人ID获取订单记录")
    public ResponseEntity<ApiResponse<List<Order>>> getOrdersByGuestId(@PathVariable Long guestId) {
        List<Order> orders = orderService.getOrdersByGuestId(guestId);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "根据状态获取订单")
    public ResponseEntity<ApiResponse<List<Order>>> getOrdersByStatus(@PathVariable Order.Status status) {
        List<Order> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
}
