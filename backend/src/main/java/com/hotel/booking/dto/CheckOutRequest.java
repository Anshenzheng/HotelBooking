package com.hotel.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckOutRequest {
    
    @NotNull(message = "预订ID不能为空")
    private Long reservationId;
    
    private BigDecimal extraCharge;
    
    private String remark;
}
