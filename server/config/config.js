//==============================
//  Puerto
//==============================
//NOTA: este puerto puede cambiar en produccion
process.env.PORT = process.env.PORT || 3000;

//==============================
//  Entorno
//==============================
//Captura el entorno en que se esta trabajando
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==============================
//  Vencimiento del Token
//==============================
//60 Segundos
//60 Minutos
//24 Horas
//30 dias
process.env.CADUCIDAD_TOKEN = '48h';

//==============================
// Semilla de Autentificación
//==============================
//Nota: el SEED configurado por consola tiene que ser algo muy diferente al que esta entre comillas
process.env.SEED = process.env.SEED || 'secret';

//==============================
//  Base de Datos
//==============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//===========================
//  Google Client Id
//===========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '1057682783779-3752pn2o8ksqc369igqb7hetb8kqklui.apps.googleusercontent.com';