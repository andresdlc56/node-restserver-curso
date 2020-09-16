const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: [true, 'Ya existe Una Categoria con este Nombre'],
        required: [true, 'La descripción es Obligatoria']
    },
    //Relacion con las colecciones de Usuarios
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Categoria', categoriaSchema);