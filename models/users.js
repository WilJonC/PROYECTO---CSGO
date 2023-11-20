const Playerqueries = {

  getByCountry: `
                  SELECT 
                          * 
                  FROM 
                          playerstats_csgo 
                  WHERE 
                          country = ?`
                          ,

  //EL LOWER ES PARA QUE LAS BUSQUEDAS SEAN MAS FLEXIBLES
  getByColumnAndValue: `
                          SELECT 
                                  *
                          FROM
                                  playerstats_csgo
                          WHERE 
                                  ?? 
                                    LIKE 
                                          ?`
                                          ,
  getAll:`
          SELECT 
                  *
          FROM 
                  playerstats_csgo`
                  ,

  insertPlayer: `
                  INSERT INTO 
                                playerstats_csgo (
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
                                )
                                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `
                                                  ,

  getByNick: `
                SELECT 
                        *
                FROM 
                        playerstats_csgo
                WHERE LOWER(nick) 
                                      = 
                                        LOWER(?);`
                                        ,
  updateUser: `
                UPDATE 
                          playerstats_csgo
                SET
                          country = ?,
                          teams = ?,
                          maps_played = ?,
                          rounds_played = ?,
                          kd_difference = ?,
                          kd_ratio = ?,
                          total_kills = ?,
                          headshot_percentage = ?,
                          total_deaths = ?,
                          kills_per_round = ?,
                          deaths_per_round = ?
                WHERE LOWER(nick) 
                          = 
                LOWER(?);`
                ,

  deletePlayer: `
                  DELETE 
                          FROM 
                  playerstats_csgo
                          WHERE  
                  nick = `
}
module.exports = Playerqueries;