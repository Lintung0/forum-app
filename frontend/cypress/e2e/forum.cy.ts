describe('Forum Functionality', () => {
  beforeEach(() => {
    cy.login('admin@gmail.com', 'secret123');
  });

  it('should navigate to a post, comment, and reply', () => {
    // Find first post card and click it
    cy.get('h2').first().click();
    
    // Check if we are on post detail page
    cy.url().should('include', '/posts/');
    
    // Post a top-level comment
    const commentText = `E2E Test Comment ${Date.now()}`;
    // TipTap editor uses contenteditable
    cy.get('.tiptap').first().type(commentText);
    cy.contains('button', 'Post Response').click();
    
    // Verify comment appeared
    cy.contains(commentText).should('be.visible');
    
    // Reply to the comment
    cy.contains(commentText)
      .parents('.group.relative') // Selector for CommentItem content area
      .find('button')
      .contains('Reply')
      .click();
      
    const replyText = `E2E Test Reply ${Date.now()}`;
    cy.get('.tiptap').last().type(replyText);
    cy.contains('button', 'Post Response').last().click();
    
    // Verify reply appeared
    cy.contains(replyText).should('be.visible');
  });

  it('should upvote a post', () => {
    cy.visit('/home');
    
    // Get initial score
    cy.get('h2').first().parent().parent().find('span.tabular-nums').first().then(($span) => {
      const initialScore = parseInt($span.text());
      
      // Click upvote
      cy.get('button').find('svg.stroke-\\[2\\.5px\\]').first().parent().click();
      
      // Check if score updated (assuming it was not voted before)
      cy.get('h2').first().parent().parent().find('span.tabular-nums').first().invoke('text').then((newScore) => {
        expect(parseInt(newScore)).to.be.oneOf([initialScore + 1, initialScore - 1]);
      });
    });
  });
});