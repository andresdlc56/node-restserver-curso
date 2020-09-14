const express = require('express');

//esta Libreria la usamos aqui para validar la contraseña
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Librerias Necesarias para validar el token proveniente de google sign-in, en el servidor
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Definiendo funcion de verificacion de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

//Ruta que sera usada por el index para verificar el token de google (lado del servidor)
app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        //Manejando Posible error en el toke
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    //comparando los datos del token con los de la db
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        /*
            Si el usuario existe en la db se debe verificar que su propiedad google
            sea false
        */
        /*
            Es decir que si el usuario autenticado se registro por medio de la app, 
            su propiedad google es false. Por lo tanto si intenta ingresar a esta
            ruta retornara un error
        */
        if (usuarioDB) {
            //Verificando si el usuario autenticado se registro por google o mi app
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autentificación normal'
                    }
                });
            }
            /*
                Si el usuario actualmente autenticado, ya se ha autenticado y 
                registrado anteriormente por medio de la libreria de google
                debemos renovar su token
            */
            else {
                //Renovando Token 
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        }

        /*
            Si el Usuario que se intenta autenticar por la libreria de google
            NO EXISTE en la DB, de bemos permitir que este se almacene en la db
        */
        else {
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            //El password lo maneja la libreria de google
            usuario.password = ':)'; //Mucho Ojo con esto. Nunca hace match con el password de la db

            //Guardando el nuevo usuario den la db
            usuario.save((err, usuarioDB) => {
                //Si sucede algun error al guardar
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                //Si no sucede algun error al guardar
                else {
                    //Generando un token
                    let token = jwt.sign({
                        usuario: usuarioDB
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                    //retornando 
                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token
                    });
                }
            });
        }
    });

    //Si no sucede ningun error 
    /*
    res.json({
        usuario: googleUser
    });
    */
});


module.exports = app;