const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDb = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`Db Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDb();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const movieNames = `
        SELECT 
            movie_name 
        FROM 
            movie`;
  const res = await database.all(movieNames);
  response.send(
    res.map((eachName) => convertDbObjectToResponseObject(eachName))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const creatMovieQuery = `
    INSERT INTO 
        movie (director_id,movie_name,lead_actor)
    VALUES (
        ${directorId}, '${movieName}', '${leadActor}')`;
  const resArray = await database.run(creatMovieQuery);
  response.send("Movie Successfully Added");
});

const createMovieObject = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
        * 
    FROM 
        movie 
    WHERE 
        movie_id = ${movieId};`;
  const getMovieDetails = await database.get(getMovieQuery);

  response.send(createMovieObject(getMovieDetails));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMvDetailsQuery = `
        UPDATE 
            movie 
        SET 
            director_id=${directorId},
            movie_name='${movieName}',
            lead_actor='${leadActor}' ;`;
  await database.run(updateMvDetailsQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM 
            movie 
        WHERE 
            movie_id =${movieId}`;
  await database.run(deleteQuery);
  response.send("Movie Removed");
});

const createDirectorObj = (drObj) => {
  return {
    directorId: drObj.director_id,
    directorName: drObj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getQuery = `
    SELECT 
        * 
    FROM 
        director`;
  const dirres = await database.all(getQuery);

  response.send(dirres.map((eachDirector) => createDirectorObj(eachDirector)));
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovieName) => ({
      movieName: eachMovieName.movie_name,
    }))
  );
});

module.exports = app;
