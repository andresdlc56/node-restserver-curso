const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//NOTA: Guardar todos estos servicios en postman

//Mostrar todas las categorias (Si quieren las ordenan por paginación)
app.get('/categorias', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriasDB) => {
            //Si sucede algun error durante la busqueda
            if (err) {
                return res.status(400).json({
                    ok: false
                })
            }

            //Si no hay Categorias Registradas
            if (categoriasDB.length === 0) {
                return res.status(200).json({
                    ok: true,
                    categoriasDB: 'No Existe ninguna Categoria'
                })
            }

            //Si todo sale bien
            res.json({
                ok: true,
                categoriasDB
            });
        });
});

//Mostrar una categoria x id 
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    //Regresar la info de la categoria seleccionada
    Categoria.findById(id)
        .exec((err, categoriaDB) => {
            //Si sucede algun error durante la busqueda
            if (err) {
                return res.status(400).json({
                    ok: false
                });
            }

            //Si no enceuntra nada 
            if (!categoriaDB) {
                return res.status(404).json({
                    ok: false,
                    categoriaDB: 'Categoria no Existente'
                });
            }

            res.json({
                ok: true,
                categoriaDB
            });
        });
});

//Crear nueva categoria 
app.post('/categoria/new', verificaToken, (req, res) => {
    //Regresar la nueva categoria
    let newCategoria = new Categoria();

    newCategoria.descripcion = req.body.descripcion;
    newCategoria.usuario = req.usuario._id;

    //Guardando Usuario
    newCategoria.save((err, newCategoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            newCategoriaDB
        });
    });
});

//Actualizar una categoria 
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = {
        descripcion: req.body.descripcion,
        usuario: req.usuario._id
    }

    //Actualizar solo el nombre de la categoria
    Categoria.findByIdAndUpdate(id, body, { new: true }, (err, categoriaDB) => {
        //Si sucede algun error 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaDB
        });
    });
});

//Borrar categoria 
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //Solo un administrador puede borrar la categoria (verifica el token)
    //Eliminar Fisicamente
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        //Si sucede algun error 
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaBorrada
        });
    });
});

module.exports = app;