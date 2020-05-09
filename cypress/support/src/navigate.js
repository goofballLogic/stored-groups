export function toTenantHome() {
    const { provider } = this;
    cy.visit(`${provider.href}?tenant=${btoa(provider.tenant)}`);
}

export const linkByName = name => cy.contains("a", name).click();