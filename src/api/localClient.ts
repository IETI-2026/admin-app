import axios from 'axios'

// Cliente del backend propio del admin-app (servidor Express, NO el backend
// principal NestJS). Las rutas ya incluyen el prefijo `/admin-api`, por lo que
// el baseURL queda relativo al origen:
//  - En desarrollo, Vite hace proxy de /admin-api → http://localhost:4000.
//  - En producción, el servidor Express sirve API y estáticos en el mismo origen.
export const localClient = axios.create({
  baseURL: '',
  timeout: 15000,
})
