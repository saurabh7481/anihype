if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    const cartRemoveButton = document.getElementsByClassName("btn-remove");
    for(let i=0; i<cartRemoveButton.length; i++){
        const removeButton = cartRemoveButton[i];
        removeButton.addEventListener("click", removeCartItem)
    }

    const quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (let i = 0; i < quantityInputs.length; i++) {
        const input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    const addToCartButtons = document.getElementsByClassName('add-cart-btn')
    for (let i = 0; i < addToCartButtons.length; i++) {
        const button = addToCartButtons[i]
        button.addEventListener('click', addToCart)
    }

    const sideCart = document.getElementsByClassName("cart-holder")
    sideCart[0].addEventListener("click", (e) => {
        document.querySelector("#cart").style = "display: block; z-index: 999;"
    })

    const cancelCart = document.getElementsByClassName("cancel")
    cancelCart[0].addEventListener("click", () => {
        document.querySelector("#cart").style = "display: none"
    })
}

function addToCart(e) {
    const button = e.target
    const Item = button.parentElement.parentElement
    const imageSrc = Item.getElementsByClassName('item-img')[0].src

    const itemInfo = button.parentElement
    const title = itemInfo.getElementsByClassName('item-title')[0].innerText
    const price = itemInfo.getElementsByClassName('item-price')[0].innerText
    addItemToCart(title, price, imageSrc)
    updateCartTotal()
}

function addItemToCart(title, price, imgSrc){
    const cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    const cartItems = document.getElementsByClassName('cart-items')[0]
    const cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (let i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('You have already added this item in your cart.')
            return
        }
    }
    const cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imgSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger btn-remove" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-remove')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
    alert("Added to cart!")
}

function quantityChanged(e) {
    const input = e.target;
    if(isNaN(input.value) || input.value <= 0){
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
    const cartItems = document.getElementsByClassName('cart-items')[0]
    const cartRows = cartItems.getElementsByClassName('cart-row')
    let totalPrice = 0
    for (let i = 0; i < cartRows.length; i++) {
        const cartRow = cartRows[i]
        const priceElement = cartRow.getElementsByClassName('cart-price')[0]
        const quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        const price = parseFloat(priceElement.innerText.replace('$', ''))
        const quantity = quantityElement.value
        totalPrice = totalPrice + (price * quantity)
    }
    totalPrice = Math.round(totalPrice * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + totalPrice
}

