package com.hotel.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckInRequest {
    
    @NotNull(message = "预订ID不能为空")
    private Long reservationId;
    
    private String remark;
}
