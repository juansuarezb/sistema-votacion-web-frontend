import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import VotanteLayout from '../../components/templates/VotanteLayout';
import DignityTabs from '../../components/molecules/DignityTabs';
import CandidateCard from '../../components/molecules/CandidateCard';
import Button from '../../components/atoms/Button';
import {
  getReferendumQuestions,
  type ReferendumQuestion,
} from '../../services/referendumService';
import { type TipoVoto } from '../../services/voteService';
import './VotoPage.css';

interface VotoPageProps {
  onBack: () => void;
  onVoteSuccess: () => void;
  onLogout: () => void;
}

interface RespuestaVoto {
  idReferendum: number;
  idQuestion: number;
  numeroPregunta: number;
  textoPregunta: string;
  tipoVoto: TipoVoto;
}

export default function VotoPage({
  onBack,
  onVoteSuccess,
  onLogout,
}: VotoPageProps) {
  const [questions, setQuestions] = useState<ReferendumQuestion[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedVote, setSelectedVote] = useState<TipoVoto | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const idReferendum = Number(localStorage.getItem('idReferendumSeleccionado'));

  useEffect(() => {
    if (!idReferendum) {
      setError('No se seleccionó ningún referéndum.');
      setLoading(false);
      return;
    }

    getReferendumQuestions(idReferendum)
      .then((data) => {
        setQuestions(data);

        const respuestasRaw = localStorage.getItem('respuestasVoto');
        const respuestas: RespuestaVoto[] = respuestasRaw
          ? JSON.parse(respuestasRaw)
          : [];

        if (data.length > 0) {
          const primeraRespuesta = respuestas.find(
            (respuesta) => respuesta.idQuestion === data[0].idQuestion
          );

          if (primeraRespuesta) {
            setSelectedVote(primeraRespuesta.tipoVoto);
          }
        }
      })
      .catch((err) => {
        console.error('Error al cargar preguntas:', err);
        setError(`No se pudieron cargar las preguntas: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idReferendum]);

  const selectedQuestion = questions[selectedQuestionIndex];

  const guardarRespuestaActual = () => {
    if (!selectedQuestion || !selectedVote) {
      return false;
    }

    const respuestasRaw = localStorage.getItem('respuestasVoto');
    const respuestas: RespuestaVoto[] = respuestasRaw
      ? JSON.parse(respuestasRaw)
      : [];

    const nuevaRespuesta: RespuestaVoto = {
      idReferendum,
      idQuestion: selectedQuestion.idQuestion,
      numeroPregunta: selectedQuestionIndex + 1,
      textoPregunta: selectedQuestion.texto,
      tipoVoto: selectedVote,
    };

    const respuestasActualizadas = [
      ...respuestas.filter(
        (respuesta) => respuesta.idQuestion !== selectedQuestion.idQuestion
      ),
      nuevaRespuesta,
    ].sort((a, b) => a.numeroPregunta - b.numeroPregunta);

    localStorage.setItem(
      'respuestasVoto',
      JSON.stringify(respuestasActualizadas)
    );

    return true;
  };

  const cargarRespuestaDePregunta = (index: number) => {
    const question = questions[index];

    if (!question) {
      setSelectedVote('');
      return;
    }

    const respuestasRaw = localStorage.getItem('respuestasVoto');
    const respuestas: RespuestaVoto[] = respuestasRaw
      ? JSON.parse(respuestasRaw)
      : [];

    const respuesta = respuestas.find(
      (item) => item.idQuestion === question.idQuestion
    );

    setSelectedVote(respuesta?.tipoVoto ?? '');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedQuestion) {
      setError('No hay pregunta seleccionada.');
      return;
    }

    if (!selectedVote) {
      setError('Selecciona una opción de voto.');
      return;
    }

    setError('');
    setSuccess('');

    guardarRespuestaActual();

    const esUltimaPregunta = selectedQuestionIndex >= questions.length - 1;

    if (esUltimaPregunta) {
      onVoteSuccess();
      return;
    }

    const siguienteIndex = selectedQuestionIndex + 1;

    setSelectedQuestionIndex(siguienteIndex);
    cargarRespuestaDePregunta(siguienteIndex);
    setSuccess('Respuesta guardada. Continúa con la siguiente pregunta.');
  };

  const irAPreguntaAnterior = () => {
    guardarRespuestaActual();

    if (selectedQuestionIndex === 0) {
      onBack();
      return;
    }

    const anteriorIndex = selectedQuestionIndex - 1;

    setSelectedQuestionIndex(anteriorIndex);
    cargarRespuestaDePregunta(anteriorIndex);
    setError('');
    setSuccess('');
  };

  const seleccionarPregunta = (index: number) => {
    guardarRespuestaActual();

    setSelectedQuestionIndex(index);
    cargarRespuestaDePregunta(index);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <VotanteLayout onLogout={onLogout}>
        <p>Cargando preguntas...</p>
      </VotanteLayout>
    );
  }

  if (error && questions.length === 0) {
    return (
      <VotanteLayout onLogout={onLogout}>
        <p style={{ color: 'red' }}>{error}</p>
        <Button type="button" variant="nav" onClick={onBack}>
          VOLVER
        </Button>
      </VotanteLayout>
    );
  }

  return (
    <VotanteLayout onLogout={onLogout}>
      {questions.length > 0 && (
        <DignityTabs
          labels={questions.map((_, index) => `Pregunta ${index + 1}`)}
          activeIndex={selectedQuestionIndex}
          onSelect={seleccionarPregunta}
        />
      )}

      <form onSubmit={handleSubmit}>
        {selectedQuestion && (
          <>
            <h1 className="page-content__welcome">
              Pregunta {selectedQuestionIndex + 1}
            </h1>

            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              {selectedQuestion.texto}
            </p>
          </>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <div className="candidates-container">
          <div onClick={() => setSelectedVote('SI')}>
            <CandidateCard
              radioName="opcion"
              value="SI"
              partyName="Sí"
              partyLogo="bandera"
              positions={[
                { title: 'Confirmar voto', image: 'person', name: 'A favor' },
              ]}
            />
          </div>

          <div onClick={() => setSelectedVote('NO')}>
            <CandidateCard
              radioName="opcion"
              value="NO"
              partyName="No"
              partyBadgeText="NO"
              positions={[
                { title: 'Rechazar voto', image: 'person', name: 'En contra' },
              ]}
            />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="opcion"
              value="BLANCO"
              checked={selectedVote === 'BLANCO'}
              onChange={() => setSelectedVote('BLANCO')}
            />{' '}
            Voto en blanco
          </label>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="opcion"
              value="NULO"
              checked={selectedVote === 'NULO'}
              onChange={() => setSelectedVote('NULO')}
            />{' '}
            Voto nulo
          </label>
        </div>

        <div className="navigation-buttons">
          <Button type="button" variant="nav" onClick={irAPreguntaAnterior}>
            {selectedQuestionIndex === 0 ? 'VOLVER' : 'ANTERIOR'}
          </Button>

          <Button type="submit" variant="nav">
            {selectedQuestionIndex >= questions.length - 1
              ? 'REVISAR VOTO'
              : 'SIGUIENTE'}
          </Button>
        </div>
      </form>
    </VotanteLayout>
  );
}