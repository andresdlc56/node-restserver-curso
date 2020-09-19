const jwt = require('jsonwebtoken');

//===================
//  Verificar Token
//===================
let verificaToken = (req, res, next) => {
    //Obteniendo el token proveniente del header
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        //Si la informacion es incorrecta
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no Valido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();
    });
}

//===================
//  Verificar adminRole
//===================
let verificaAdmin_Role = (req, res, next) => {
    //Este dato Proviene del Token
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
}

//===================
//  Verificar Token Img
//===================
let verificaTokenImg = (req, res, next) => {
    //Obteniendo el Token que viene en la url
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        //Si la informacion es incorrecta
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no Valido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();
    });
}

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}