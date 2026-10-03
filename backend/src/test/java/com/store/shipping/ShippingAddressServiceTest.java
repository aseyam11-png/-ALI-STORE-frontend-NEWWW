package com.store.shipping;

import com.store.shipping.dto.ShippingAddressRequest;
import com.store.shipping.dto.ShippingAddressResponse;
import com.store.shipping.entity.ShippingAddress;
import com.store.shipping.repository.ShippingAddressRepository;
import com.store.shipping.service.ShippingAddressService;
import com.store.user.entity.User;
import com.store.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShippingAddressServiceTest {

    @Mock
    private ShippingAddressRepository shippingAddressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ShippingAddressService service;

    @Test
    void createAddress_persistsCompleteCheckoutAddressContract() {
        User user = User.builder()
                .firstName("Abood")
                .lastName("Seyam")
                .email("customer@example.com")
                .build();

        ShippingAddressRequest request = new ShippingAddressRequest();
        request.setLabel("Home");
        request.setRecipientName("Abood Seyam");
        request.setPhone("+970599000000");
        request.setStreet("Main Street");
        request.setCity("Gaza");
        request.setState("Rimal");
        request.setCountry("PS");
        request.setPostalCode("00000");
        request.setBuilding("12");
        request.setApartment("4");
        request.setNotes("Call on arrival");
        request.setIsDefault(true);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(shippingAddressRepository.save(any(ShippingAddress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ShippingAddressResponse response = service.createAddress(user.getEmail(), request);

        ArgumentCaptor<ShippingAddress> captor = ArgumentCaptor.forClass(ShippingAddress.class);
        verify(shippingAddressRepository).clearDefaultForUser(user.getId());
        verify(shippingAddressRepository).save(captor.capture());

        ShippingAddress saved = captor.getValue();
        assertEquals("Home", saved.getLabel());
        assertEquals("Abood Seyam", saved.getRecipientName());
        assertEquals("+970599000000", saved.getPhone());
        assertEquals("Main Street", saved.getStreet());
        assertEquals("Gaza", saved.getCity());
        assertEquals("Rimal", saved.getState());
        assertEquals("PS", saved.getCountry());
        assertEquals("00000", saved.getPostalCode());
        assertEquals("12", saved.getBuilding());
        assertEquals("4", saved.getApartment());
        assertEquals("Call on arrival", saved.getNotes());
        assertTrue(saved.getIsDefault());

        assertEquals("Home", response.getLabel());
        assertEquals("Abood Seyam", response.getRecipientName());
        assertEquals("+970599000000", response.getPhone());
        assertEquals("Rimal", response.getState());
        assertEquals("12", response.getBuilding());
        assertEquals("4", response.getApartment());
        assertEquals("Call on arrival", response.getNotes());
        assertTrue(response.getIsDefault());
    }

    @Test
    void updateAddress_replacesPersistedCheckoutFields_andKeepsDefaultExclusiveOperation() {
        User user = User.builder()
                .firstName("Abood")
                .lastName("Seyam")
                .email("customer@example.com")
                .build();

        ShippingAddress existing = ShippingAddress.builder()
                .id(7L)
                .user(user)
                .label("Old")
                .recipientName("Old Name")
                .phone("000")
                .street("Old Street")
                .city("Old City")
                .country("PS")
                .isDefault(true)
                .build();

        ShippingAddressRequest request = new ShippingAddressRequest();
        request.setLabel("Work");
        request.setRecipientName("New Name");
        request.setPhone("111");
        request.setStreet("New Street");
        request.setCity("Gaza");
        request.setState("Beach");
        request.setCountry("PS");
        request.setBuilding("99");
        request.setApartment("2");
        request.setNotes("Reception");
        request.setIsDefault(true);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(shippingAddressRepository.findByIdAndUserId(7L, user.getId()))
                .thenReturn(Optional.of(existing));
        when(shippingAddressRepository.save(any(ShippingAddress.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ShippingAddressResponse response = service.updateAddress(user.getEmail(), 7L, request);

        verify(shippingAddressRepository).clearDefaultForUser(user.getId());
        verify(shippingAddressRepository).save(existing);

        assertEquals("Work", existing.getLabel());
        assertEquals("New Name", existing.getRecipientName());
        assertEquals("111", existing.getPhone());
        assertEquals("New Street", existing.getStreet());
        assertEquals("Beach", existing.getState());
        assertEquals("99", existing.getBuilding());
        assertEquals("2", existing.getApartment());
        assertEquals("Reception", existing.getNotes());
        assertTrue(existing.getIsDefault());
        assertTrue(response.getIsDefault());
    }
}
