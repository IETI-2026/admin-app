import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  return (
    <main className="state-container">
      <article className="state-card">
        <h2>404</h2>
        <p>No encontramos la ruta que estás buscando.</p>
        <Link to="/review-queue" className="ghost-link">
          Ir a la bandeja
        </Link>
      </article>
    </main>
  )
}
