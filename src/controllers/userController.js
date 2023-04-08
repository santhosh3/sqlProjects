const pool = require('../db/db');
const {validateRegisterInput,validateLoginInput} = require('../util/validators');
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require("../env.json");
let authController = {};

function generateToken(user){
  return jwt.sign(
      {
      id: user.id,
      email: user.email,
      name: user.name
      },
      SECRET_KEY,
      {expiresIn: "30d"}
  );
}

authController.register = async (req,res) => {
  try {
    let body = req.body
    if(Object.keys(body).length === 0) return res.status(400).send({status:false, message:"please fill all fields are empty"});
    let {title,name,phone,email,password,address} = body;
    let {street,city,pincode} = address;
    const {valid,errors} = validateRegisterInput(title,name,phone,email,password,street,city,pincode);
    if(!valid) return res.status(400).send({status:false, message:errors});
    let existError = {}
    const Dphone = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE phone = $1)',
      [phone]
    )
    const Demail = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email]
    )
    if(Dphone.rows[0].exists) existError.phone = "phone number is already exists in database"
    if(Demail.rows[0].exists) existError.email = "email is already exists in database"
    if(Object.keys(existError).length > 0) return res.status(400).send({status:false, message:existError});
    const addressResult = await pool.query(
      'INSERT INTO address (street, city, pincode) VALUES ($1, $2, $3) RETURNING id',
      [street, city, pincode]
    );
    const addressId = addressResult.rows[0].id;
    const userResult = await pool.query(
      'INSERT INTO users (title, name, phone, email, password, address_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title.trim(), name.trim(), phone.trim(), email.trim(), password.trim(), addressId]
    );
    const overAllResult = await pool.query(
      `SELECT users.*, address.*
       FROM users
       JOIN address
       ON users.address_id = address.id
       WHERE users.id = $1`,
       [userResult.rows[0].id]
    )
    if(overAllResult.rows.length !== 0){
      const {title,name,phone,email,password,created_at,updated_at,street,city,pincode} = overAllResult.rows[0];
      let object = {
          title,name,phone,email,password,
          address:{street,city,pincode},created_at,updated_at
      }
      res.status(201).json(object);
    }
  } catch (error) {
    return res.status(500).send({ status: false, data: error.message })
  }
}

authController.login = async (req,res) => {
  try {
    let body = req.body
    if(Object.keys(body).length === 0) return res.status(400).send({status:false, message:"please fill all fields are empty"});
    let {email,password} = body;
    const {errors,valid} = validateLoginInput(email,password)
    if(!valid) return res.status(400).send({status:false, message:errors})
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if(!result.rows[0]){
       return res.status(400).send({status:false, message:'User with email doesnot exists'})
    }
    if(result.rows[0].password === password){
      const token = generateToken(result.rows[0]);
      const {id,name,email,phone} = result.rows[0]
      return res.send({
        status:true,name,email,phone,token
      })
    }
    return res.status(400).send({status:false, message:'Invalid login credentials'})
  } catch (error) {
    return res.status(500).send({ status: false, data: error.message })
  }
}


module.exports = authController
