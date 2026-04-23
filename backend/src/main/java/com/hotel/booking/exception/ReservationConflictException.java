package com.hotel.booking.exception;

import lombok.Getter;

@Getter
public class ReservationConflictException extends BusinessException {
    
    public ReservationConflictException(String message) {
        super(message);
    }
}
