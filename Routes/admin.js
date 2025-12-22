const express = require("express");
const route = express.Router();
const exe = require('./../connection');


route.post("/",function(req,res){
    var d = req.body;
    if(d.admin_id=="harish552" && d.admin_password == "shantanu@321"){
        req.session.admin=true;
        res.render("admin/index.ejs");
        
    }
    else{
        res.redirect("/admin/?invalid user");
    }
})


function checkAdmin(req, res, next) {
    if (!req.session.admin) {
        return res.redirect("/admin");
    }
    next();
}

route.get("/",function(req,res){

    res.render("admin/admin_login.ejs");
});
route.get("/about_company",checkAdmin,async function(req,res){
   
    var sql = `SELECT * FROM ultras_project WHERE id = '1'`;
    var data = await exe(sql);
    
    res.render("admin/about_company.ejs",{data});
    
});
route.post("/save_company",checkAdmin,async function(req,res){
    var d = req.body;
    
    var sql = `UPDATE ultras_project SET company_name = '${d.company_name}' ,company_mobile = '${d.company_mobile}' ,company_email = '${d.company_email}' ,company_address = '${d.company_address}' ,whatsapp = '${d.whatsapp}' ,linkdin = '${d.linkdin}',facebook = '${d.facebook}',youtube = '${d.youtube}' WHERE id = '1' `;
    var data = await exe(sql);
    res.redirect("/admin/about_company");
});
route.get("/slider",checkAdmin, async function(req,res){
    var data = await exe(`SELECT * FROM slider `);
    res.render("admin/slider.ejs", {data});
})
route.post("/save_slider",async function (req, res) {
    var d = req.body;
    
    var fileName ;
    if(req.files){
        fileName = Date.now() + req.files.image.name;
        req.files.image.mv("public/" + fileName);
    }
    else {
        return res.redirect("/admin/slider?err=Please select an image");
    }

    

    
    var sql = `INSERT INTO slider(slider_title ,slider_disc ,btn_url ,btn_text ,image )VALUES('${d.slider_title}','${d.slider_disc}','${d.btn_url}','${d.btn_text}','${fileName}')`;
    var data = await exe(sql);
    res.redirect("/admin/slider");
    
    
});
route.get("/delete/:id",checkAdmin,async function(req,res){
    var id = req.params.id;
    var data = await exe(`DELETE FROM slider WHERE id = '${id}'`);
    res.redirect("/admin/slider");
})
route.get("/update/:id",checkAdmin,async function(req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM slider WHERE id = '${id}'`);
    res.render("admin/update_slider.ejs",{data});
})
route.post("/update_slider",async function(req,res){
    var d = req.body;
    
    var fileName ;
    if(req.files){
        fileName = Date.now() + req.files.image.name;
        req.files.image.mv("public/" + fileName);
        var data = await exe(`UPDATE slider SET image = '${fileName}' WHERE id = '${d.id}'`);
    }
    
    var sql = ` UPDATE slider  SET  slider_title = '${d.slider_title}', slider_disc = '${d.slider_disc}',  btn_url = '${d.btn_url}',   btn_text = '${d.btn_text}'   WHERE id = '${d.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/slider");

});
//category
route.get("/category",checkAdmin,async  function(req,res){
    var category = await exe(`SELECT * FROM category`);
    res.render("admin/category.ejs",{category});
})
//save category
route.post("/save_category",async function(req,res){
    var data = await exe(`INSERT INTO category(category_name) VALUES('${req.body.category_name}')`);
    res.redirect("/admin/category");
})
//delete category
route.get("/delete_category/:id",checkAdmin,async function(req,res){
    var id = req.params.id; 
    var data = await exe(`DELETE FROM category WHERE id = '${id}'`);
    res.redirect("/admin/category");
})
//update category
route.get("/update_category/:id",checkAdmin,async function(req,res){
    var id = req.params.id; 
    var data = await exe(`SELECT * FROM category WHERE id = '${id}'`);
    res.render("admin/update_category.ejs",{data});
})
route.post("/save_update_category",async function(req,res){

    var data = await exe(`UPDATE category SET category_name = '${req.body.category_name}' WHERE id  = '${req.body.id}'`);
    res.redirect("/admin/category");
})
route.get("/add_product",checkAdmin,async function(req,res){
    var category = await exe(`SELECT * FROM category`);

    res.render("admin/add_product.ejs",{category});
})
//save product
route.post("/save_product",async function(req,res){
    if(req.files && req.files.product_image1){
        var product_image1 = Date.now()+req.files.product_image1.name;
        req.files.product_image1.mv("public/upload/"+product_image1);
    }
    if(req.files && req.files.product_image2){
        var product_image2 = Date.now()+req.files.product_image2.name;
        req.files.product_image2.mv("public/upload/"+product_image2);
    }
    if(req.files && req.files.product_image3){
        var product_image3 = Date.now()+req.files.product_image3.name;
        req.files.product_image3.mv("public/upload/"+product_image3);
    }
    else{
        product_image3 = ' ';
    }
    if(req.files && req.files.product_image4){
        var product_image4 = Date.now()+req.files.product_image4.name;
        req.files.product_image4.mv("public/upload/"+product_image4);
    }
    else{
        product_image4 = ' ';
    }
    var d = req.body;
    var sql = `INSERT INTO product_detail(
        product_category,
        product_name,
        product_company,
        product_color,
        product_label,
        product_details,
        product_image1,
        product_image2,
        product_image3,
        product_image4
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Pass values in array
    var values = [
        d.product_category,
        d.product_name,
        d.product_company,
        d.product_color,
        d.product_label,
        d.product_details,
        product_image1,
        product_image2,
        product_image3,
        product_image4
    ];

    var data = await exe(sql, values);
    var product_id = data.insertId;
    for(var i =0 ;i<d.product_size.length;i++){
    var sql1 = `INSERT INTO product_pricing(product_id,product_size ,product_price ,product_duplicate_price) 
    VALUES('${product_id}','${d.product_size[i]}','${d.product_price[i]}','${d.product_duplicate_price[i]}')`;
    var data1 = await exe(sql1);
    }
    res.redirect("/admin/add_product");
})
route.get("/product_list",checkAdmin, async function(req,res){

    var sql = `SELECT 
                product_detail.*,
                (SELECT MIN(product_price) 
                 FROM product_pricing 
                 WHERE product_detail.product_id = product_pricing.product_id) AS product_price,

                (SELECT MAX(product_duplicate_price) 
                 FROM product_pricing 
                 WHERE product_detail.product_id = product_pricing.product_id) AS product_duplicate_price
               
               FROM product_detail`;

    var data = await exe(sql);

    var obj = { product_info: data };

    res.render("admin/product_list.ejs", obj);
});

//delete product

route.get("/delete_product/:id",checkAdmin,async function(req,res){
    var id = req.params.id;
    var data = await exe(`DELETE FROM product_detail WHERE product_id = '${id}'`);
    var data1 = await exe(`DELETE FROM product_pricing WHERE product_id = '${id}'`);
    res.redirect("/admin/product_list");
})

//view product

route.get("/view/:id",checkAdmin,async function(req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM product_detail WHERE product_id = '${id}'`);
    var data1 = await exe(`SELECT * FROM product_pricing WHERE  product_id = '${id}'`);
    var obj = {"product_detail":data,"product_price":data1};
    res.render("admin/product_info.ejs",obj);
})

route.get("/orders_list/:status",checkAdmin, async function(req,res){
    var status = req.params.status
    var data = await exe(`SELECT * FROM order_tbl WHERE order_status = '${status}'`);
    obj = {"orders":data,"status":status};
    res.render("admin/order_list.ejs",obj);
})
route.get("/order_info/:order_id",checkAdmin,async function(req,res){
    var cos_info = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.order_id}'`);
    var ord_info = await exe(`SELECT * FROM order_det WHERE order_id = '${req.params.order_id}'`);
    var obj = { "cos_info":cos_info,"ord_info":ord_info};
    res.render("admin/order_info.ejs",obj);

})
route.get("/change_status/:order_id/:status",checkAdmin,async function(req,res){
    var order_id = req.params.order_id;
    var status = req.params.status;

    if(status == 'cancelled'){
        await exe(`UPDATE order_tbl SET order_status = '${status}' WHERE order_id = '${order_id}'`);
    }else if(status == 'rejected'){
        await exe(`UPDATE order_tbl SET order_status = '${status}' WHERE order_id = '${order_id}'`);
    }else if(status == 'returned'){
        await exe(`UPDATE order_tbl SET order_status = '${status}' WHERE order_id = '${order_id}'`);
    }else if(status == 'delivered'){
        await exe(`UPDATE order_tbl SET order_status = '${status}' WHERE order_id = '${order_id}'`);
    }else if(status == 'dispatched'){
        await exe(`UPDATE order_tbl SET order_status = '${status}' WHERE order_id = '${order_id}'`);
    }else if(status == 'rejected'){
        await exe(`UPDATE order_tbl SET order_status = '${status}' WHERE order_id = '${order_id}'`);
    }

    res.redirect("/admin/orders_list/"+status);
})


module.exports = route;

