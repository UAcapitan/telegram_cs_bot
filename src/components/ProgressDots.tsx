type ProgressDotsProps = {
  spinCount: number;
};

const LABELS = ['Spin 1', 'Spin 2', 'Spin 3'];

export function ProgressDots({ spinCount }: ProgressDotsProps) {
  return (
    <section className="panel progress-wrap" aria-label="Spin progress">
      {LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const done = spinCount >= stepNumber;
        const current = spinCount + 1 === stepNumber && spinCount < 3;
        const locked = !done && !current;

        return (
          <div key={label} className={`step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`}>
            <span className="step-icon" aria-hidden="true">
              {done ? '✓' : locked ? '🔒' : '•'}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </section>
  );
}
