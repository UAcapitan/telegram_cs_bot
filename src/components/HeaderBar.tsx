type HeaderBarProps = {
  firstName: string;
};

export function HeaderBar({ firstName }: HeaderBarProps) {
  return (
    <header className="header-bar panel">
      <div>
        <p className="eyebrow">Premium Case</p>
        <h1 className="case-title">Shadow Knife Case</h1>
      </div>
      <p className="greeting">Welcome, {firstName}</p>
    </header>
  );
}
