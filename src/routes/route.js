const express = require('express');
const {register,login} = require('../controllers/userController');
const {authorization} = require('../middleware/auth')
const {createBook,getBooks,getBookById,updateBookById,deleteBookById} = require('../controllers/bookController');
const {createReview,updateReview,deleteReview} = require('../controllers/reviewController');

const router = express.Router();

//User API
router.post('/register', register);
router.post('/login',login);

//Books API
router.post('/books',authorization,createBook);
router.get('/books',authorization,getBooks);
router.get('/books/:bookId',authorization,getBookById);
router.put('/books/:bookId',authorization,updateBookById);
router.delete('/books/:bookId',authorization,deleteBookById);

//Review API
router.post('/books/:bookId/review',createReview);
router.put('/books/:bookId/review/:reviewId',updateReview);
router.delete('/books/:bookId/review/:reviewId',deleteReview);

module.exports = router;
