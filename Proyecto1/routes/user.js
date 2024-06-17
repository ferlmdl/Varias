const express = require('express');
const router = express.Router();
const { pool } = require('../app');
const bcrypt = require('bcrypt');

router.get('/registro', (req, res) => {
  res.render('layouts/registro', { layout: false });
});

router.get('/ingreso', (req, res) => {
  res.render('layouts/ingreso', { layout: false });
});

router.post('/registro', async (req, res) => {
  const { nombre_completo, rut, telefono, correo, password } = req.body;

  if (!rut) {
    return res.status(400).send('El campo Rut es requerido');
  }

  try {
    // Asegurarse de encriptar la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO dueño (nombre, rut, telefono, email, password) VALUES ($1, $2, $3, $4, $5)', [nombre_completo, rut, telefono, correo, hashedPassword]);
    console.log(`Usuario ${nombre_completo} registrado con éxito. Rut: ${rut}, Teléfono: ${telefono}, Email: ${correo}`);
    res.redirect('/ingreso');
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al crear el usuario');
  }
});

router.post('/ingreso', async (req, res) => {
  const { nombre_completo, correo, password } = req.body;

  try {
    const userQuery = await pool.query('SELECT * FROM dueño WHERE nombre = $1 AND email = $2', [nombre_completo, correo]);

    if (!userQuery.rows.length) {
      return res.status(400).send('El nombre o correo ingresado no está registrado');
    }

    const user = userQuery.rows[0];

    // Asumimos que las contraseñas están encriptadas en la base de datos
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).send('Contraseña incorrecta');
    }

    // Establecer la sesión
    req.session.nombre_completo = nombre_completo;
    req.session.correo = correo;
    req.session.UsuarioID = user.usuarioid;
    req.session.isAuthenticated = true;

    console.log(`UsuarioID guardado en la sesión: ${req.session.UsuarioID}`);

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al iniciar sesión');
  }
});

module.exports = router;
