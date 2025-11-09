'use client';

export type RangeKey = 'live' | '1m' | '5m' | '1h';

type Props = {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
};

export default function TimeRangeSelector({ value, onChange }: Props) {
  const opts: RangeKey[] = ['live', '1m', '5m', '1h'];

  return (
    <div className="btnbar" style={{ marginBottom: '1rem' }}>
      {opts.map((k) => (
        <button
          key={k}
          type="button"
          className={`btn ${value === k ? 'active' : ''}`}
          onClick={() => onChange(k)}
        >
          {k.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
