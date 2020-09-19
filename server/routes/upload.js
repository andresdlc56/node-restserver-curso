const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');

//Importando el modelos
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

app.use(fileUpload({ useTempFiles: true }));

//Ruta para subir imagenes, tanto para los productos como para los usuarios
app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    //si input del archivo esta vacio
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha Seleccionado ningun Archivo'
            }
        })
    }

    //Validar Tipo
    let tiposValidos = ['productos', 'usuarios'];

    /*
        Si el tipo que ingresaron por parametro no es igual a uno 
        de los tiposValidos
    */
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los Tipos permitidas son ' + tiposValidos.join(', ')
            }
        });
    }

    //Caso Contrario (si el input tiene contenido y es un tipo Valido)
    // El nombre del campo de entrada (archivo) se utiliza para recuperar el archivo cargado
    let archivo = req.files.archivo;

    //Obteniendo el nombre del archivo "archivo"
    //Retorna ['nombre', 'extension']
    let nombreCortado = archivo.name.split('.');

    //Obteniendo la extension del archivo subido
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extenciones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    //Si al comparar la "extension" con las "extensiones permitidas", nose encuentra nada 
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las Extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //Si la Extension del archivo cargado es igual a una de las extensionesValidas

    //Cambiar el nombre del archivo para hacerlo unico
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Utilizar el Metodo mv() para colocar el archivo en algún lugar de su servidor 
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        //Si sucede algun error 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si el tipo es usuarios
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo, tipo);
        }

        //Si el tipo es productos
        if (tipo === 'productos') {
            imagenProducto(id, res, nombreArchivo, tipo);
        }
    });
});



//=============================
//  Declaracion de Funciones
//=============================

/*
    Declarando funcion que sera usada para subir el path de la  
    img de un Usuario a la DB
*/
function imagenUsuario(id, res, nombreArchivo, tipo) {
    //Buscando en la DB un usuario con el id que viene por parametro
    Usuario.findById(id, (err, usuarioDB) => {
        //Si sucede un error 
        if (err) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no Existe el usuario en la DB
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no Existe'
                }
            });
        }

        //Aqui ya se encontro el usuario en la DB

        //Borrando la img del servidor 
        borraArchivo(usuarioDB.img, tipo);

        //Cambiando el contenido de la propiedad img del usuario encontrado
        usuarioDB.img = nombreArchivo;

        //Guardando los cambios en la DB
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });
    });
}

function imagenProducto(id, res, nombreArchivo, tipo) {
    //Buscando en la DB un producto con el id que viene por parametro
    Producto.findById(id, (err, productoDB) => {
        //Si sucede un error 
        if (err) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no Existe el producto en la DB
        if (!productoDB) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no Existe'
                }
            });
        }

        //Aqui ya se encontro el producto en la DB

        //Borrando la img del servidor 
        borraArchivo(productoDB.img, tipo);

        //Cambiando el contenido de la propiedad img del producto encontrado
        productoDB.img = nombreArchivo;

        //Guardando los cambios en la DB
        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

/*
    Declarando Funcion para borrar una imagen existen en el servidor, 
    funciona para Productos y Usuarios
*/
function borraArchivo(nombreImg, tipo) {
    //Ruta donde se almacenan las imagenes
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImg }`);

    //Validando que la ruta existe. Es decir que hay una img cargada
    if (fs.existsSync(pathImagen)) {
        //Si el resultado es true, eliminar dicha imagen
        //Si el resultado es false, no elimina nada
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;