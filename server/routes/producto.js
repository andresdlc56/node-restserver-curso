const express = require('express');
const app = express();

const { verificaToken } = require('../middlewares/autenticacion');

let Producto = require('../models/producto');

//NOTA: too el mundo puede manipular los productos, siempre que este autenticado

//======================
//  Obtener productos
//======================
app.get('/productos', (req, res) => {
    //Traer todos los productos
    //populate: usuario categoria
    //Paginado

    //Paginacion
    //Importante para la paginación, desde donde empieza a contar 
    let desde = req.query.desde || 0;
    //Transformando "desde" a numero
    desde = Number(desde);

    //Importante para la paginación, donde termina la busqueda en cada paginacion
    let limite = req.query.limite || 5;
    //Transformando "limite" a numero
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count((err, conteo) => {
                res.json({
                    ok: true,
                    productosDB,
                    cuantos: conteo
                });
            });
        });
});

//======================
//  Obtener producto x id
//======================
app.get('/producto/:id', verificaToken, (req, res) => {
    //Traer un producto x id
    //populate: usuario categoria

    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productoDB
            });
        });
});

//======================
//  Buscar productos
//======================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    //Dandole tratamiento a "termino" para realizar busquedas
    //Parametro 'i' para que sea insensible
    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

//======================
//  Crear un nuevo producto
//======================
app.post('/producto', verificaToken, (req, res) => {
    //grabar usuario
    //grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.descripcion,
        categoria: body.categoriaId,
        usuario: req.usuario._id
    });

    producto.save((err, newProducto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            newProducto
        });
    });
})

//======================
//  Actualizar un producto
//======================
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    let body = {
        nombre: req.body.nombre,
        precioUni: req.body.precio,
        descripcion: req.body.descripcion,
        disponible: req.body.disponible,
        categoria: req.body.categoriaId,
        usuario: req.usuario._id
    }

    //Actualizar solo el nombre de la categoria
    Producto.findByIdAndUpdate(id, body, { new: true }, (err, productoDB) => {
        //Si sucede algun error 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productoDB
        });
    });
})

//======================
//  Borrar producto x id
//======================
app.delete('/producto/:id', (req, res) => {
    //No borrar fisicamente, solo cambiar su disponibilidad
    //Creando objeto que contiene la propiedad que se quiere cambiar
    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    }

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, productoDB) => {
        //Si sucede algun error 
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //si retorna un usuario vacio o null
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no Encontrado'
                }
            })
        }

        res.json({
            ok: true,
            productoDB
        });
    })
});

module.exports = app;