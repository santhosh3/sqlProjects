const pool = require('../db/db');
const {validateBookInput} = require('../util/validators');


let bookController = {};

bookController.createBook = async(req,res) => {
    try {
        const body = req.body;
        if(Object.keys(body).length === 0) return res.status(400).send({status:false, message:"please fill all fields are empty"});
        let {title, excerpt, userId, ISBN, category,isDeleted, subcategory, releasedAt} = body;
        if(isDeleted==true) return res.status(400).send({status:false,message:"Bad Request"});
        const {valid,errors} = validateBookInput(title,excerpt,userId,ISBN,category,subcategory,releasedAt);
        if(!valid) return res.status(400).send({status:false, message:errors});
        subcategory = subcategory.split(',').map(x => x.trim());
        let existError = {};
        const user = await pool.query('SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)', [userId]);
        const Dtitle = await pool.query('SELECT EXISTS(SELECT 1 FROM book WHERE title = $1)', [title]);
        const Disbn = await pool.query('SELECT EXISTS(SELECT 1 FROM book WHERE isbn = $1)', [ISBN]);
        if(Dtitle.rows[0].exists) existError.title = "title is already exists in database";
        if(Disbn.rows[0].exists) existError.isbn = "isbn is already exists in database";
        if(!user.rows[0].exists) existError.user = "userId is not exists in database";
        if(Object.keys(existError).length > 0) return res.status(400).send({status:false, message:existError});
        if(req.user.id !== userId) return res.status(401).send({status:false,message:"You are not Authorised to post this book"});
        const InsertBookDetails = await pool.query(
          'INSERT INTO book (title,excerpt,user_id,isbn,category,subcategory,released_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
           [title.trim(),excerpt.trim(),userId,ISBN.trim(),category.trim(),subcategory,releasedAt.trim()]
        );
        return res.status(201).send({status:true, data:InsertBookDetails.rows[0]});
    } catch (error) {
      return res.status(500).send({status:false,data:error.message})
    }
}

bookController.getBooks = async(req,res) => {
    try {
        const queryParams = req.query;
        const filterQuery = {};
        let whereClause = '';

        if (queryParams.user_id) {
          if (whereClause) whereClause += ' AND ';
          whereClause += `user_id = '${queryParams.user_id}'`;
        }
        if (queryParams.category) {
          if (whereClause) whereClause += ' AND ';
          whereClause += `category = '${queryParams.category}'`;
        }
        if (queryParams.subcategory) {
            const subcategories = queryParams.subcategory.split(',');
            const subcategoryConditions = subcategories.map((subcategory) => `subcategory::text[] @> ARRAY['${subcategory.trim()}']`);
            if (whereClause) whereClause += ' AND ';
            whereClause += `(${subcategoryConditions.join(' OR ')})`;
        }
        if (whereClause) filterQuery.where = whereClause;
        const query = `SELECT * FROM book ${whereClause ? 'WHERE ' + filterQuery.where : ''} ORDER BY title`
        const books = await pool.query(query);
        if (books.rowCount === 0)  return res.status(404).send({ status: false, message: 'Books not found' });
        return res.status(200).send({ status: true, message: 'Books list', data: books.rows });
    } catch (error) {
      return res.status(500).send({status:false,data:error.message})
    }
}

bookController.getBookById = async(req,res) => {
    try {
        let id = req.params.bookId;
        const bookData = await pool.query(`SELECT EXISTS(SELECT 1 FROM book WHERE id = ${id})`);
        if(!bookData.rows[0].exists) return res.status(400).send({status: false, message:'Book does not exit'});
        const bookQuery = await pool.query(`select * from book where id = ${id} AND is_deleted = false`);
        if(bookQuery.rows[0])return res.status(200).send({status:true, data:bookQuery.rows[0]});
        else return res.status(400).send({status:false, message:"book not found or it may be deleted"});
    } catch (error) {
        return res.status(500).send({status:false,data:error.message});
    }
}

bookController.updateBookById = async(req,res) => {
    try {
        let bookId = req.params.bookId;
        const { title, excerpt, released_at, ISBN } = req.body
        const checkBook = await pool.query(`SELECT EXISTS(SELECT 1 FROM book WHERE id = ${bookId})`);
        if(!checkBook.rows[0].exists) return res.status(400).send({status: false, message:'Book does not exit'});
        let book = await pool.query(`select * from book where id = ${bookId} AND is_deleted = false`);
        if(!book.rows[0]) return res.status(400).send({status:false, message:"book not found or it may be deleted"})
        if(req.user.id !== book.rows[0].user_id) return res.status(401).send({status:false,message:"You are not Authorised to delete this book"});
        let object = '', existError = {};
        if(title){
           let Dtitle = await pool.query('SELECT EXISTS(SELECT 1 FROM book WHERE title = $1)', [title.trim()]);
           if(Dtitle.rows[0].exists) existError.title = "title is already exists in database";
           if(object) object += ','+' ';
           else object += `title = '${title.trim()}'`;
        }
        if(excerpt) {
            if(object) object += ','+' ';
            object += `excerpt = '${excerpt.trim()}'`;
        }
        if(released_at){
            const dateRegex = /((18|19|20)[0-9]{2}[\-.](0[13578]|1[02])[\-.](0[1-9]|[12][0-9]|3[01]))|(18|19|20)[0-9]{2}[\-.](0[469]|11)[\-.](0[1-9]|[12][0-9]|30)|(18|19|20)[0-9]{2}[\-.](02)[\-.](0[1-9]|1[0-9]|2[0-8])|(((18|19|20)(04|08|[2468][048]|[13579][26]))|2000)[\-.](02)[\-.]29/;
            if(!dateRegex.test(released_at)) existError.released_at = 'Release date must be in formate of YYYY-MM-DD';
            if(object) object += ','+' ';
            object += `released_at = '${released_at.trim()}'`;
        }
        if(ISBN){
          let Disbn = await pool.query('SELECT EXISTS(SELECT 1 FROM book WHERE isbn = $1)', [ISBN.trim()]);
          if(Disbn.rows[0].exists) existError.title = "ISBN is already exists in database";
          if(object) object += ','+' ';
          object += `isbn = '${ISBN.trim()}'`;
        }
        if(Object.keys(existError).length > 0) return res.status(400).send({status:false, message:existError});
        let query = `UPDATE book SET ${object} WHERE id = ${bookId}`
        await pool.query(query);
        book = await pool.query(`select * from book where id = ${bookId} AND is_deleted = false`);
        return res.status(200).send({status:true, data:book.rows[0]});
    } catch (error) {
      return res.status(500).send({status:false,data:error.message});
    }
}

bookController.deleteBookById = async(req,res) => {
    try {
        let id = req.params.bookId;
        const bookData = await pool.query(`SELECT EXISTS(SELECT 1 FROM book WHERE id = ${id} OR is_deleted = true)`);
        if(!bookData.rows[0].exists) return res.status(400).send({status: false, message:'Book does not exit'});
        const book = await pool.query(`select * from book where id = ${id} AND is_deleted = false`);
        if(!book.rows[0]) return res.status(400).send({status: false, message:'Book is already deleted'});
        if(req.user.id !== book.rows[0].user_id) return res.status(401).send({status:false,message:"You are not Authorised to delete this book"});
        await pool.query(`UPDATE book SET is_deleted = true, deleted_at = NOW() WHERE id = ${id}`);
        await pool.query(`UPDATE reviews SET is_deleted = true, deleted_at = NOW() WHERE book_id = ${id}`);
        return res.status(200).send({status:true, message:"Book is deleted successfully"});
    } catch (error) {
        return res.status(500).send({status:false,data:error.message});
    }
}
module.exports = bookController

