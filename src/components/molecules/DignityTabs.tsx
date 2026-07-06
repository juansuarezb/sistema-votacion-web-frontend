import './DignityTabs.css';

interface DignityTabsProps {
  labels: string[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
}

/**
 * Renderiza las pestañas de preguntas.
 * Si recibe onSelect, permite cambiar de pregunta.
 */
export default function DignityTabs({
  labels,
  activeIndex = 0,
  onSelect,
}: DignityTabsProps) {
  return (
    <div className="dignity-tabs">
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          className={`dignity-tab ${i === activeIndex ? 'active' : ''}`.trim()}
          onClick={() => onSelect?.(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}