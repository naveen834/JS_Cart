const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: 'h0m12k057mkv',
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: '4YvmOKH9zbcxyLZNadpDL38U8Eea1LETwMgqvjgs1vc',
});

// variables
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
      let response = await client.getEntries();
      let products = response.items;
      products = products.map((product) => {
        const { title, price } = product.fields; //get m title and price from products field
        const { id } = product.sys;
        const image = product.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    products.forEach((product) => {
      productsDOM.innerHTML += `   
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
`;
    });
  }
  getBagButtons() {
    const buttons = [...document.getElementsByClassName('bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (e) => {
        e.target.innerText = 'In Cart';
        e.target.disabled = true;
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart item
        this.addCartItem(cartItem);
        // show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    cartContent.innerHTML += `         
<div class="cart-item">
  <img src=${item.image} alt="product img" />
  <div>    
    <h4>${item.title}</h4>
    <h5>$${item.price}</h5>
    <span class="remove-item" data-id=${item.id}>remove</span>
  </div>
  <div>
    <i class="fas fa-chevron-up" data-id=${item.id}></i>
    <p class="item-amount">${item.amount}</p>
    <i class="fas fa-chevron-down" data-id=${item.id}></i>
  </div>
</div>
`;
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
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item')) {
        let id = e.target.dataset.id;
        cartContent.removeChild(e.target.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains('fa-chevron-up')) {
        let id = e.target.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        e.target.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains('fa-chevron-down')) {
        let id = e.target.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount <= 0) {
          cartContent.removeChild(e.target.parentElement.parentElement);
          this.removeItem(id);
        }
        Storage.saveCart(cart);
        this.setCartValues(cart);
        e.target.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  // with static fns. , no need to declare instance
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  // setup application
  ui.setupAPP();
  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
