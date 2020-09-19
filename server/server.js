//Requiriendo la configuracion Globales 
require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

//Habilitar la carpeta Publica 
app.use(express.static(path.resolve(__dirname, '../public')));

//Importando las rutas
app.use(require('./routes/index'));

//Conección a la db 
mongoose.connect(process.env.URLDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    },
    (err, res) => {
        if (err) throw err;

        console.log('Base de Datos ONLINE');
    }
);

app.listen(process.env.PORT, () => {
    console.log('Servidor escuchando por el puerto: ', process.env.PORT);
});