const express = require('express');

//esta Libreria la usamos aqui para validar la contraseña
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {

    //Almacenando la información proveniente del body
    let body = req.body;

    //Buscando en la DB un usuario con el mismo correo que viene del formulario login
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        //Si sucede un Error 
        if (err) {
            //Error interno de Base de Datos
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si el usuario no existe en la DB
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o Contraseña Incorrecto'
                }
            });
        }

        //Si la contraseña ingresada en el formulario del login no coincide con la base de datos
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (Contraseña) Incorrecto'
                }
            });
        }

        //Creando token que expira en 30 dias
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        //Si todo sale bien
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    });
});


module.exports = app;