require('dotenv').config();
const express = require('express');
const handlebars = require("express-handlebars");
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET || 'claveSecretaPorDefecto', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  next();
});

const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: `${__dirname}/views/layouts`,
  partialsDir: `${__dirname}/views/partials`,
  defaultLayout: "index",
  helpers: {
    eq: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : '';
    }
  }
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'proyecto',
  password: 'fernanda123',
  port: 5432,
});

pool.connect()
  .then(() => {
    console.log('Conectado a la base de datos de PostgreSQL');
  })
  .catch((error) => {
    console.error(`Error de conexión: ${error}`);
  });

app.get('/', (req, res) => {
  res.render('layouts/principal', { layout: false });
});

module.exports = { app, pool };
