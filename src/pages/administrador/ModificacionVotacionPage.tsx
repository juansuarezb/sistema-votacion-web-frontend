import AdminLayout from '../../components/templates/AdminLayout';

const votacion = {
  idVotacion: 1,
  titulo: 'Elección Presidencial 2026',
  descripcion: 'Segunda vuelta electoral',
  fechaInicio: '2026-08-01',
  fechaCierre: '2026-08-15',
};

export default function ModificacionVotacionPage() {
  return (
    <AdminLayout>
      <h2>Modificar Votación</h2>

      <form>
        <input type="hidden" name="idVotacion" value={votacion.idVotacion} readOnly />

        <label>Título:</label>
        <input type="text" name="titulo" defaultValue={votacion.titulo} required />
        <br />

        <label>Descripción:</label>
        <textarea name="descripcion" defaultValue={votacion.descripcion} required />
        <br />

        <label>Fecha de inicio:</label>
        <input type="date" name="fechaInicio" defaultValue={votacion.fechaInicio} required />
        <br />

        <label>Fecha de cierre:</label>
        <input type="date" name="fechaCierre" defaultValue={votacion.fechaCierre} required />
        <br />

        <button type="submit">Guardar</button>
        <a href="#">Cancelar</a>
      </form>
    </AdminLayout>
  );
}
