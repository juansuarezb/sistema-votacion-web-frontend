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
  nombreCandidato?: string;
}

export default function VotoPage({
  onBack,
  onVoteSuccess,
  onLogout,
}: VotoPageProps) {
  const [questions, setQuestions] = useState<ReferendumQuestion[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedVote, setSelectedVote] = useState<TipoVoto | string>('');
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

    let nombreCandidato;
    if (selectedQuestion.candidatos && selectedQuestion.candidatos.length > 0) {
      const candidato = selectedQuestion.candidatos.find(c => c.idCandidate.toString() === selectedVote);
      if (candidato) {
        nombreCandidato = candidato.nombre;
      }
    }

    const nuevaRespuesta: RespuestaVoto = {
      idReferendum,
      idQuestion: selectedQuestion.idQuestion,
      numeroPregunta: selectedQuestionIndex + 1,
      textoPregunta: selectedQuestion.texto,
      tipoVoto: selectedVote as TipoVoto,
      nombreCandidato,
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

  const hasCandidates = selectedQuestion && selectedQuestion.candidatos && selectedQuestion.candidatos.length > 0;

  return (
    <VotanteLayout onLogout={onLogout}>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
        {questions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <DignityTabs
              labels={questions.map((_, index) => `Pregunta ${index + 1}`)}
              activeIndex={selectedQuestionIndex}
              onSelect={seleccionarPregunta}
            />
          </div>
        )}

      <form onSubmit={handleSubmit}>
        {selectedQuestion && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              Pregunta {selectedQuestionIndex + 1}
            </h1>

            <p style={{ fontSize: '20px', color: '#334155', lineHeight: 1.5, maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
              {selectedQuestion.texto}
            </p>
          </div>
        )}

        {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', color: '#b91c1c', fontWeight: 600 }}>{error}</div>}
        {success && <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', color: '#166534', fontWeight: 600 }}>{success}</div>}

        <div className="candidates-container" style={{ display: 'flex', flexDirection: 'row', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
          {hasCandidates ? (
            selectedQuestion.candidatos!.map(c => {
              const candVal = c.idCandidate.toString();
              const isSelected = selectedVote === candVal;
              return (
                <div 
                  key={c.idCandidate}
                  onClick={() => setSelectedVote(candVal)} 
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'transform 0.2s, box-shadow 0.2s', 
                    transform: isSelected ? 'scale(1.02)' : 'none',
                    borderRadius: '12px',
                    outline: isSelected ? '3px solid #3b82f6' : 'none',
                    boxShadow: isSelected ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                >
                  <CandidateCard
                    radioName="opcion"
                    value={candVal}
                    partyName={c.nombre}
                    partyLabel="Candidato"
                    partyLogo="person"
                    partyImageUrl={c.imagenUrl}
                  />
                </div>
              );
            })
          ) : (
            <>
              <div 
                onClick={() => setSelectedVote('SI')} 
                style={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s, box-shadow 0.2s', 
                  transform: selectedVote === 'SI' ? 'scale(1.02)' : 'none',
                  borderRadius: '12px',
                  outline: selectedVote === 'SI' ? '3px solid #16a34a' : 'none',
                  boxShadow: selectedVote === 'SI' ? '0 10px 15px -3px rgba(22, 163, 74, 0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <CandidateCard
                  radioName="opcion"
                  value="SI"
                  partyName="A favor"
                  partyLabel="Opción Sí"
                  partyLogo="bandera"
                />
              </div>

              <div 
                onClick={() => setSelectedVote('NO')}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s, box-shadow 0.2s', 
                  transform: selectedVote === 'NO' ? 'scale(1.02)' : 'none',
                  borderRadius: '12px',
                  outline: selectedVote === 'NO' ? '3px solid #dc2626' : 'none',
                  boxShadow: selectedVote === 'NO' ? '0 10px 15px -3px rgba(220, 38, 38, 0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <CandidateCard
                  radioName="opcion"
                  value="NO"
                  partyName="En contra"
                  partyLabel="Opción No"
                  partyBadgeText="NO"
                />
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '48px', flexWrap: 'wrap' }}>
          <label 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px', backgroundColor: selectedVote === 'BLANCO' ? '#f1f5f9' : '#ffffff', border: `2px solid ${selectedVote === 'BLANCO' ? '#94a3b8' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: '#475569', transition: 'all 0.2s', width: '220px', justifyContent: 'center' }}
          >
            <input
              type="radio"
              name="opcion"
              value="BLANCO"
              checked={selectedVote === 'BLANCO'}
              onChange={() => setSelectedVote('BLANCO')}
              style={{ width: '18px', height: '18px', accentColor: '#64748b' }}
            />
            Voto en blanco
          </label>

          <label 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px', backgroundColor: selectedVote === 'NULO' ? '#f1f5f9' : '#ffffff', border: `2px solid ${selectedVote === 'NULO' ? '#475569' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', fontWeight: 600, color: '#1e293b', transition: 'all 0.2s', width: '220px', justifyContent: 'center' }}
          >
            <input
              type="radio"
              name="opcion"
              value="NULO"
              checked={selectedVote === 'NULO'}
              onChange={() => setSelectedVote('NULO')}
              style={{ width: '18px', height: '18px', accentColor: '#1e293b' }}
            />
            Voto nulo
          </label>
        </div>

        <div className="navigation-buttons" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <Button type="button" variant="action" onClick={irAPreguntaAnterior} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '12px 32px' }}>
            {selectedQuestionIndex === 0 ? 'VOLVER' : 'ANTERIOR'}
          </Button>

          <Button type="submit" variant="action" style={{ backgroundColor: '#0d47a1', color: '#ffffff', padding: '12px 40px' }}>
            {selectedQuestionIndex >= questions.length - 1 ? 'REVISAR VOTO' : 'SIGUIENTE'}
          </Button>
        </div>
      </form>
      </div>
    </VotanteLayout>
  );
}