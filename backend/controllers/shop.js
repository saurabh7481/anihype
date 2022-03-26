const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require("../models/order");

const ITEM_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || ITEM_PER_PAGE;

  const startIdx = (page - 1)*limit;
  const lastIdx = page * limit;

  const result = {};

  Product.findAll().then(products => {
    if (lastIdx < products.length) {
      result.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIdx > 0) {
      result.previous = {
        page: page - 1,
        limit: limit,
      };
    }
  })

  
  Product.findAll({
    offset: startIdx,
    limit: limit
  })
    .then(products => {
      result.products = products;
      res.json({result});
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          // res.render('shop/cart', {
          //   path: '/cart',
          //   pageTitle: 'Your Cart',
          //   products: products
          // });
          res.json({products});
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(() => {
      res.status(200).send({message: "Success"})
    })
    .catch(err => {
      res.status(500);
    });
};

exports.postOrder = async (req, res, next) => {
  try{
    const cart = await req.user.getCart();
    const products = await cart.getProducts();
    const order = await req.user.createOrder();
    await order.addProducts(products.map(product => {
      product.orderItem = {
        quantity: product.cartItem.quantity
      }
      return product;
    }))

    await cart.setProducts(null);
    res.status(200).json({message: "Order placed!"})
  } catch(err) {
    res.status(500).json({err: err})
  }

}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getOrders = async (req, res, next) => {
  try{
    const result = [];
    const orders = await req.user.getOrders();
    await Promise.all(orders.map(async (order) => {
      const obj = {};
      obj.orderId = order.id;
      const o = await Order.findByPk(order.id);
      const products = await o.getProducts();
      const p = [];
      products.map(product => {
        p.push(product.dataValues);
      })
      obj.productDetail = p;
      result.push(obj);
      console.log(result);

    }))
    res.status(200).json({data: result});
  } catch(err) {
    res.status(500).json({err: err})
  }
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
