const express = require('express');
const cors = require('cors');
require('dotenv').config();
const usersRouter = require('./routes/users')
const pool = require('./db');

class Server {
    constructor() {
        this.app = express(); //  SE INSTACIA EXPRESS
        this.port = process.env.PORT; //DEFINIMOS EL PUERTO

        //Paths     http://localhost:3000/api/v1/csgo/
        this.basePath = '/api/v1'; //RUTA BASE

        this.usersPath = `${this.basePath}/csgo`; //Path PARA LA TABLA PLAYERSTATS_CSGO
        
        this.middlewares(); //INVOCACION DE LOS MIDDLEWARES

        this.routes(); //INVOCAVION DE LAS RUTAS
    }

    
    middlewares(){
        this.app.use(cors());
        this.app.use(express.json()); //PARA PODER INTERPRETAR LOS FORMATOS JSON
    }

    routes(){
        this.app.use(this.usersPath, usersRouter); //EndPoint DE USERS
    }

    listen(){
        this.app.listen(this.port,() => {
            console.log("Server listening on port" +this.port)
        });
    }
}

module.exports = Server;