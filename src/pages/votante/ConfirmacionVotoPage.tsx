import VotanteLayout from '../../components/templates/VotanteLayout';
import Button from '../../components/atoms/Button';
import './ConfirmacionVotoPage.css';

export default function ConfirmacionVotoPage() {
  return (
    <VotanteLayout>
      <div className="confirm-wrapper">
        <h1 className="confirm-title">THANK YOU!</h1>

        <div style={{ margin: '10px 0 30px 0' }}>
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div className="certification-box">
          <div style={{ marginBottom: '20px' }}>
            <svg width="50" height="35" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <p className="confirm-p">Check your Inbox to get the certification</p>
          <Button variant="action" style={{ textDecoration: 'none', maxWidth: 250 }}>
            Inicio
          </Button>
        </div>
      </div>
    </VotanteLayout>
  );
}
