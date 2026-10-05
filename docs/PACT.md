# Pact contract-testing plan

Pact is reserved for the real frontend API client boundary with the Spring backend.

The consumer side should test the actual API client used by the application, not raw fetch calls.

Initial contract surface:

- Authentication/session
- Catalog/product details
- Search
- Cart
- Checkout/payment
- Orders
- Wishlist
- Account/profile

Contracts should be generated from consumer tests, then verified against the Spring provider. The contract result should become a deployment gate once the backend exposes a stable provider verification workflow.

Do not use Pact as a replacement for E2E tests or backend functional tests.
