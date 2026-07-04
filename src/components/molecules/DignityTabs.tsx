import './DignityTabs.css';

interface DignityTabsProps {
  labels: string[];
  activeIndex?: number;
}

/** View-only: renders the tab set with one active tab, no click switching (no functionality in scope). */
export default function DignityTabs({ labels, activeIndex = 0 }: DignityTabsProps) {
  return (
    <div className="dignity-tabs">
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          className={`dignity-tab ${i === activeIndex ? 'active' : ''}`.trim()}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
