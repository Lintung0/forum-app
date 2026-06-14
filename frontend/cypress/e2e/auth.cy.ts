describe('Authentication', () => {
  it('should log in successfully with valid credentials', () => {
    cy.visit('/pages/login');
    cy.get('input[type="email"]').type('admin@gmail.com');
    cy.get('input[type="password"]').type('secret123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to home or dashboard
    cy.url().should('include', '/home');
    cy.contains('Voxra').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.visit('/pages/login');
    cy.get('input[type="email"]').type('wrong@gmail.com');
    cy.get('input[type="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    
    // Depending on how errors are shown, we check for alert or message
    // If it uses window.alert:
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Gagal login: Email atau password salah');
    });
  });
});