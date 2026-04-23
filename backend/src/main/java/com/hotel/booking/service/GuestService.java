package com.hotel.booking.service;

import com.hotel.booking.entity.Guest;
import com.hotel.booking.exception.BusinessException;
import com.hotel.booking.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GuestService {
    
    private final GuestRepository guestRepository;
    
    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }
    
    public Guest getGuestById(Long id) {
        return guestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("客人信息不存在"));
    }
    
    public Optional<Guest> getGuestByIdCard(String idCard) {
        return guestRepository.findByIdCard(idCard);
    }
    
    @Transactional
    public Guest createOrFindGuest(Guest guest) {
        Optional<Guest> existingGuest = guestRepository.findByIdCard(guest.getIdCard());
        if (existingGuest.isPresent()) {
            Guest g = existingGuest.get();
            if (guest.getName() != null) g.setName(guest.getName());
            if (guest.getPhone() != null) g.setPhone(guest.getPhone());
            if (guest.getEmail() != null) g.setEmail(guest.getEmail());
            if (guest.getAddress() != null) g.setAddress(guest.getAddress());
            return guestRepository.save(g);
        }
        return guestRepository.save(guest);
    }
    
    @Transactional
    public Guest createGuest(Guest guest) {
        if (guestRepository.existsByIdCard(guest.getIdCard())) {
            throw new BusinessException("客人身份证号已存在");
        }
        return guestRepository.save(guest);
    }
    
    @Transactional
    public Guest updateGuest(Long id, Guest guestDetails) {
        Guest guest = getGuestById(id);
        
        if (!guest.getIdCard().equals(guestDetails.getIdCard())) {
            if (guestRepository.existsByIdCard(guestDetails.getIdCard())) {
                throw new BusinessException("身份证号已存在");
            }
        }
        
        guest.setName(guestDetails.getName());
        guest.setIdCard(guestDetails.getIdCard());
        guest.setPhone(guestDetails.getPhone());
        guest.setEmail(guestDetails.getEmail());
        guest.setAddress(guestDetails.getAddress());
        guest.setBirthday(guestDetails.getBirthday());
        guest.setGender(guestDetails.getGender());
        
        return guestRepository.save(guest);
    }
}
