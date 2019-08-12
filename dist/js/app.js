const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "fw1r9muewo8o",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "ueAdI8GaXHiaN4vwvPA91ppCAoxuXNizJDL4MdPbIVs"
});

// DOM var's

const navbarCenter = document.querySelector('.navbar')
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');


// cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the products
class Products {

    async getProducts() {
        try {

            let contentful = await client.getEntries({
                content_type: "bassStore"
            });

            // JSON LOCAL FILE WAY
            // let result = await fetch('products.json');
            // let data = await result.json();
            // let products = data.items;

            let products = contentful.items;
            // destructuring the object that comes from json, not necesssary if the json is formated correctly
            products = products.map(item => {
                const { title, price, description } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image, description };
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }

}

// display products
class UI {

    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                </div>
                <h3>${product.title}</h3>
                <div class="product-info">
                    <h4>$${product.price}</h4>
                    <button class="bag-btn" data-id=${product.id}>shop now</button>
                </div>
            </article>
            `
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        // if we did it at the beggining , the products wouldn't yet be loaded
        // const buttons = document.querySelectorAll('.bag-btn');
        const buttons = [...document.querySelectorAll('.bag-btn')]; // the spread operator turns the nodelist into an array, you could use the nodelist since we're using forEach, but you can't use map, filter, reduce and some other on nodelists
        buttonsDOM = buttons;
        buttons.forEach(button => {
            // let id = button.getAttribute('data-id'); // other way to get the id
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id); // returns the first item that satisfy the condition
            // if (inCart) {
            //     button.innerText = "In Cart";
            //     button.disabled = true;
            // }
            button.addEventListener('click', event => {
                // get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 }; // we're getting from dataset
                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                // this.showCart();
                // animation small image into cart
                // let clonedImage = button.parentElement.previousElementSibling.firstElementChild.cloneNode(true);
                // clonedImage.classList.add('zoom');
                // navbarCenter.appendChild(clonedImage);
                // setTimeout(() => navbarCenter.removeChild(clonedImage), 1000);
            })
        })
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <img src="images/plus.png" data-id=${item.id} class="plus-sign">
            <p class="item-amount">${item.amount}</p>
            <img src="images/minus.png" data-id=${item.id} class="minus-sign">
        </div>`;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    cartLogic() {
        // clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart(); // this allows the "this" keyword to point to the UI class on the clearCart method
        });
        // cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if (event.target.classList.contains("plus-sign")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount++;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("minus-sign")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount--;

                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }

            }
        })
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        // let button = this.getSingleButton(id);
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

    showModal(products) {
        const images = document.querySelectorAll('.product-img');
        const modal = document.querySelector('.bg-modal');
        const modalContent = document.querySelector('.modal-content')
        const close = document.querySelector('.close');

        images.forEach(image => {
            // console.log(String(image.src).slice(-products[0].image.length))
            for (let i = 0; i < products.length; i++) {
                if (products[i].image == String(image.src).slice(-products[i].image.length)) {
                    var product = products[i];
                }
            }
            image.addEventListener('click', () => {
                let descriptionList = '';
                for (let i = 0; i < product.description.split('\n').length; i++) {
                    descriptionList += (`<li>${product.description.split('\n')[i]}</li>`)
                }
                modalContent.innerHTML += `
                        <div class="img-modal-container">
                            <img src=${product.image} class="modal-img" alt="product">
                        </div>
                        <div class="description">
                            <h3>${product.title}</h3>
                            <h4>$${product.price}</h4>
                            <ul>
                                ${descriptionList}
                            </ul>
                            <a href="product.html?id=${product.id}" data-id=${product.id}>shop now</a>
                        </div>
                    `
                modal.style.display = 'flex';
            })
        })

        close.addEventListener('click', () => {
            modal.style.display = 'none';
        })
    }

    buildProductPage(){
        const idProduct = document.location.search.replace(/^.*?\=/,)
        console.log(idProduct);
    }

}

// local storage
class Storage {

    // Static allows you to use without needing to instanciate the class
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }

    static saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    // setup app
    ui.setupAPP();

    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
        ui.showModal(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
        ui.buildProductPage();
    });

})