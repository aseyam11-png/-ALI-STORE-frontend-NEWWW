describe("ALI STORE storefront smoke", () => {
  it("loads the storefront shell", () => {
    cy.visit("/");
    cy.get("body").should("be.visible");
    cy.document().its("readyState").should("eq", "complete");
  });
});
