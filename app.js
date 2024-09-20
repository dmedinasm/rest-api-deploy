const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:1234',
  'http://movies.com',
  'http://dmedinadev.com'
]
const app = express()
app.use(express.json()) // middleware para preparar el body
app.use(cors(
  {
    origin: (origin, callback) => {
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    }
  }
))// middleware de cors
app.disable('x-powered-by') // Deshabilitar el header X-powered-by

// Todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  /* const origin = req.header('origin')
  // El navegador nunca envia la cabecera origin cuando la solicitud viene
  // desde el mismo origin
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  } */
  /* res.header('Access-Control-Allow-Origin', '*')// Todos los origenes, que no sean
  // nuestro propio origen estan permitidos */

  const { genre } = req.query// Recupera los query param de la url
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

// path-to-regexp
app.get('/movies/:id', (req, res) => { // :id es un segmento dinámico que hace referencia a nu parámetro de la URL
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  console.log(result)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // en base de datos
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  // Esto no seria REST, porque estamos guardando el estado en memoria
  // mas adelante lo vamos a cambiar con una base de datos
  movies.push(newMovie)
  res.status(201).json(newMovie) // actualizar la cache del cliente, 201: Recurso Creado
})

app.delete('/movies/:id', (req, res) => {
  /* const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  } */
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.options('/movies/:id', (req, res) => {
  /* const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  return res.send(200) */
})

const PORT = process.env.PORT ?? 1234 // Importante para que sea la variable de entorno
// del proceso la que lo ejecute

app.listen(PORT, () => {
  console.log(`server listening on PORT http://localhost:${PORT}`)
})
