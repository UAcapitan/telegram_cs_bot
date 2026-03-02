import type { SkinItem } from './Roulette';

type ResultPanelProps = {
  hasWon: boolean;
  item: SkinItem | null;
};

export function ResultPanel({ hasWon, item }: ResultPanelProps) {
  const rarityText = item ? item.rarityLabel ?? item.rarity : '';

  if (!item) {
    return (
      <section className="panel result-panel idle">
        <p className="eyebrow">Result</p>
        <h3>Open the case to reveal your first drop.</h3>
      </section>
    );
  }

  if (hasWon) {
    return (
      <section className="panel result-panel win">
        <p className="eyebrow">Congratulations</p>
        <h3 className="win-title">You Unboxed a Knife</h3>
        <div className="result-item knife" data-rarity={item.rarity.toLowerCase()}>
          <div className="result-media result-media-knife">
            <img src={item.image} alt={item.name} loading="lazy" />
          </div>
          <div>
            <p className="item-name">{item.name}</p>
            <p className="item-rarity">{rarityText}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel result-panel">
      <p className="eyebrow">Result</p>
      <h3>Obtained: {item.name}</h3>
      <div className="result-item" data-rarity={item.rarity.toLowerCase()}>
        <div className="result-media">
          <img src={item.image} alt={item.name} loading="lazy" />
        </div>
        <div>
          <p className="item-name">{item.name}</p>
          <p className="item-rarity">{rarityText}</p>
        </div>
      </div>
    </section>
  );
}
