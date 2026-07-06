import { useState } from 'react';
import VotanteLayout from '../../components/templates/VotanteLayout';
import Button from '../../components/atoms/Button';
import { createVote, type TipoVoto } from '../../services/voteService';
import './ConfirmacionVotoPage.css';

interface RespuestaVoto {
  idReferendum: number;
  idQuestion: number;
  numeroPregunta: number;
  textoPregunta: string;
  tipoVoto: TipoVoto;
}

interface ConfirmacionVotoPageProps {
  onVolverAVotacion: () => void;
  onFinalizarSesion: () => void;
  onLogout: () => void;
}

export default function ConfirmacionVotoPage({
  onVolverAVotacion,
  onFinalizarSesion,
  onLogout,
}: ConfirmacionVotoPageProps) {
  const [finalizando, setFinalizando] = useState(false);
  const [error, setError] = useState('');

  const respuestasRaw = localStorage.getItem('respuestasVoto');

  const respuestas: RespuestaVoto[] = respuestasRaw
    ? JSON.parse(respuestasRaw)
    : [];

  const finalizarVotacion = async () => {
    if (respuestas.length === 0) {
      setError('No existen respuestas para registrar.');
      return;
    }

    try {
      setFinalizando(true);
      setError('');

      for (const respuesta of respuestas) {
        await createVote({
          idReferendum: respuesta.idReferendum,
          idQuestion: respuesta.idQuestion,
          idVotante: 1, // Temporal: luego saldrá desde Keycloak
          tipoVoto: respuesta.tipoVoto,
        });
      }

      localStorage.removeItem('idReferendumSeleccionado');
      localStorage.removeItem('respuestasVoto');
      localStorage.removeItem('votosRegistrados');
      localStorage.removeItem('ultimoVoto');

      onFinalizarSesion();
    } catch (err) {
      console.error('Error al finalizar votación:', err);

      if (err instanceof Error) {
        setError(`No se pudo finalizar la votación: ${err.message}`);
      } else {
        setError('No se pudo finalizar la votación.');
      }
    } finally {
      setFinalizando(false);
    }
  };

  return (
    <VotanteLayout onLogout={onLogout}>
      <div className="confirm-wrapper">
        <h1 className="confirm-title">REVISAR VOTO</h1>

        <div style={{ margin: '10px 0 30px 0' }}>
          <svg
            width="70"
            height="70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0d47a1"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>

        <div className="certification-box">
          <p className="confirm-p">
            Revise sus respuestas antes de finalizar la votación.
          </p>

          <p style={{ color: '#b71c1c', fontWeight: 'bold' }}>
            Una vez finalizada la votación, no podrá modificar sus respuestas.
          </p>

          {error && (
            <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
          )}

          {respuestas.length > 0 ? (
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <h3>Resumen de respuestas seleccionadas</h3>

              {respuestas.map((respuesta) => (
                <div
                  key={`${respuesta.idReferendum}-${respuesta.idQuestion}`}
                  style={{
                    borderBottom: '1px solid #ddd',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <p>
                    <strong>Pregunta {respuesta.numeroPregunta}:</strong>{' '}
                    {respuesta.textoPregunta}
                  </p>

                  <p>
                    <strong>Respuesta seleccionada:</strong>{' '}
                    {respuesta.tipoVoto}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No se encontraron respuestas seleccionadas.</p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              type="button"
              variant="action"
              style={{ textDecoration: 'none', maxWidth: 280 }}
              onClick={onVolverAVotacion}
              disabled={finalizando}
            >
              Volver a la votación
            </Button>

            <Button
              type="button"
              variant="action"
              style={{
                textDecoration: 'none',
                maxWidth: 250,
                backgroundColor: '#b71c1c',
              }}
              onClick={finalizarVotacion}
              disabled={finalizando}
            >
              {finalizando ? 'Finalizando...' : 'Finalizar votación'}
            </Button>
          </div>
        </div>
      </div>
    </VotanteLayout>
  );
}