package com.hotel.booking.service;

import com.hotel.booking.dto.PaymentRequest;
import com.hotel.booking.entity.Order;
import com.hotel.booking.entity.Payment;
import com.hotel.booking.entity.Reservation;
import com.hotel.booking.exception.BusinessException;
import com.hotel.booking.repository.OrderRepository;
import com.hotel.booking.repository.PaymentRepository;
import com.hotel.booking.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;
    
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("支付记录不存在"));
    }
    
    public Payment getPaymentByNo(String paymentNo) {
        return paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new BusinessException("支付记录不存在"));
    }
    
    public List<Payment> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
    
    @Transactional
    public Payment simulatePayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException("订单不存在"));
        
        if (order.getStatus() == Order.Status.CANCELLED) {
            throw new BusinessException("订单已取消，无法支付");
        }
        
        if (order.getStatus() == Order.Status.REFUNDED) {
            throw new BusinessException("订单已退款，无法支付");
        }
        
        BigDecimal remainingAmount = order.getTotalAmount().subtract(order.getPaidAmount());
        if (request.getAmount().compareTo(remainingAmount) > 0) {
            throw new BusinessException("支付金额不能大于剩余金额");
        }
        
        Payment.PaymentMethod paymentMethod;
        try {
            paymentMethod = Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("不支持的支付方式");
        }
        
        Payment payment = new Payment();
        payment.setPaymentNo("PAY" + System.currentTimeMillis());
        payment.setOrder(order);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(paymentMethod);
        payment.setStatus(Payment.Status.PENDING);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setRemark(request.getRemark());
        
        payment = paymentRepository.save(payment);
        
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        payment.setStatus(Payment.Status.SUCCESS);
        payment.setCompletedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);
        
        order.setPaidAmount(order.getPaidAmount().add(request.getAmount()));
        order.setPaymentMethod(request.getPaymentMethod());
        if (order.getPaidAmount().compareTo(order.getTotalAmount()) >= 0) {
            order.setStatus(Order.Status.PAID);
            order.setPaidAt(LocalDateTime.now());
        }
        orderRepository.save(order);
        
        Reservation reservation = order.getReservation();
        if (reservation != null) {
            reservation.setPaidAmount(reservation.getPaidAmount().add(request.getAmount()));
            reservationRepository.save(reservation);
        }
        
        return payment;
    }
    
    @Transactional
    public Payment simulateRefund(Long paymentId) {
        Payment payment = getPaymentById(paymentId);
        
        if (payment.getStatus() != Payment.Status.SUCCESS) {
            throw new BusinessException("只有支付成功的记录才能退款");
        }
        
        payment.setStatus(Payment.Status.CANCELLED);
        payment.setCompletedAt(LocalDateTime.now());
        
        Order order = payment.getOrder();
        order.setPaidAmount(order.getPaidAmount().subtract(payment.getAmount()));
        if (order.getPaidAmount().compareTo(BigDecimal.ZERO) <= 0) {
            order.setStatus(Order.Status.REFUNDED);
            order.setPaidAmount(BigDecimal.ZERO);
        }
        orderRepository.save(order);
        
        return paymentRepository.save(payment);
    }
}
