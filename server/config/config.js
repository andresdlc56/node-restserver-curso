//==============================
//  Puerto
//==============================
process.env.PORT = process.env.PORT || 3000;

//==============================
//  Entorno
//==============================
//Captura el entorno en que se esta trabajando
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==============================
//  Base de Datos
//==============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://andresdlc56:FgjAGsI2rDUn0xoD@cluster0.m429u.mongodb.net/cafe'
}

process.env.URLDB = urlDB;