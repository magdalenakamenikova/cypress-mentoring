describe('Applifting Website Tests', () => {

  beforeEach(() => {
    cy.visit('https://applifting.io/');
  });

  it('should be able to visit the homepage and navigate to the Services page', () => {
    cy.contains('a', 'Services').click();
    cy.url().should('include', '/services');
  });

  it('should be able to navigate to the Contact page and check that there is the form with right inputs.', () => {
    cy.get('[data-framer-name="menu"]').eq(1).click();
    cy.contains('a', 'Contact').click();
    cy.url().should('include', '/contact');
    
    cy.get('h2').should('contain', 'Let\'s talk');
    cy.get('input[placeholder="Your first name"]').should('exist');
    cy.get('input[placeholder="Your last name"]').should('exist');
    cy.get('input[placeholder="Your company name"]').should('exist');
    cy.get('input[placeholder="you@company.com"]').should('exist');
    cy.get('input[placeholder="Your phone number"]').should('exist');
    cy.get('textarea[placeholder="No need to hold back. Big ideas welcome."]').should('exist');
  });

  it('should navigate to the Blog page and display blog posts', () => {
    cy.get('[data-framer-name="menu"]').eq(1).click(); 
    cy.contains('a', 'Blog').click();
    cy.url().should('include', '/blog');
    cy.get('h1').should('contain', 'Blog');
  });


});