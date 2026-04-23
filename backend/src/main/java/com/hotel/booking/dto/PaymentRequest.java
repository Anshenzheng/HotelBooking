package com.hotel.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    
    @NotNull(message = "订单ID不能为空")
    private Long orderId;
    
    @NotNull(message = "支付金额不能为空")
    private BigDecimal amount;
    
    @NotBlank(message = "支付方式不能为空")
    private String paymentMethod;
    
    private String remark;
}
