const mensaje = '¿Está seguro de que desea continuar con esta acción?';

export default function ErrorConfirmacionPage() {
  return (
    <>
      <nav>
        <h1>VotoSeguro</h1>
      </nav>

      <h2>Confirmación</h2>
      <p>{mensaje}</p>

      <a href="#">Aceptar</a>
      <a href="#">Cancelar</a>
    </>
  );
}
