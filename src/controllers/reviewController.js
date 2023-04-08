const pool = require('../db/db');

let reviewController = {};

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

reviewController.createReview = async(req,res) => {
    try {
        let body = req.body;
        let bookId = req.params.bookId;
        const bookData = await pool.query(`SELECT EXISTS(SELECT 1 FROM book WHERE id = ${bookId})`);
        if(!bookData.rows[0].exists) return res.status(400).send({status: false, message:'Book does not exit'});
        const bookQuery = await pool.query(`select * from book where id = ${bookId} AND is_deleted = false`);
        if(!bookQuery.rows[0])return res.status(400).send({status:true, message:'Book not found or deleted'});
        if(Object.keys(body).length === 0) return res.status(400).send({status:false, message:"please fill all fields are empty"});
        const {rating,isDeleted,review,reviewedBy} = body;
        if (isDeleted == true) return res.status(400).send({status:false,message:"Bad Request"});
        if (!isValid(rating)) return res.status(400).send({status:false,message:"rating is required"});
        if (rating > 1 && rating < 6) return res.status(400).send({status:false,message:"rating should be of proper number"});
        await pool.query(
            'INSERT INTO reviews (book_id,reviewed_by,reviewed_at,rating,review) VALUES ($1, $2, $3, $4, $5) RETURNING *',
             [bookId,(reviewedBy)?reviewedBy:"Guest",new Date(),rating,(review)?review:null]
        );
        await pool.query(`UPDATE book SET reviews = ${bookQuery.rows[0].reviews + 1} WHERE id = ${bookId}`);
        const allReviews = await pool.query(`SELECT * from reviews where book_id = ${bookId}`);
        let object = bookQuery.rows[0];
        object.reviewDetails = allReviews.rows
        return res.status(201).send({status:true, data:object});
    } catch (error) {
      return res.status(500).send({status:false,data:error.message});
    }
}

reviewController.updateReview = async(req,res) => {
    try {
        let body = req.body;
        let bookId = req.params.bookId;
        let reviewid = req.params.reviewId

        //checking Book
        const bookData = await pool.query(`SELECT EXISTS(SELECT 1 FROM book WHERE id = ${bookId})`);
        if(!bookData.rows[0].exists) return res.status(400).send({status: false, message:'Book does not exit'});
        const bookQuery = await pool.query(`select * from book where id = ${bookId} AND is_deleted = false`);
        if(!bookQuery.rows[0])return res.status(400).send({status:true, message:'Book not found or deleted'});

        //checking review
        const reviewQuery = await pool.query(`select * from reviews where id = ${reviewid} AND book_id = ${bookId} AND is_deleted = false`);
        if(!reviewQuery.rows[0])return res.status(400).send({status:true, message:'review is not found or deleted'});

        if(Object.keys(body).length === 0) return res.status(400).send({status:false, message:"please fill all fields are empty"});
        const {rating,review,reviewedBy} = body;
        let object = '';
        if(rating){
         if (rating < 1 && rating > 6) return res.status(400).send({status:false,message:"rating should be of proper number"});
         if(object) object += ','+' ';
         else object += `rating = '${rating}'`;
        }
        if(review){
          if(object) object += ','+' ';
          object += `review = '${review}'`;
        }
        if(reviewedBy){
          if(object) object += ','+' ';
          object += `reviewed_by = '${reviewedBy}'`;
        }
        let query = `UPDATE reviews SET ${object} WHERE id = ${reviewid} AND book_id = ${bookId}`;
        await pool.query(query);
        let resObject = await pool.query(`SELECT * FROM reviews where id = ${reviewid} AND is_deleted = false`);
        return res.status(200).send({status:true, message:"Object updated successfully",data:resObject.rows[0]});
    } catch (error) {
      return res.status(500).send({status:false,data:error.message});
    }
}


reviewController.deleteReview = async(req,res) => {
    try {
        let bookId = req.params.bookId;
        let reviewid = req.params.reviewId;

        //checking Book
        const bookData = await pool.query(`SELECT EXISTS(SELECT 1 FROM book WHERE id = ${bookId})`);
        if(!bookData.rows[0].exists) return res.status(400).send({status: false, message:'Book does not exit'});
        const bookQuery = await pool.query(`select * from book where id = ${bookId} AND is_deleted = false`);
        if(!bookQuery.rows[0])return res.status(400).send({status:true, message:'Book not found or deleted'});

         //checking review
         const reviewQuery = await pool.query(`select * from reviews where id = ${reviewid} AND book_id = ${bookId} AND is_deleted = false`);
         if(!reviewQuery.rows[0])return res.status(400).send({status:true, message:'review is not found or deleted'});

         let query = `UPDATE reviews SET is_deleted = true, deleted_at = NOW() WHERE id = ${reviewid} AND book_id = ${bookId}`;
         await pool.query(query);

         let bookReviews = await pool.query(`select * from book where id = ${bookId} AND is_deleted = false`);
         let reviews = (bookReviews.rows[0].reviews > 0)? bookReviews.rows[0].reviews - 1 : 0;
         await pool.query(`UPDATE book SET reviews = ${reviews} WHERE id = ${bookId}`);

         return res.status(200).send({status:true, message:"Review is deleted successfully"});
    } catch (error) {
      return res.status(500).send({status:false,data:error.message});
    }
}

module.exports = reviewController
