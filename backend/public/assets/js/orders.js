const orders = document.getElementById("content");

window.addEventListener("load", () => {
    axios.get("http://localhost:3000/orders").then(res => {
        console.log(res);
        let template = "";
        res.data.data.forEach(order => {
            let orderTemplate = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="lead fw-normal mb-0" style="color: #a8729a;">Order ID: ${order.orderId}</p>
            </div>
            `
            let productTemplate = "";
            order.productDetail.forEach(product => {
                let temp = `
                <div class="card shadow-0 border mb-4">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-2">
                      <img src=${product.imageUrl} class="img-fluid">
                    </div>
                    <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0">${product.title}</p>
                    </div>
                    <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small">${product.description}</p>
                    </div>
                    <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small">Qty: ${product.orderItem.quantity}</p>
                    </div>
                    <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                      <p class="text-muted mb-0 small">$${product.price}</p>
                    </div>
                  </div>
                  <hr class="mb-4" style="background-color: #e0e0e0; opacity: 1;">
                </div>
              </div>
                `

                productTemplate += temp;
            })

            orderTemplate += productTemplate;
            template += orderTemplate;
        })

        orders.innerHTML = template;
    }).catch(err => {
        console.log(err);
    })
})