const {createUserTable,createUserAddressTable} = require('./userModel.js');
const {createBookTable} = require('./bookModel.js');
const {createReviewTable} = require('./reviewModel.js')

module.exports = {
    createUserTable,createUserAddressTable,createBookTable,createReviewTable
};
