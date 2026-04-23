package com.hotel.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationRequest {
    
    @NotNull(message = "房间ID不能为空")
    private Long roomId;
    
    @NotBlank(message = "客人姓名不能为空")
    private String guestName;
    
    @NotBlank(message = "身份证号不能为空")
    private String guestIdCard;
    
    private String guestPhone;
    
    private String guestEmail;
    
    @NotNull(message = "入住日期不能为空")
    private LocalDate checkInDate;
    
    @NotNull(message = "退房日期不能为空")
    private LocalDate checkOutDate;
    
    private String contactPerson;
    
    private String contactPhone;
    
    private String specialRequest;
}
