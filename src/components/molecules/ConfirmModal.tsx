import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="c-modal-overlay">
      <div className="c-modal" role="dialog" aria-modal="true">
        <h3 className="c-modal__title">{title}</h3>
        <p className="c-modal__message">{message}</p>
        
        <div className="c-modal__actions">
          <button
            type="button"
            className="c-modal__btn c-modal__btn--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            className={`c-modal__btn ${isDestructive ? 'c-modal__btn--danger' : 'c-modal__btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
