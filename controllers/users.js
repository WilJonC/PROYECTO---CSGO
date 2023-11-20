const { request, response } = require('express');
const PlayerQueries = require('../models/users')
const pool = require('../db');


// CRUD PARA BUSCAR JUGADORES POR PAIS
const searchByCountry = async (req = request, res = response) => {
  

  const { country } = req.params

  if (!country) {
    res.status(400).json({ msg: 'PLEASE, PROVIDE A COUNTRY' });
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // OBTIENE LOS VALORES PEDIDOS
    const players = await conn.query(PlayerQueries.getByCountry, [country]);
   
    // VERIFICAR SI SE ENCONTRARON JUGADORES
    if (!players) {
      res.status(404).json({ msg: `NO PLAYERS FOUND FOR THE GIVEN COUNTRY: ${country}` });
      return;
    }

    // SI ENCONTRÓ, ENVIA LA LISTA DE JUGADORES EN FORMATO JSON
    res.json({ msg: 'RESULTS:', players });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  } finally {
    if (conn) conn.end();
  }
};

//BUSQUEDA POR COLUMNA Y VALOR 

const searchByColumnAndValue = async (req = request, res = response) => {
  // EXTRAER LOS PARAMETROS COLUMN Y VALUE DE LA SOLICITUD (url)
  const { column, value } = req.params;

  // VERIFICA SI TANTO COMO 'COLUMN' COMO 'VALUE' ESTAN PRESENTES
  if (!column || !value) {
    // EN CASO DE QUE FALTE ALGUNO DE LOS 2 DATOS, SE ENVIA UN ERROR
    res.status(400).json({ msg: 'PLEASE, PROVIDE BOTH A COLUMN AND A VALUE FOR THE SEARCH' });
    return;
  }

  // HACEMOS LA CONEXION A LA BASE DE DATOS
  let conn;

  try {
   
    conn = await pool.getConnection();

      // NO SE USA
    // Escapar el nombre de la columna utilizando la función escapeId de la conexión.
    //const columnName = conn.escapeId(column);

    // SE CONSTRUYE LA CONSULTA UTILIZANDO EL MODELO, REEMPLAZANDO ?? CON EL NOMBRE DE LA COLUMNA ESCAPADO
    const queryString = PlayerQueries.getByColumnAndValue.replace('??', conn.escapeId(column));

    // EJECUTA LA CONSULTA UTILIZANDO EL VALOR PROPORCIONADO (% PARA BUSQUEDAS FLEXIBLES)
    const players = await conn.query(queryString, [`%${value}%`]);

    // VERIFICA SI SE ENCONTRARON JUGADORES
    if (!players) {
      // SI NO SE ENCONTRARON, MANDA MENSAJE DE ERROR 404
      res.status(404).json({ msg: `NO PLAYERS FOUND FOT THE GIVEN COLUMN (${column}) AND VALUE (${value})` });
      return;
    }

    // SI ENCONTRÓ, ENVIA LA LISTA DE JUGADORES EN FORMATO JSON
    res.json({ msg: 'RESULTS:', players });
  } catch (error) {
    // EN CASO DE QUE EXITA ALGUN ERROR, SE REGISTRA EN LA CONSOLA Y SE MANDA UN ERROR 500
    console.error(error);
    res.status(500).json(error);
  } finally {
    // GARANTIZA QUE LA CONEXION SE CIERRE ADECUADAMENTE, TAMBIEN SI EXISTE UN ERROR
    if (conn) conn.end();
  }
};

// COMIENZAN LOS ENDPOINT
// MOSTRAMOS TODO
const listAll = async (req = request, res = response) => {
  let conn;// CONEXION CON LA BASE DE DATOS

  try {
    // NOS CONECTAMOS A LA BASE DE DATOS
    conn = await pool.getConnection();

    // CONSULTA POR TODOS LOS JUGADORES
    const player = await conn.query(PlayerQueries.getAll, (err) => {
      if (err) {
        throw err
      }
    });
    // SI HAY JUGADORES, SE MUESTRAN EN FORMATO JSON
    res.status(200).json({ Total_players: player });
    
  } catch (error) {
    // EN CASO DE ERROR, SE REGISTRA EN LA CONSOLA Y SE MANDA MENSAJE DE ERROR 500
    console.log(error);
    res.status(500).json(error);

  } finally {
    // LIBERAMOS LA CONEXION A LA BASE DE DATOS
    if (conn) conn.end();   
  }
};

// ENDPOINT PARA AGREGAR
const AddUser = async (req = request, res = response) => {
  const {
    nick,
    country,
    teams,
    maps_played,
    rounds_played,
    kd_difference,
    kd_ratio,
    total_kills,
    headshot_percentage,
    total_deaths,
    kills_per_round,
    deaths_per_round
  } = req.body;

  // VERIFICA SU HAY INFORMACION QUE FALTA DEL NUEVO JUGADOR
  if (!nick 
    || !country 
    || !teams 
    || !maps_played 
    || !rounds_played 
    || !kd_difference 
    || !kd_ratio 
    || !total_kills 
    || !headshot_percentage 
    || !total_deaths 
    || !kills_per_round 
    || !deaths_per_round)
     {
      
    res.status(400).json({ msg: 'MISSING INFORMATION' });
    return;
  }

  // SE CREA UN ARRAY CON LOS DATOS DEL JUGADOR
  const PlayerData = [
    nick,
    country,
    teams,
    maps_played,
    rounds_played,
    kd_difference,
    kd_ratio,
    total_kills,
    headshot_percentage,
    total_deaths,
    kills_per_round,
    deaths_per_round
  ];

  let conn;

  try {
    conn = await pool.getConnection();

    // VERIFICAMOS SI YA EXISTE UN JUGADOR QUE TENGA EL MISMO NICK
    const [existingPlayer] = await conn.query(
      PlayerQueries.getByNick,
      [nick],
      (err) => { if (err) throw err; }
    );

    if (existingPlayer) {
      res.status(409).json({ msg: `PLAYER WITH NICK ${nick} ALREADY EXITS` });
      return;
    }

    // SI TODO OK, AGREGA AL NUEVO JUGADOR A LA BASE DE DATOS
    const playerAdded = await conn.query(
      PlayerQueries.insertPlayer,
      [...PlayerData],
      (err) => { if (err) throw err; }
    );
    // VERIFICA SI SE AGREGÓ CORRECTAMENTE
    if (playerAdded.affectedRows === 0) {
      // SI NO SE AGREGÓ CORRECTAMENTE, MANDAMOS UN MENSAJE DE ERROR
      throw new Error({ message: 'FAILED TO ADD PLAYER' });
    }
    // SI Se AGREGÓ CORRECTAMENTE, MANDAMOS EL MENSAJE DE INSERCION EXITOSA
    res.json({ msg: 'PLAYER ADDED SUCCESSFULLY' });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  } finally {
    if (conn) conn.end();
  }
};

//ENDPOINT PARA EDITAR INFORMACION
const updateCsgoPlayer = async (req = request, res = response) => {
  let conn;

  // EXTRAE EL PARAMETRO NICK DE LOS PARAMETROS DE LA SOLICITUD
  const { nick } = req.params; 
  
  // EXTRAE DATOS DEL CUERPO DE LA SOLICITUD
  const {
    country,
    teams,
    maps_played,
    rounds_played,
    kd_difference,
    kd_ratio,
    total_kills,
    headshot_percentage,
    total_deaths,
    kills_per_round,
    deaths_per_round
  } = req.body;

  // CREA UN ARRAY CON LOS DATOS DEL JUGADOR
  let user = [
    country,
    teams,
    maps_played,
    rounds_played,
    kd_difference,
    kd_ratio,
    total_kills,
    headshot_percentage,
    total_deaths,
    kills_per_round,
    deaths_per_round
  ];

  try {

    // OBTIENE UNA CONEXION DE LA POOL DE CONEXIONES
    conn = await pool.getConnection();
    
    // VERIFICA SI EL JUGADOR YA EXITE EN LA BASE DE DATOS
    const [userExists] = await conn.query(
      PlayerQueries.getByNick,
      [nick],
      (err) => { if (err) throw err; }
    );

    if (!userExists) {
      res.status(404).json({ msg: 'PLAYER NOT FOUND' });
      return;
    }

    // CONTIENE LOS VALORES ACTUALES DEL JUGADOR ANTES DE ACTUALIZARLOS
    let oldUser = [
      userExists.nick,
      userExists.country,
      userExists.teams,
      userExists.maps_played,
      userExists.rounds_played,
      userExists.kd_difference,
      userExists.kd_ratio,
      userExists.total_kills,
      userExists.headshot_percentage,
      userExists.total_deaths,
      userExists.kills_per_round,
      userExists.deaths_per_round
    ];

    // COPIA LOS VALORES ACTUALES DEL JUGADOR A UN ARRAY LLAMADO OLDUSER
    user.forEach((userData, index) => {
      if (!userData) {
        user[index] = oldUser[index];
      }
    });
    
    // EJECUTA LA CONSULTA PARA ACTUALIZAR LOS DATOS DE LA BASE DE DATOS
    const userUpdated = await conn.query(
      PlayerQueries.updateUser,
      [...user, nick],
      (err) => { if (err) throw err; }
    );
    
    // VERIFICA SI LA ACTUALIZACON FUE EXITOSA
    if (userUpdated.affectedRows === 0) {
      throw new Error('PLAYER NOT UPDATED');  //MANDA MENSAJE DE ERRO SI FALLO EN LA ACTUALIZACON
    }

    // MENSAJE DE ERROR SI TODO SALIO BIEN, MANDA EL MENSAJE
    res.json({ msg: 'USER UPDATED SUCCESSFULLY', ...oldUser });
  } catch (error) {
    res.status(409).json(error); // EN CASO DE ERROR DURANTE EL PROCESO, ERROR 409
    return;
  } finally {
    if (conn) conn.end();
  }
};

// ENDPOINT PARA BORRAR JUGADORES
const deletePlayer = async (req = request, res = response) => {
  let conn;
  const { nick } = req.params;

  try {
    conn = await pool.getConnection();

    // VERIFICA SI EL JUGADOR EXITE ANTES DE ELIMINARLO
    const [nickExists] = await conn.query(
      PlayerQueries.getByNick,
      [nick]
    );
    
    // SI EL JUGADOR NO EXITE, RESPONDE CON UN ERROR 404i Y EL MENSAJE
    if (!nickExists || nickExists.length === 0) {
      res.status(404).json({ msg: 'NICK NOT FOUND' });
      return;
    }

    // REALIZA LA CONSULTA DE ELIMINACION
    const nickDelete = await conn.query(
      PlayerQueries.deletePlayer,
      [nick]
    );

    // VERIFICAR SI LAS FILAS TUVIERON CAMBIOS DURANTE LA OPERACION DE ELIMINACION
    if (nickDelete.affectedRows === 0) {
      throw new Error({ msg: 'FALIED TO DELETE PLAYER' });  // SI NO HUBO CAMBIOS DURANTE LA OPERACION DE ELIMINACION, MANDA ERROR
    }

    // SI HUBO CAMBIOS, MANDA MENSAJE DE OPERACION EXITOSA
    res.json({ msg: 'PLAYER DELETED SUCCESSFULLY' });
  } catch (error) {
    console.log(error);
    res.status(500).json(error); // POR CUALQUIER ERROR QUE OCURRA DURANTE EL PROCESO
  } finally {
    if (conn) conn.end();
  }
};

module.exports = {searchByCountry,searchByColumnAndValue, listAll, AddUser ,updateCsgoPlayer,deletePlayer};