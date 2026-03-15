import { Element } from '../data/elements';

interface ElementCardProps {
  element: Element;
  isNew?: boolean;
}

function ElementCard({ element, isNew }: ElementCardProps) {
  return (
    <div className={`element-card element-category-${element.category} ${isNew ? 'new' : ''}`}>
      <div className="element-symbol">{element.symbol}</div>
      <div className="element-name">{element.name}</div>
    </div>
  );
}

export default ElementCard;
