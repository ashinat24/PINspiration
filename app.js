const express = require('express');
const expressLayouts = require('express-ejs-layouts');
// const fileUpload = require('express-fileupload');
const multer = require("multer");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');




const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use(expressLayouts);

app.use(cookieParser('CookingBlogSecure'));
app.use(session({
  secret: 'CookingBlogSecretSession',
  saveUninitialized: true,
  resave: true
}));
app.use(flash());
// app.use(fileUpload());
const upload = multer({ storage: multer.memoryStorage() });

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

const routes = require('./server/routes/craftRoutes.js')
app.use('/', routes);

app.listen(port, "0.0.0.0",()=> console.log(`Listening to port ${port}`));