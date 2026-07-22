import { useMemo, useState } from 'react';
import VotanteLayout from '../../components/templates/VotanteLayout';
import Button from '../../components/atoms/Button';
import keycloak from '../../auth/keycloak';
import {
  createVote,
  type TipoVoto,
} from '../../services/voteService';
import { getVotanteByKeycloakId } from '../../services/voterService';
import { getQuestionEligibility } from '../../services/referendumService';
import './ConfirmacionVotoPage.css';

interface RespuestaVoto {
  idReferendum: number;
  idQuestion: number;
  numeroPregunta: number;
  textoPregunta: string;
  tipoVoto: TipoVoto | string;
  nombreCandidato?: string;
}

interface ConfirmacionVotoPageProps {
  onVolverAVotacion: () => void;
  onVotacionCompletada: () => void;
  onLogout: () => void;
}

/**
 * Construye una clave única para identificar una respuesta dentro de un
 * referéndum y evitar registrar dos veces una pregunta ya procesada.
 */
function obtenerClaveRespuesta(
  idReferendum: number,
  idQuestion: number
): string {
  return `${idReferendum}:${idQuestion}`;
}

/**
 * Lee las preguntas registradas exitosamente durante un intento anterior.
 */
function obtenerVotosRegistrados(): Set<string> {
  try {
    const raw = localStorage.getItem('votosRegistrados');

    if (!raw) {
      return new Set<string>();
    }

    const valores = JSON.parse(raw);

    return Array.isArray(valores)
      ? new Set<string>(valores)
      : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

/**
 * Persiste el avance parcial para que un fallo posterior no provoque el
 * reenvío de los votos que ya fueron registrados correctamente.
 */
function guardarVotosRegistrados(
  votosRegistrados: Set<string>
): void {
  localStorage.setItem(
    'votosRegistrados',
    JSON.stringify([...votosRegistrados])
  );
}

export default function ConfirmacionVotoPage({
  onVolverAVotacion,
  onVotacionCompletada,
  onLogout,
}: ConfirmacionVotoPageProps) {
  const [finalizando, setFinalizando] = useState(false);
  const [error, setError] = useState('');

  const respuestas = useMemo<RespuestaVoto[]>(() => {
    try {
      const respuestasRaw =
        localStorage.getItem('respuestasVoto');

      if (!respuestasRaw) {
        return [];
      }

      const parsed = JSON.parse(respuestasRaw);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }, []);

  const finalizarVotacion = async () => {
    if (finalizando) {
      return;
    }

    if (respuestas.length === 0) {
      setError('No existen respuestas para registrar.');
      return;
    }

    const keycloakId = keycloak.tokenParsed?.sub;

    if (!keycloakId) {
      setError(
        'No se pudo identificar al usuario autenticado. Inicie sesión nuevamente.'
      );
      return;
    }

    try {
      setFinalizando(true);
      setError('');

      // Keycloak almacena la identidad, mientras VoterService mantiene el
      // identificador interno utilizado por las asignaciones electorales.
      const perfilVotante =
        await getVotanteByKeycloakId(keycloakId);

      const votosRegistrados =
        obtenerVotosRegistrados();

      for (const respuesta of respuestas) {
        const claveRespuesta = obtenerClaveRespuesta(
          respuesta.idReferendum,
          respuesta.idQuestion
        );

        // Si esta pregunta se registró durante un intento anterior, no debe
        // enviarse nuevamente al backend.
        if (votosRegistrados.has(claveRespuesta)) {
          continue;
        }

        const eligibility =
          await getQuestionEligibility(
            respuesta.idReferendum,
            respuesta.idQuestion,
            perfilVotante.idVotante
          );

        if (!eligibility.puedeVotar) {
          /*
           * HaVotado=true puede indicar que el voto sí se almacenó en un
           * intento anterior, pero el frontend no alcanzó a guardar el avance.
           * En ese caso se considera procesado y se continúa con las demás.
           */
          if (eligibility.haVotado) {
            votosRegistrados.add(claveRespuesta);
            guardarVotosRegistrados(votosRegistrados);
            continue;
          }

          throw new Error(
            eligibility.mensaje ??
              'El votante no es elegible para responder esta pregunta.'
          );
        }

        await createVote({
          idReferendum: respuesta.idReferendum,
          idQuestion: respuesta.idQuestion,
          idVotante: perfilVotante.idVotante,
          tipoVoto: respuesta.tipoVoto,
        });

        // Se guarda inmediatamente después de cada respuesta exitosa. Así,
        // una caída en una pregunta posterior no duplica las anteriores.
        votosRegistrados.add(claveRespuesta);
        guardarVotosRegistrados(votosRegistrados);
      }

      localStorage.removeItem(
        'idReferendumSeleccionado'
      );
      localStorage.removeItem('respuestasVoto');
      localStorage.removeItem('votosRegistrados');
      localStorage.removeItem('ultimoVoto');

      onVotacionCompletada();
    } catch (err) {
      console.error(
        'Error al finalizar votación:',
        err
      );

      if (err instanceof Error) {
        setError(
          `No se pudo finalizar la votación: ${err.message}`
        );
      } else {
        setError(
          'No se pudo finalizar la votación.'
        );
      }
    } finally {
      setFinalizando(false);
    }
  };

  return (
    <VotanteLayout onLogout={onLogout}>
      <div className="confirm-wrapper" style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>
          Revise sus respuestas
        </h1>
        
        <p style={{ fontSize: '18px', color: '#64748b', margin: '0 0 32px' }}>
          Está a un paso de completar su participación. Verifique que sus respuestas sean correctas.
        </p>

        <div className="certification-box" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '32px', textAlign: 'left' }}>
          
          <div style={{ backgroundColor: '#fff8f1', borderLeft: '4px solid #f97316', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '24px' }}>
            <p style={{ margin: 0, color: '#9a3412', fontSize: '15px', fontWeight: 600 }}>
              Atención: Una vez finalizada la votación, su voto quedará registrado permanentemente y no podrá ser modificado.
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <p role="alert" style={{ margin: 0, color: '#b91c1c', fontWeight: 600, fontSize: '15px' }}>
                {error}
              </p>
            </div>
          )}

          {respuestas.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#334155', margin: '0 0 20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                Resumen de sus selecciones
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {respuestas.map((respuesta) => (
                  <div
                    key={obtenerClaveRespuesta(respuesta.idReferendum, respuesta.idQuestion)}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pregunta {respuesta.numeroPregunta}
                    </p>
                    <p style={{ margin: '0 0 16px', fontSize: '17px', color: '#1e293b', fontWeight: 500 }}>
                      {respuesta.textoPregunta}
                    </p>

                    <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: '999px', border: '1px solid #cbd5e1' }}>
                      <span style={{ fontSize: '14px', color: '#475569', marginRight: '8px' }}>Su voto:</span>
                      <strong style={{ fontSize: '16px', color: respuesta.tipoVoto === 'SI' ? '#16a34a' : respuesta.tipoVoto === 'NO' ? '#dc2626' : '#475569' }}>
                        {respuesta.nombreCandidato ? respuesta.nombreCandidato : respuesta.tipoVoto}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#64748b' }}>
              No se encontraron respuestas seleccionadas.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="action"
            style={{ padding: '14px 28px', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600, fontSize: '16px' }}
            onClick={onVolverAVotacion}
            disabled={finalizando}
          >
            Volver y corregir
          </Button>

          <Button
            type="button"
            variant="action"
            style={{ padding: '14px 32px', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 700, fontSize: '16px' }}
            onClick={finalizarVotacion}
            disabled={finalizando || respuestas.length === 0}
          >
            {finalizando ? 'Registrando voto...' : 'Confirmar y Enviar Voto'}
          </Button>
        </div>
      </div>
    </VotanteLayout>
  );
}