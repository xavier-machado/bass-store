import { Products, addCartItem } from "app.js";

document.addEventListener('DOMContentLoaded', () => {
    const products = new Products();

    //get all products
    products.getProducts().then(products => {
        Storage.saveProducts(products);
    // }).then(() => {
    //     ui.getBagButtons();
    //     ui.cartLogic();
    });

})