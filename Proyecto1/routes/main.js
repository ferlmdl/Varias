const express = require('express');
const router = express.Router();
const { pool } = require('../app');

async function getPetNamesByOwnerId(ownerId) {
  try {
    const pets = await pool.query('SELECT * FROM mascota WHERE id_dueño = $1', [ownerId]);
    return pets.rows;
  } catch (error) {
    console.error('Error al obtener los nombres de las mascotas:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  if (req.session.UsuarioID) {
    try {
      const pets = await getPetNamesByOwnerId(req.session.UsuarioID);
      res.render('index', { mascotas: pets });
    } catch (error) {
      res.status(500).send('Error al obtener las mascotas');
    }
  } else {
    res.redirect('/ingreso');
  }
});

router.get('/registro', (req, res) => {
  res.render('layouts/registro', { layout: false });
});

router.get('/ingresar', (req, res) => {
  res.render('layouts/ingresar', { layout: false });
});

router.get('/logout', (req, res) => {
  req.session.userId = null;
  req.session.userCorreo = null;
  req.session.isAdmin = false;
  req.session.isAuthenticated = false;

  res.redirect('/');
});

router.get('/principal', (req, res) => {
  res.render('layouts/principal', { layout: false });
});

router.post('/add_mascota', async (req, res) => {
  if (req.session.UsuarioID) {
    const { nombre, especie, peso, nombre_comida } = req.body;
    try {
      await pool.query(
        'INSERT INTO mascota (nombre, id_dueño, especie, peso, nombre_comida) VALUES ($1, $2, $3, $4, $5)',
        [nombre, req.session.UsuarioID, especie, peso, nombre_comida]
      );
      res.redirect('/');
    } catch (error) {
      console.error('Error al agregar mascota:', error);
      res.status(500).send('Error al agregar mascota');
    }
  } else {
    res.redirect('/principal');
  }
});

router.post('/edit_mascota/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, especie, peso, nombre_comida } = req.body;
  try {
    await pool.query(
      'UPDATE mascota SET nombre = $1, especie = $2, peso = $3, nombre_comida = $4 WHERE id = $5 AND id_dueño = $6',
      [nombre, especie, peso, nombre_comida, id, req.session.UsuarioID]
    );
    res.redirect('/');
  } catch (error) {
    console.error('Error al editar mascota:', error);
    res.status(500).send('Error al editar mascota');
  }
});

router.post('/delete_mascota/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM mascota WHERE id = $1 AND id_dueño = $2',
      [id, req.session.UsuarioID]
    );
    res.redirect('/');
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).send('Error al eliminar mascota');
  }
});

module.exports = router;
