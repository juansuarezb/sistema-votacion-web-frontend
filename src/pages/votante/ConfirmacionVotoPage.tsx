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
  tipoVoto: TipoVoto;
}

interface ConfirmacionVotoPageProps {
  onVolverAVotacion: () => void;
  onFinalizarSesion: () => void;
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
  onFinalizarSesion,
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

      onFinalizarSesion();
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
      <div className="confirm-wrapper">
        <h1 className="confirm-title">
          REVISAR VOTO
        </h1>

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
            aria-hidden="true"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>

        <div className="certification-box">
          <p className="confirm-p">
            Revise sus respuestas antes de finalizar
            la votación.
          </p>

          <p
            style={{
              color: '#b71c1c',
              fontWeight: 'bold',
            }}
          >
            Una vez finalizada la votación, no podrá
            modificar sus respuestas.
          </p>

          {error && (
            <p
              role="alert"
              style={{
                color: 'red',
                fontWeight: 'bold',
              }}
            >
              {error}
            </p>
          )}

          {respuestas.length > 0 ? (
            <div
              style={{
                textAlign: 'left',
                marginBottom: '24px',
              }}
            >
              <h3>
                Resumen de respuestas seleccionadas
              </h3>

              {respuestas.map((respuesta) => (
                <div
                  key={obtenerClaveRespuesta(
                    respuesta.idReferendum,
                    respuesta.idQuestion
                  )}
                  style={{
                    borderBottom: '1px solid #ddd',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <p>
                    <strong>
                      Pregunta {respuesta.numeroPregunta}:
                    </strong>{' '}
                    {respuesta.textoPregunta}
                  </p>

                  <p>
                    <strong>
                      Respuesta seleccionada:
                    </strong>{' '}
                    {respuesta.tipoVoto}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>
              No se encontraron respuestas seleccionadas.
            </p>
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
              style={{
                textDecoration: 'none',
                maxWidth: 280,
              }}
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
              disabled={
                finalizando ||
                respuestas.length === 0
              }
            >
              {finalizando
                ? 'Finalizando...'
                : 'Finalizar votación'}
            </Button>
          </div>
        </div>
      </div>
    </VotanteLayout>
  );
}