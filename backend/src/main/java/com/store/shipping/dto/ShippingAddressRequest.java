package com.store.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ShippingAddressRequest {

    @NotBlank(message = "Label is required")
    @Size(max = 80, message = "Label is too long")
    private String label;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 160, message = "Recipient name is too long")
    private String recipientName;

    @NotBlank(message = "Phone is required")
    @Size(max = 40, message = "Phone is too long")
    private String phone;

    @NotBlank(message = "Street is required")
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    private String postalCode;

    @Size(max = 100, message = "Building is too long")
    private String building;

    @Size(max = 100, message = "Apartment is too long")
    private String apartment;

    @Size(max = 2000, message = "Notes are too long")
    private String notes;

    private Boolean isDefault;
}
