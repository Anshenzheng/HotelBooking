package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.PaymentRequest;
import com.hotel.booking.entity.Payment;
import com.hotel.booking.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "支付管理", description = "模拟支付和退款")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @GetMapping
    @Operation(summary = "获取所有支付记录")
    public ResponseEntity<ApiResponse<List<Payment>>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取支付记录")
    public ResponseEntity<ApiResponse<Payment>> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
    
    @GetMapping("/no/{paymentNo}")
    @Operation(summary = "根据支付号获取支付记录")
    public ResponseEntity<ApiResponse<Payment>> getPaymentByNo(@PathVariable String paymentNo) {
        Payment payment = paymentService.getPaymentByNo(paymentNo);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }
    
    @GetMapping("/order/{orderId}")
    @Operation(summary = "根据订单ID获取支付记录")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentsByOrderId(@PathVariable Long orderId) {
        List<Payment> payments = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }
    
    @PostMapping("/pay")
    @Operation(summary = "模拟支付")
    public ResponseEntity<ApiResponse<Payment>> simulatePayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.simulatePayment(request);
        return ResponseEntity.ok(ApiResponse.success("支付成功", payment));
    }
    
    @PostMapping("/{id}/refund")
    @Operation(summary = "模拟退款")
    public ResponseEntity<ApiResponse<Payment>> simulateRefund(@PathVariable Long id) {
        Payment payment = paymentService.simulateRefund(id);
        return ResponseEntity.ok(ApiResponse.success("退款成功", payment));
    }
}
