const express = require("express");
const route = express.Router();
const exe = require('./../connection');

const nodemailer = require("nodemailer");

const url = require("url");

route.get("/", async function (req, res) {
    var url_data = url.parse(req.url, true).query;

    var cond = '';
    if (url_data.category_name) {
        cond = `where  product_category = '${url_data.category_name}'`;
    }
    if (url_data.product_color) {
        cond = `where  product_color = '${url_data.product_color}'`;
    }
    if (url_data.product_company) {
        cond = `where  product_company = '${url_data.product_company}'`;
    }
    if (url_data.product_name) {
        cond = `where  product_name = '${url_data.product_name}'`;
    }
    var data = await exe(`SELECT * FROM ultras_project `);
    var slider = await exe(`SELECT * FROM slider `);
    var company = await exe(`SELECT product_company FROM product_detail GROUP BY product_company`);
    var color = await exe(`SELECT product_color FROM product_detail GROUP BY product_color`);
    var category = await exe(`SELECT * FROM category`);
    var sql = `SELECT * ,
    (SELECT MIN(product_price) FROM product_pricing
    WHERE product_detail.product_id = product_pricing.product_id
    AND product_price > 0) AS price,

    (SELECT MAX(product_duplicate_price) FROM product_pricing
    WHERE product_detail.product_id = product_pricing.product_id
    AND product_duplicate_price > 0) AS product_duplicate_price FROM product_detail `+ cond;

    var products = await exe(sql);
    var obj = { "about_company": data, "slider": slider, "category": category, "company": company, "color": color, "is_login": is_login(req), "products": products };
    res.render("user/index.ejs", obj);
});
route.get("/about", async function (req, res) {
    var data = await exe(`SELECT * FROM ultras_project `);
    var company = await exe(`SELECT product_company FROM product_detail GROUP BY product_company`);
    var obj = { "about_company": data, "company": company, "is_login": is_login(req) };

    res.render("user/about.ejs", obj);

})
route.get("/shop", async function (req, res) {


    var url_data = url.parse(req.url, true).query;

    var cond = '';
    if (url_data.category_name) {
        cond = `where  product_category = '${url_data.category_name}'`;
    }
    if (url_data.product_color) {
        cond = `where  product_color = '${url_data.product_color}'`;
    }
    if (url_data.product_company) {
        cond = `where  product_company = '${url_data.product_company}'`;
    }
    if (url_data.product_name) {
        cond = `where  product_name = '${url_data.product_name}'`;
    }

    var data = await exe(`SELECT * FROM ultras_project `);
    var category = await exe(`SELECT * FROM category`);
    var company = await exe(`SELECT product_company FROM product_detail GROUP BY product_company`);
    var color = await exe(`SELECT product_color FROM product_detail GROUP BY product_color`);
    var sql = `SELECT * ,
    (SELECT MIN(product_price) FROM product_pricing
    WHERE product_detail.product_id = product_pricing.product_id
    AND product_price > 0) AS price,

    (SELECT MAX(product_duplicate_price) FROM product_pricing
    WHERE product_detail.product_id = product_pricing.product_id
    AND product_duplicate_price > 0) AS product_duplicate_price FROM product_detail `+ cond;

    var product = await exe(sql);
    // console.log(product)
    var obj = { "about_company": data, "company": company, "category": category, "color": color, "product": product, "is_login": is_login(req) };
    res.render("user/shop.ejs", obj);

})
route.get("/blog", async function (req, res) {
    var data = await exe(`SELECT * FROM ultras_project `);
    var obj = { "about_company": data, "is_login": is_login(req) };
    res.render("user/blog.ejs", obj);

})
route.get("/contact", async function (req, res) {
    var data = await exe(`SELECT * FROM ultras_project `);
    var obj = { "about_company": data, "is_login": is_login(req) };
    res.render("user/contact.ejs", obj);

})
route.get("/view_product/:id", async function (req, res) {
    var id = req.params.id;
    var product = await exe(`SELECT * FROM product_detail WHERE product_id = '${id}'`);
    var price = await exe(`SELECT * FROM product_pricing WHERE product_id = '${id}'`);
    var data = await exe(`SELECT * FROM ultras_project `);
    var obj = { "about_company": data, "product_info": product, "price": price, "is_login": is_login(req) };
    res.render("user/view_product.ejs", obj);
})
route.post("/register", async function (req, res) {
    var d = req.body;
    var sql = `INSERT INTO user_register(user_name,user_email,user_mobile,user_id,user_password) VALUES(?,?,?,?,?)`;
    var data = await exe(sql, [d.user_name, d.user_email, d.user_mobile, d.user_id, d.user_password]);
    res.redirect("/login_user");
})
route.get("/login_user", function (req, res) {
    res.render("user/user_login.ejs")
})
//user varification

route.post("/login_user", async function (req, res) {
    var d = req.body;
    var data = await exe(`SELECT * FROM user_register WHERE user_id='${d.user_id}' AND user_password = '${d.user_password}'`);
    if (data.length > 0) {
        // valid user
        req.session.user_id = d.user_id;
        res.redirect("/");
    } else {
        // invalid user
        res.redirect("/login_user?invalid_user=1");
    }
})

function is_login(req, res, next) {
    var user_id = req.session.user_id;
    if (user_id == undefined) {
        return false;
    }
    else {
        return true;
    }
}

route.get("/logout_user", function (req, res) {
    req.session.user_id = undefined;
    res.redirect("/");
})
route.get("/add_to_cart/:product_id/:product_pricing_id", async function (req, res) {
    var user_id = req.session.user_id;
    if (user_id == undefined) {
        res.redirect("/login_user");
    }
    var product_id = req.params.product_id;
    var product_pricing_id = req.params.product_pricing_id;
    var sql = `INSERT INTO add_to_cart(product_id,product_pricing_id,user_id,qty) VALUES('${product_id}','${product_pricing_id}','${user_id}',1)`;
    var data = await exe(sql);
    res.redirect("/shop");


})
route.get("/cart", async function (req, res) {

    var sql = `SELECT * FROM product_detail ,product_pricing , add_to_cart
        WHERE
        product_detail.product_id = product_pricing.product_id
        AND
        product_pricing.product_pricing_id = add_to_cart.product_pricing_id
        AND
        product_detail.product_id = add_to_cart.product_id
        AND
        add_to_cart.user_id = '${req.session.user_id}';`;

    var cart = await exe(sql);

    var data = await exe(`SELECT * FROM ultras_project `);
    var obj = { "about_company": data, "is_login": is_login(req), "cart": cart };

    res.render("user/cart.ejs", obj);
})
//cart item delete
route.get("/delete/:id", async function (req, res) {
    var id = req.params.id;
    var del = await exe(`DELETE FROM add_to_cart WHERE cart_id = '${id}'`);
    res.redirect("/cart")
})
//change quantity
route.get("/quantity/:cart_id/:op", async function (req, res) {
    var cart_id = req.params.cart_id;
    var op = req.params.op;
    var oldqty = await exe(`SELECT * FROM add_to_cart WHERE cart_id=' ${cart_id}'`);

    if (op == 'inc') {
        var qty = await exe(`UPDATE add_to_cart SET qty = qty+1 WHERE cart_id=' ${cart_id}'`);
    } else if (op == 'dec' && oldqty[0].qty > 1) {
        var qty = await exe(`UPDATE add_to_cart SET qty = qty-1 WHERE cart_id=' ${cart_id}'`);
    }
    res.redirect("/cart");
})
//checkout 

route.get("/checkout", async function (req, res) {
    var ord_det = await exe(`SELECT * FROM order_det WHERE customer_id = '${req.session.user_id}'`);
    var sql = `SELECT * FROM product_detail ,product_pricing , add_to_cart
        WHERE
        product_detail.product_id = product_pricing.product_id
        AND
        product_pricing.product_pricing_id = add_to_cart.product_pricing_id
        AND
        product_detail.product_id = add_to_cart.product_id
        AND
        add_to_cart.user_id = '${req.session.user_id}';`;

    var cart = await exe(sql);

    var data = await exe(`SELECT * FROM ultras_project `);
    var obj = { "about_company": data, "is_login": is_login(req), "cart": cart, "ord_det": ord_det };

    res.render("user/checkout.ejs", obj);
})
route.post("/order_info/:order_id", async function (req, res) {
    var data = await exe(`UPDATE order_tbl SET payment_status = 'paid' WHERE order_id = '${req.params.order_id}'`);
    res.redirect("/order_info/" + req.params.order_id);
})
//order
route.post("/order", async function (req, res) {
    var d = req.body;


    var sql4 = `SELECT * FROM product_detail ,product_pricing , add_to_cart
        WHERE
        product_detail.product_id = product_pricing.product_id
        AND
        product_pricing.product_pricing_id = add_to_cart.product_pricing_id
        AND
        product_detail.product_id = add_to_cart.product_id
        AND
        add_to_cart.user_id = '${req.session.user_id}';`;

    var cart = await exe(sql4);

    var today = new Date().toISOString().slice(0, 10);
    var sql = `
        INSERT INTO order_tbl
        (customer_name, customer_mobile, customer_state, customer_district,
        customer_city, customer_area, customer_landmark, customer_pincode,
        payment_type, order_date, order_amount, payment_status, order_status,transaction_id)
        VALUES
        (
        '${d.customer_name}',
        '${d.customer_mobile}',
        '${d.customer_state}',
        '${d.customer_district}',
        '${d.customer_city}',
        '${d.customer_area}',
        '${d.customer_landmark}',
        '${d.customer_pincode}',
        '${d.payment_type}',
        '${today}',
        '${d.order_amount}',
        'pending',
        'pending',
        ''
        )
        `;
    var data = await exe(sql);


    var order_id = data.insertId;
    for (var i = 0; i < cart.length; i++) {

        var sql1 = `
            INSERT INTO order_det
            (
                order_id,
                product_id,
                customer_id,
                product_pricing_id,
                product_name,
                product_price,
                product_color,
                product_size,
                product_image1,
                product_company,
                product_qty,
                product_total
            )
            VALUES
            (
                '${order_id}',
                '${cart[i].product_id}',
                '${req.session.user_id}',
                '${cart[i].product_pricing_id}',
                '${cart[i].product_name}',
                '${cart[i].product_price}',
                '${cart[i].product_color}',
                '${cart[i].product_size}',
                '${cart[i].product_image1}',
                '${cart[i].product_company}',
                ${cart[i].qty},
                ${cart[i].qty * cart[i].product_price}
            )
        `;

        var data1 = await exe(sql1);
    }
    var data2 = await exe(`DELETE FROM add_to_cart WHERE user_id = '${req.session.user_id}'`);

    if (d.payment_type == 'online') {
        res.redirect("/payment/" + order_id);
    } else {
        res.redirect("/email_send/" + order_id);
    }
})
route.get("/order_info/:order_id", async function (req, res) {
    var cos_info = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.order_id}'`);
    var ord_info = await exe(`SELECT * FROM order_det WHERE order_id = '${req.params.order_id}'`);
    var data = await exe(`SELECT * FROM ultras_project `);
    var obj = { "about_company": data, "is_login": is_login(req), "cos_info": cos_info, "ord_info": ord_info };
    // console.log(ord_info);
    res.render("user/order_info.ejs", obj);
})
//update status
route.get("/change_password", async function (req, res) {
    res.render("user/change_password.ejs");
})
route.post("/update_password", async function (req, res) {
    var data = await exe(`UPDATE user_register SET user_password = '${req.body.new_password}' WHERE  user_password = '${req.body.old_password}'`);
    res.redirect("/")
})
route.get("/payment/:order_id", async function (req, res) {
    var cos_info = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.order_id}'`);
    var obj = { "cos_info": cos_info, "order_id": req.params.order_id };

    res.render("user/payment.ejs", obj);

})
route.post("/check_payment/:order_id", async function (req, res) {
    var order_id = req.params.order_id;
    var sql = `UPDATE order_tbl SET payment_status = 'paid' , transaction_id = '${req.body.razorpay_payment_id}' WHERE order_id = '${order_id}'`;
    var data = await exe(sql);
    res.redirect("/email_send/" + order_id);


})





route.get("/email_send/:order_id", async function (req, res) {

    const order_id = req.params.order_id;

    // 1️⃣ Order info
    const cos_info = await exe(
        "SELECT * FROM order_tbl WHERE order_id = ?",
        [order_id]
    );
    if (cos_info.length === 0) {
        return res.send("Order not found");
    }

    // 2️⃣ Order items
    const ord_info = await exe(
        "SELECT * FROM order_det WHERE order_id = ?",
        [order_id]
    );

    // 3️⃣ Customer email (CORRECT SOURCE)
    const emailData = await exe(

        `SELECT * FROM user_register WHERE user_id = '${req.session.user_id}'`
    );


    const email_id = emailData[0].user_email;
    console.log(email_id);
    // 4️⃣ Invoice rows
    let rows = "";
    let total = 0;

    ord_info.forEach(item => {
        const itemTotal = item.product_qty * item.product_price;
        total += itemTotal;
        rows += `
                <tr>
                    <td>${item.product_name}<br>
                        <small>${item.product_size}, ${item.product_color}, ${item.product_company}</small>
                    </td>
                    <td align="center">${item.product_qty}</td>
                    <td align="right">₹${item.product_price}</td>
                    <td align="right">₹${itemTotal}</td>
                </tr>`;
    });

    // 5️⃣ Mail setup
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use true for port 465, false for port 587
        auth: {
            user: "harishgore2023@gmail.com",
            pass: "momb mhow gzav bovx",
        },
    });

    // Send an email using async/await
    (async () => {
        const info = await transporter.sendMail({
            from: '"Gore collection" <harishgore2023@gmail.com>',
            to: email_id ,
            subject: `Invoice - Order #${order_id}`,
            html: `
                <h2>ULTRAS - Order Invoice</h2>
                <p><b>Order ID:</b> ${order_id}</p>
                <p><b>Customer:</b> ${cos_info[0].customer_name}</p>
                <p><b>Mobile:</b> ${cos_info[0].customer_mobile}</p>
                <p><b>Payment Status:</b> ${cos_info[0].payment_status}</p>

                <table width="100%" border="1" cellpadding="10">
                    <tr>
                        <th>Item</th><th>Qty</th><th>Rate</th><th>Total</th>
                    </tr>
                    ${rows}
                    <tr>
                        <td colspan="3" align="right"><b>Grand Total</b></td>
                        <td align="right"><b>₹${total}</b></td>
                    </tr>
                </table>

                <p>Thank you for shopping with <b>ULTRAS</b> ❤️</p>
            `
        });

        console.log("Message sent:", info.messageId);
    })();
    // 6️⃣ Send email


    console.log("✅ Email sent to:", email_id);
    res.redirect("/order_info/" + order_id);


});


route.get("/edit_profile", async function (req, res) {
    var data = await exe(`SELECT * FROM ultras_project `);
    var obj = { "about_company": data, "is_login": is_login(req) };
    res.render("user/edit_profile.ejs", obj);

})
route.get("/my_orders", async function (req, res) {
    var data = await exe(`SELECT * FROM ultras_project `);
    var orders = await exe(`SELECT * FROM order_det WHERE customer_id = '${req.session.user_id}'`);
    var obj = { "about_company": data, "is_login": is_login(req), "orders": orders };

    res.render("user/my_order.ejs", obj);

})


module.exports = route;

