const express = require('express');
const env = require("./env.json");
const app = express();
const {createUserTable,createUserAddressTable,createBookTable,createReviewTable} = require('./models');
const authRoutes = require('./routes/route');

app.use(express.json());

async function tables(){
    try {
        await createUserAddressTable();
        await createUserTable();
        await createBookTable();
        await createReviewTable();
    } catch (error) {
        console.log(error);
    }
}

tables();

app.use('/auth', authRoutes);

const PORT = env.APP_PORT;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})