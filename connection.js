const mysql = require("mysql2");
const util = require("util");




const conn = mysql.createConnection({
    host:"bao8jybunrfjkaktitrr-mysql.services.clever-cloud.com",
    user:"ueuo6sw00yp9nisb",
    password:"SQxzIGpRIzTU4ZwBBOcC",
    database:"bao8jybunrfjkaktitrr"
})

const exe = util.promisify(conn.query).bind(conn);
module.exports = exe;
