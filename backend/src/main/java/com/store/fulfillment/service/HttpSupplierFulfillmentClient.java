package com.store.fulfillment.service;

import com.store.fulfillment.dto.SupplierFulfillmentRequest;
import com.store.fulfillment.dto.SupplierFulfillmentResponse;
import com.store.supplier.entity.Supplier;
import com.store.supplier.service.SupplierCredentialResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;

@Component
@RequiredArgsConstructor
public class HttpSupplierFulfillmentClient implements SupplierFulfillmentClient {

    private final Environment environment;
    private final SupplierCredentialResolver credentialResolver;

    @Override
    public SupplierFulfillmentResponse submit(Supplier supplier, SupplierFulfillmentRequest request) {
        if (!Boolean.TRUE.equals(supplier.getFulfillmentEnabled())) {
            throw new SupplierFulfillmentException("Supplier fulfillment is disabled", false);
        }
        if (supplier.getApiBaseUrl() == null || supplier.getApiBaseUrl().isBlank()) {
            throw new SupplierFulfillmentException(
                    "Supplier fulfillment API is not configured for supplier " + supplier.getExternalCode(), false);
        }

        String apiPath = environment.getProperty("app.fulfillment.api-path", "/v1/orders");
        String apiToken = credentialResolver.resolveApiToken(supplier);
        if (apiToken.isBlank()) {
            throw new SupplierFulfillmentException(
                    "No supplier API token is configured for " + supplier.getExternalCode(), false);
        }

        String endpoint = supplier.getApiBaseUrl().replaceAll("/+$", "") + apiPath;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(8000);

        try {
            SupplierFulfillmentResponse response = RestClient.builder()
                    .requestFactory(factory)
                    .build()
                    .post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiToken)
                    .header("Idempotency-Key", request.getIdempotencyKey())
                    .body(request)
                    .retrieve()
                    .body(SupplierFulfillmentResponse.class);

            if (response == null || !Boolean.TRUE.equals(response.getAccepted())
                    || response.getSupplierOrderId() == null || response.getSupplierOrderId().isBlank()) {
                throw new SupplierFulfillmentException(
                        "Supplier rejected or returned an invalid fulfillment response", false);
            }
            return response;
        } catch (HttpStatusCodeException ex) {
            int status = ex.getStatusCode().value();
            boolean retryable = status == 408 || status == 429 || status >= 500;
            throw new SupplierFulfillmentException(
                    "Supplier fulfillment request returned HTTP " + status, ex, retryable);
        } catch (ResourceAccessException ex) {
            throw new SupplierFulfillmentException(
                    "Supplier fulfillment request could not reach the supplier", ex, true);
        } catch (RestClientException ex) {
            throw new SupplierFulfillmentException(
                    "Supplier fulfillment request failed", ex, false);
        }
    }
}
