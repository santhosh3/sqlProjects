const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require("../env.json");
const pool = require('../db/db');

async function authorization(req,res,next){
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, SECRET_KEY);
            let userDetails = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
            req.user = userDetails.rows[0];
            next();
        } catch (error) {
            return res.status(401).send({status:false, message:"not authorised token failed"})
        }
    }
    if(!token){
        return res.status(401).send({status:false, message:"Not authorised, no token"})
    }
}

module.exports = {authorization};