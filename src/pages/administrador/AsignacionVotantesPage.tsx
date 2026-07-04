import AdminLayout from '../../components/templates/AdminLayout';

const votacion = { idVotacion: 1, titulo: 'Elección Presidencial 2026', votantesAsignados: [1, 3] };

const votantes = [
  { idUsuario: 1, nombre: 'Ana Pérez', correoElectronico: 'ana.perez@example.com' },
  { idUsuario: 2, nombre: 'Luis Gómez', correoElectronico: 'luis.gomez@example.com' },
  { idUsuario: 3, nombre: 'Carla Ruiz', correoElectronico: 'carla.ruiz@example.com' },
];

export default function AsignacionVotantesPage() {
  return (
    <AdminLayout welcomeName="Admin">
      <h2>Asignar Votantes a: {votacion.titulo}</h2>

      <form>
        <input type="hidden" name="idVotacion" value={votacion.idVotacion} readOnly />

        <table border={1}>
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {votantes.map((votante) => (
              <tr key={votante.idUsuario}>
                <td>
                  <input
                    type="checkbox"
                    name="votantes"
                    value={votante.idUsuario}
                    defaultChecked={votacion.votantesAsignados.includes(votante.idUsuario)}
                  />
                </td>
                <td>{votante.idUsuario}</td>
                <td>{votante.nombre}</td>
                <td>{votante.correoElectronico}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <button type="submit">Guardar asignación</button>
        <a href="#">Cancelar</a>
      </form>
    </AdminLayout>
  );
}
