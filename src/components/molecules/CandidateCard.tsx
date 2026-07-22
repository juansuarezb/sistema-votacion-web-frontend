import { useState } from 'react';
import Icon, { type IconName } from '../atoms/Icon';
import './CandidateCard.css';

interface Position {
  title: string;
  image?: IconName;
  imageUrl?: string;
  name: string;
}

interface CandidateCardProps {
  radioName: string;
  value: string;
  partyName: string;
  partyLabel?: string;
  partyLogo?: IconName;
  partyImageUrl?: string;
  partyBadgeText?: string;
  positions?: Position[];
  defaultChecked?: boolean;
}

export default function CandidateCard({
  radioName,
  value,
  partyName,
  partyLabel = 'Opción',
  partyLogo,
  partyImageUrl,
  partyBadgeText,
  positions = [],
  defaultChecked,
}: CandidateCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <label className={`candidate-card ${positions.length === 0 ? 'candidate-card--single' : ''}`}>
      <input
        type="radio"
        name={radioName}
        value={value}
        className="candidate-card__checkbox"
        defaultChecked={defaultChecked}
      />
      <div className="candidate-card__content">
        <div className="candidate-card__party">
          <p className="candidate-card__party-label">{partyLabel}</p>
          {partyImageUrl && !imageError ? (
            <img 
              src={partyImageUrl} 
              alt={value} 
              className="candidate-card__party-logo" 
              onError={() => setImageError(true)} 
            />
          ) : partyLogo ? (
            <Icon name={partyLogo} alt={value} className="candidate-card__party-logo" />
          ) : (
            <div className="candidate-card__party-badge">{partyBadgeText}</div>
          )}
          <p className="candidate-card__party-name">{partyName}</p>
        </div>
        {positions.length > 0 && (
          <div className="candidate-card__positions">
            {positions.map((position) => (
              <div className="position" key={position.title}>
                <p className="position__title">{position.title}</p>
                {position.imageUrl ? (
                  <img src={position.imageUrl} alt={value} className="position__image" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%' }} />
                ) : position.image ? (
                  <Icon name={position.image} alt={value} className="position__image" />
                ) : null}
                <p className="position__name">{position.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}
