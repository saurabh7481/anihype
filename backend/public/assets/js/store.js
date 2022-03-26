const productParent = document.getElementById("product-list");
const notify = new Notify();

window.addEventListener("load", () => {
  axios
    .get("http://localhost:3000/products")
    .then((data) => {
      console.log(data);
      renderProduct(data.data.result);
      ready();
    })
    .catch((err) => {
      console.log(err);
    });
});

function getPaginatedResult(page){
    axios.get(`http://localhost:3000/products?page=${page}&limit=3`).then(data => {
        console.log(data);
        renderProduct(data.data.result);
    })
}

function renderProduct(result) {
    productParent.innerHTML = "";
    result.products.forEach((product) => {
        const template = `
            <div class="col-md-4">
            <div class="product-item" id="product-${product.id}">
              <img class="item-img" src=${product.imageUrl} alt="" />
              <div class="down-content">
                <h4 class="item-title">${product.title}</h4>
                <h6 class="item-price">$${product.price}</h6>
                <p>
                  ${product.description}
                </p>
                <button class="btn btn-outline-success add-cart-btn">Add to Cart</button>
                <span>Reviews (24)</span>
              </div>
            </div>
          </div>
            `;

        productParent.innerHTML = productParent.innerHTML + template;
      });

      const pages = document.getElementById("pages");
      let pagesTemplate = "";
      console.log(result.previous, result.next);
      if(result.previous){
          pagesTemplate = `<span onclick=getPaginatedResult(${result.previous.page})>Previous</span>`
      }
      if(result.next){
        pagesTemplate += `<span onclick=getPaginatedResult(${result.next.page})>Next</span>`
      }

      pages.innerHTML = pagesTemplate;
}

function ready() {
  const cartRemoveButton = document.getElementsByClassName("btn-remove");
  for (let i = 0; i < cartRemoveButton.length; i++) {
    const removeButton = cartRemoveButton[i];
    removeButton.addEventListener("click", removeCartItem);
  }

  const quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (let i = 0; i < quantityInputs.length; i++) {
    const input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  const addToCartButtons = document.getElementsByClassName("add-cart-btn");
  for (let i = 0; i < addToCartButtons.length; i++) {
    const button = addToCartButtons[i];
    button.addEventListener("click", addToCart);
  }

  const sideCart = document.getElementsByClassName("cart-holder");
  sideCart[0].addEventListener("click", (e) => {
    axios
      .get("http://localhost:3000/cart")
      .then((data) => {
        console.log(data.data);  
        addItemToCart(data.data);
        document.querySelector("#cart").style = "display: block; z-index: 999;";
      })
      .catch((err) => {
        console.log(err);
      });
  });

  const cancelCart = document.getElementsByClassName("cancel");
  cancelCart[0].addEventListener("click", () => {
    document.querySelector("#cart").style = "display: none";
  });

  const purchaseButton = document.getElementsByClassName("purchase-btn");
  purchaseButton[0].addEventListener("click", purchase);
}

function purchase(e){
    axios.get("http://localhost:3000/purchase").then(res => {
        console.log(res);
        notify.render({
            head: "Success",
            content: res.data.message,
            style: "success",
            delay: 2000,
            corner: "bottom_right",
          });
    }).catch(err => {
        notify.render({
            head: "Oops",
            content: err,
            style: "error",
            delay: 2000,
            corner: "bottom_right",
          });
    })
}

function addToCart(e) {
  const id = e.target.parentNode.parentNode.id.split("-")[1];
  console.log(id);
  axios
    .post("http://localhost:3000/cart", { productId: id })
    .then((data) => {
      if (data.status === 200) {
        notify.render({
          head: "Success",
          content: "Product is added to cart",
          style: "success",
          delay: 2000,
          corner: "bottom_right",
        });
      } else {
        notify.render({
          head: "Info",
          content: "An error occured",
          style: "danger",
          delay: 2000,
          corner: "bottom_right",
        });
      }
    })
    .catch((err) => {
      notify.render({
        head: "Info",
        content: "An error occured",
        style: "danger",
        delay: 2000,
        corner: "bottom_right",
      });
    });
  //   const Item = button.parentElement.parentElement;
  //   const imageSrc = Item.getElementsByClassName("item-img")[0].src;

  //   const itemInfo = button.parentElement;
  //   const title = itemInfo.getElementsByClassName("item-title")[0].innerText;
  //   const price = itemInfo.getElementsByClassName("item-price")[0].innerText;
  //   addItemToCart(title, price, imageSrc);
  //   updateCartTotal();
}

function addItemToCart(data) {
  const cartItems = document.getElementsByClassName("cart-items")[0];
  cartItems.innerHTML = "";
  data.products.forEach((product) => {
    console.log(product);
    const cartRow = document.createElement("div");
    cartRow.classList.add("cart-row");  
    const cartRowContents = `
    <div class="cart-item cart-column">
        <img class="cart-item-image" src="${product.imageUrl}" width="100" height="100">
        <span class="cart-item-title">${product.title}</span>
    </div>
    <span class="cart-price cart-column">${product.price}</span>
    <div class="cart-quantity cart-column">
        <input class="cart-quantity-input" type="number" value="${product.cartItem.quantity}">
        <button class="btn btn-danger btn-remove" type="button">REMOVE</button>
    </div>`;
    cartRow.innerHTML = cartRowContents;
    cartItems.append(cartRow);
    cartRow
      .getElementsByClassName("btn-remove")[0]
      .addEventListener("click", removeCartItem);
    cartRow
      .getElementsByClassName("cart-quantity-input")[0]
      .addEventListener("change", quantityChanged);
  });
  updateCartTotal();
}

function quantityChanged(e) {
  const input = e.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function removeCartItem(e) {
  const clicked = e.target;
  clicked.parentElement.parentElement.remove();
  updateCartTotal();
}

function updateCartTotal() {
  const cartItems = document.getElementsByClassName("cart-items")[0];
  const cartRows = cartItems.getElementsByClassName("cart-row");
  let totalPrice = 0;
  for (let i = 0; i < cartRows.length; i++) {
    const cartRow = cartRows[i];
    const priceElement = cartRow.getElementsByClassName("cart-price")[0];
    const quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    const price = parseFloat(priceElement.innerText.replace("$", ""));
    const quantity = quantityElement.value;
    totalPrice = totalPrice + price * quantity;
  }
  totalPrice = Math.round(totalPrice * 100) / 100;
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + totalPrice;
}
