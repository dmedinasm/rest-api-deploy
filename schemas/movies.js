const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum genres'
    })
})

function validateMovie (input) {
  return movieSchema.safeParse(input)// El safeParse da un objecto result que va a decir
  // si hay un error o si hay datos
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)// partial:Todas y cada una de las propiedades que tenemos aqui
  // las vamos a hacer opcionales, si no esta no pasa nada
  // Si esta la valida como se supone que la tiene que validar
  // Reaprovechamos este esquema zod que ya tenemos
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
