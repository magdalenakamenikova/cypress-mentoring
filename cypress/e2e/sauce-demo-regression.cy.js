describe('Sauce Demo Regression Test Suite', () => {

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/');
    });

    describe('Login Page Tests', () => {

        it('should successfully log in with a valid user', () => {
            cy.get('#user-name').type('standard_user');
            cy.get('#password').type('secret_sauce');
            cy.get('#login-button').click();
            cy.url().should('include', '/inventory.html');
            cy.get('.header_secondary_container').should('contain', 'Products');
        });

        it('should display an error for an invalid username and password', () => {
            cy.get('#user-name').type('invalid_user');
            cy.get('#password').type('wrong_password');
            cy.get('#login-button').click();
            cy.get('.error-message-container').should('contain', 'Username and password do not match');
        });

        it('should display a "locked out" message for the locked_out_user', () => {
            cy.get('#user-name').type('locked_out_user');
            cy.get('#password').type('secret_sauce');
            cy.get('#login-button').click();
            cy.get('.error-message-container').should('contain', 'Epic sadface: Sorry, this user has been locked out.');
        });

        it('should display an error for a missing username', () => {
            cy.get('#password').type('secret_sauce');
            cy.get('#login-button').click();
            cy.get('.error-message-container').should('contain', 'Username is required');
        });

        it('should display an error for a missing password', () => {
            cy.get('#user-name').type('standard_user');
            cy.get('#login-button').click();
            cy.get('.error-message-container').should('be.visible').and('contain', 'Password is required');
        });

        it('should successfully log in the "problem user" but display broken images', () => {
            cy.get('#user-name').type('problem_user');
            cy.get('#password').type('secret_sauce');
            cy.get('#login-button').click();
            cy.url().should('include', '/inventory.html');
            cy.get('.inventory_item_img img').each(($img) => {
            cy.wrap($img).should('have.attr', 'src', '/static/media/sl-404.168b1cce.jpg');
             });
     });

        it('should confirm the user has a performance issue, but allow the test to pass', () => {

            const startTime = new Date().getTime();

            cy.get('#user-name').type('performance_glitch_user');
            cy.get('#password').type('secret_sauce');
            cy.get('#login-button').click();

            cy.url().should('include', '/inventory.html').then(() => {
                const endTime = new Date().getTime();
                const duration = endTime - startTime;

                const expectedMinDuration = 2000; // The minimum duration to be considered "slow"
                const maxExpectedDuration = 8000; // An upper bound to prevent the test from hanging indefinitely

                expect(duration).to.be.within(expectedMinDuration, maxExpectedDuration);
                cy.log(`Login took ${duration}ms, which is within the expected slow range.`);
            });
        });

        it('should log in the "performance user" after a performance delay', () => {
            cy.get('#user-name').type('performance_glitch_user');
            cy.get('#password').type('secret_sauce');
            cy.get('#login-button').click();
            cy.url().should('include', '/inventory.html');
        });
    });

    describe('Products & Cart Tests', () => {

        beforeEach(() => {
            cy.get('#user-name').type('standard_user');
            cy.get('#password').type('secret_sauce');
            cy.get('#login-button').click();
            cy.url().should('include', '/inventory.html');
        });

        it('should display all key UI elements on Inventory page', () => {
            cy.get('.app_logo').should('be.visible').and('contain', 'Swag Labs');
            cy.get('.shopping_cart_link').should('be.visible');
            cy.get('.bm-burger-button').should('be.visible');
            cy.get('.inventory_item').should('have.length.gt', 0);
        });

        it('should add a product to the cart and update the cart badge', () => {
            cy.get('#add-to-cart-sauce-labs-backpack').click();
            cy.get('.shopping_cart_badge').should('be.visible').and('contain', '1');
        });

        it('should remove a product from the cart', () => {
 
            cy.get('#add-to-cart-sauce-labs-backpack').click();
            cy.get('.shopping_cart_badge').should('contain', '1');

            cy.get('#remove-sauce-labs-backpack').click();
            cy.get('.shopping_cart_badge').should('not.exist');
        });

        it('should successfully complete a full checkout process', () => {
            cy.get('#add-to-cart-sauce-labs-backpack').click();
            cy.get('.shopping_cart_badge').should('contain', '1');
            cy.get('.shopping_cart_link').click();
            cy.url().should('include', '/cart.html');
            cy.get('.cart_list').should('be.visible');
            cy.get('#checkout').click();
            cy.url().should('include', '/checkout-step-one.html');
            cy.get('.title').should('contain', 'Checkout: Your Information');
            cy.get('#first-name').type('Jane');
            cy.get('#last-name').type('Doe');
            cy.get('#postal-code').type('12345');
            cy.get('#continue').click();
            cy.url().should('include', '/checkout-step-two.html');
            cy.get('.title').should('contain', 'Checkout: Overview');
            cy.get('.inventory_item_name').should('contain', 'Sauce Labs Backpack');
            cy.get('#finish').click();
            cy.url().should('include', '/checkout-complete.html');
            cy.get('.complete-header').should('contain', 'Thank you for your order!');
        });

        it('should be able to add an item to the cart from the product details page', () => {
            cy.get('.inventory_item_name').first().click();
            cy.url().should('include', '/inventory-item.html');
            cy.get('.btn_primary').click();
            cy.get('.shopping_cart_badge').should('contain', '1');
        });

    });

    describe('Product Price Validation Tests', () => {

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/');
        cy.get('#user-name').type('standard_user');
        cy.get('#password').type('secret_sauce');
        cy.get('#login-button').click();
        cy.url().should('include', '/inventory.html');
    });

    it('should validate that all product prices are in a correct format', () => {

        cy.get('.inventory_item_price').each(($priceElement) => {
            const priceText = $priceElement.text();
            
            expect(priceText).to.match(/^\$/);
            
            const priceNumber = parseFloat(priceText.substring(1));
            expect(priceNumber).to.be.a('number');
            expect(priceNumber).to.not.be.NaN;
        });
    });

    it('should validate the price for each product on the page', () => {
  
        const expectedPrices = {
            'Sauce Labs Backpack': '$29.99',
            'Sauce Labs Bike Light': '$9.99',
            'Sauce Labs Bolt T-Shirt': '$15.99',
            'Sauce Labs Fleece Jacket': '$49.99',
            'Sauce Labs Onesie': '$7.99',
            'Test.allTheThings() T-Shirt (Red)': '$15.99',
        };

        cy.get('.inventory_item').each(($item) => {
            const productName = $item.find('.inventory_item_name').text();
            const actualPrice = $item.find('.inventory_item_price').text();
            const expectedPrice = expectedPrices[productName];
            expect(actualPrice).to.equal(expectedPrice);
        });
    });

    });

    describe('Product Sorting Tests', () => {

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/');
        cy.get('#user-name').type('standard_user');
        cy.get('#password').type('secret_sauce');
        cy.get('#login-button').click();
        cy.url().should('include', '/inventory.html');
    });

    it('should sort products by name from A to Z', () => {
        cy.get('.product_sort_container').select('az');
        
        cy.get('.inventory_item_name').then(($names) => {
            const names = $names.toArray().map((el) => el.innerText);
            const sortedNames = [...names].sort();
            expect(names).to.deep.equal(sortedNames);
        });
    });

    it('should sort products by name from Z to A', () => {
        cy.get('.product_sort_container').select('za');
        
        cy.get('.inventory_item_name').then(($names) => {
            const names = $names.toArray().map((el) => el.innerText);
            const sortedNames = [...names].sort().reverse();
            expect(names).to.deep.equal(sortedNames);
        });
    });

    it('should sort products by price from low to high', () => {
        cy.get('.product_sort_container').select('lohi');
        
        cy.get('.inventory_item_price').then(($prices) => {
            const prices = $prices.toArray().map((el) => parseFloat(el.innerText.replace('$', '')));
            const sortedPrices = [...prices].sort((a, b) => a - b);
            expect(prices).to.deep.equal(sortedPrices);
        });
    });

    it('should sort products by price from high to low', () => {
        cy.get('.product_sort_container').select('hilo');
        
        cy.get('.inventory_item_price').then(($prices) => {
            const prices = $prices.toArray().map((el) => parseFloat(el.innerText.replace('$', '')));
            const sortedPrices = [...prices].sort((a, b) => b - a);
            expect(prices).to.deep.equal(sortedPrices);
        });
    });
});


    describe('Logout Test for All Users', () => {
    const users = ['standard_user', 'locked_out_user', 'problem_user', 'performance_glitch_user'];
    const password = 'secret_sauce';

    users.forEach((username) => {
        it(`should successfully log out as ${username}`, () => {
            cy.visit('https://www.saucedemo.com/');

            cy.get('#user-name').type(username);
            cy.get('#password').type(password);
            cy.get('#login-button').click();

            if (username === 'locked_out_user') {
                cy.url().should('eq', 'https://www.saucedemo.com/');
                cy.get('.error-message-container').should('be.visible');
                return; 
            }

            cy.url().should('include', '/inventory.html');
            cy.get('#react-burger-menu-btn').click();
            cy.get('#logout_sidebar_link').click();

            cy.url().should('eq', 'https://www.saucedemo.com/');
            cy.get('#login-button').should('be.visible');
        });
    });
    });

});