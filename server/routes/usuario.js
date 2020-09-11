const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore'); //Para filtrar propiedades de un objeto

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

//Buscando todos los Usuarios existentes en la DB
app.get('/usuario', verificaToken, (req, res) => {

    //Retornando los Valores Provenientes del verificaToken
    /*
    return res.json({
        usuario: req.usuario,
        nombre: req.usuario.nombre,
        email: req.usuario.email,
    });
    */

    //Importante para la paginación, desde donde empieza a contar 
    let desde = req.query.desde || 0;
    //Transformando "desde" a numero
    desde = Number(desde);

    //Importante para la paginación, donde termina la busqueda en cada paginacion
    let limite = req.query.limite || 5;
    //Transformando "limite" a numero
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            //Si sucede un error durante la busqueda
            if (err) {
                return res.status(400).json({
                    ok: false
                })
            }

            //Si no sucede nada malo durante la busqueda 
            //Contando la cantidad de registros o documentos que se encontraron en la DB
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });
        });
});

//Crear Usuario, solo autorizado para el Admin
app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;

    //Creando Objeto de tipo Usuario con los valores que vienen del body
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //Guardando el objeto usuario en la db
    usuario.save((err, usuarioDB) => {
        //Si algo malo sucede
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Ocultando el password encriptado
        //Opcion 1
        //usuarioDB.password = null;

        //La otra Opcion es en el modelo del usuario

        //Si no sucede nada malo
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//Actualizar Usuario, solo autorizado para el Admin
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    //Obtener el id desde la url
    let id = req.params.id;

    //Filtrando los datos del objeto body
    //Solo pasaran los campos que estan en el array
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    /*
        1er parametro el id del usuario q buscamos
        2do parametro los datos q se actualizaran
        3er paramtro (opcional) retorna el usuario con los nuevos datos 
        4to parametro callback
    */
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        //Si sucede algun error 
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//Borrando usuario de la DB (no lo borra, solo cambia su estado a false)
//Eliminar Usuario, solo autorizado para el Admin 
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;

    //Eliminando un usuario Fisicamente de la DB
    /*
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        //Si sucede un error 
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //si retorna un usuario vacio o null
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no Encontrado'
                }
            })
        }

        //Si no sucede nada malo 
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
    */

    //Creando objeto que contiene la propiedad que se quiere cambiar
    let cambiaEstado = {
        estado: false
    }

    //Otra Opcion, eliminando un usuario de la DB superficialmente
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        //Si sucede algun error 
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //si retorna un usuario vacio o null
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no Encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;