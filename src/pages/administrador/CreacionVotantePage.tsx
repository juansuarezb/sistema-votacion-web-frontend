import AdminLayout from '../../components/templates/AdminLayout';
import PlainField from '../../components/molecules/PlainField';

export default function CreacionVotantePage() {
  return (
    <AdminLayout>
      <h2>Nuevo Votante</h2>

      <form>
        <PlainField label="Nombre:" name="nombre" type="text" required />
        <PlainField label="Correo electrónico:" name="correo" type="email" required />
        <PlainField label="Contraseña:" name="contrasena" type="password" required />

        <button type="submit">Guardar</button>
        <a href="#">Cancelar</a>
      </form>
    </AdminLayout>
  );
}
