import AdminLayout from '../../components/templates/AdminLayout';

const votantes = [
  { idUsuario: 1, nombre: 'Ana Pérez', correoElectronico: 'ana.perez@example.com', votacionesVotadas: 2 },
  { idUsuario: 2, nombre: 'Luis Gómez', correoElectronico: 'luis.gomez@example.com', votacionesVotadas: 0 },
  { idUsuario: 3, nombre: 'Carla Ruiz', correoElectronico: 'carla.ruiz@example.com', votacionesVotadas: 1 },
];

export default function ListaVotantesPage() {
  return (
    <AdminLayout welcomeName="Admin">
      <h2>Gestión de Votantes</h2>

      <a href="#">Nuevo Votante</a>

      <table border={1}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Ha Votado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {votantes.map((votante) => (
            <tr key={votante.idUsuario}>
              <td>{votante.idUsuario}</td>
              <td>{votante.nombre}</td>
              <td>{votante.correoElectronico}</td>
              <td>{votante.votacionesVotadas} votaciones</td>
              <td>
                <a href="#">Editar</a> <a href="#">Eliminar</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
