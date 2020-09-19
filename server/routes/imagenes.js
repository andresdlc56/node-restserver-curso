const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', verificaToken, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    //Ruta donde se almacenan las imagenes
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    //Verificar que el pathImagen existe
    //Si el path existe
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        //Path Absoluto para img "no hay Imagen"
        let noImagePath = path.resolve(__dirname, '../assets/not-available-es.png');

        //Enviando una img al cliente
        res.sendFile(noImagePath);
    }
});


module.exports = app;