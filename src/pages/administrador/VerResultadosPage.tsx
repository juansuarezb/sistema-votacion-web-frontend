import AdminLayout from '../../components/templates/AdminLayout';

const votacion = {
  idVotacion: 1,
  titulo: 'Elección Presidencial 2026',
  descripcion: 'Segunda vuelta electoral',
  fechaInicio: '2026-08-01',
  fechaCierre: '2026-08-15',
};

const escrutinio = {
  votosSi: 12043,
  votosNo: 9876,
  votosBlanco: 302,
  votosNulo: 154,
  totalVotosEmitidos: 22375,
  porcentajeParticipacion: 61.4,
};

/**
 * Nota: el original conecta a un WebSocket (ws://localhost:8080/resultados/{id})
 * para actualizar estos valores en vivo. Se omite aquí (solo vista, sin
 * funcionalidad) y se muestra un estado estático de ejemplo.
 */
export default function VerResultadosPage() {
  return (
    <AdminLayout welcomeName="Admin">
      <h2>Resultados: {votacion.titulo}</h2>
      <p>{votacion.descripcion}</p>
      <p>
        Fecha inicio: {votacion.fechaInicio} | Fecha cierre: {votacion.fechaCierre}
      </p>

      <hr />

      <h3>Escrutinio</h3>

      <table border={1}>
        <thead>
          <tr>
            <th>Opción</th>
            <th>Votos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sí</td>
            <td>{escrutinio.votosSi}</td>
          </tr>
          <tr>
            <td>No</td>
            <td>{escrutinio.votosNo}</td>
          </tr>
          <tr>
            <td>Blanco</td>
            <td>{escrutinio.votosBlanco}</td>
          </tr>
          <tr>
            <td>Nulo</td>
            <td>{escrutinio.votosNulo}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>{escrutinio.totalVotosEmitidos}</strong></td>
          </tr>
        </tfoot>
      </table>

      <br />
      <p>Participación: {escrutinio.porcentajeParticipacion}%</p>
      <p>Última actualización: --:--:--</p>
      <p>Estado: 🟢 En vivo</p>

      <br />
      <a href="#">Volver</a>
      <p>ID Votación: {votacion.idVotacion}</p>
    </AdminLayout>
  );
}
