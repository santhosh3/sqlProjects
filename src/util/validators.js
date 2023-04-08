module.exports.validateRegisterInput = (
    title,name,phone,email,password,street,city,pincode
) => {
    const errors = {};
    if(title.trim() === '') errors.title = 'title must not be empty';
    if(name.trim() === '') errors.name = 'name must not be empty';
    if(phone.trim() === '') errors.phone = 'phone must not be empty';
    if(email.trim() === '') errors.email = 'email must not be empty';
    if(password.trim() === '') errors.password = 'password must not be empty';
    if(street.trim() === '') errors.street = 'street must not be empty';
    if(city.trim() === '') errors.city = 'city must not be empty';
    if(pincode.trim() === '') errors.pincode = 'pincode must not be empty';
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (email.trim() !== '' && !email.match(regEx)) errors.email = 'Email must be a valid email address';
    return {errors,valid: Object.keys(errors).length < 1};
};

module.exports.validateLoginInput = (email,password) => {
    const errors = {};
    if (email.trim() === '') errors.email = 'email must not be empty';
    if (password.trim() === '') errors.password = 'Password must not be empty';
    return {errors,valid: Object.keys(errors).length < 1};
};

module.exports.validateBookInput = (
    title,excerpt,userId,ISBN,category,subcategory,releasedAt
) => {
    const errors = {};
    if(title.trim() === '') errors.title = 'title must not be empty';
    if(excerpt.trim() === '') errors.excerpt = 'excerpt must not be empty';
    if(!userId) errors.userId = 'userId must not be empty';
    if(ISBN.trim() === '') errors.ISBN = 'ISBN must not be empty';
    if(category.trim() === '') errors.category = 'category must not be empty';
    if(!subcategory) errors.subcategory = 'subcategory must not be empty';
    if(releasedAt.trim() === '') errors.releasedAt = 'releasedAt must not be empty';
    const dateRegex = /((18|19|20)[0-9]{2}[\-.](0[13578]|1[02])[\-.](0[1-9]|[12][0-9]|3[01]))|(18|19|20)[0-9]{2}[\-.](0[469]|11)[\-.](0[1-9]|[12][0-9]|30)|(18|19|20)[0-9]{2}[\-.](02)[\-.](0[1-9]|1[0-9]|2[0-8])|(((18|19|20)(04|08|[2468][048]|[13579][26]))|2000)[\-.](02)[\-.]29/;
    if(!dateRegex.test(releasedAt)) errors.releasedAt = 'Release date must be in formate of YYYY-MM-DD';
    return {errors,valid: Object.keys(errors).length < 1};
}



/*
{  
  "title": "Mr",
  "name": "John Doe",
  "phone": 9897969594,
  "email": "johndoe@mailinator.com", 
  "password": "abcd1234567",
  "address": {
    "street": "110, Ridhi Sidhi Tower",
    "city": "Jaipur",
    "pincode": "400001"
  }
}

*/