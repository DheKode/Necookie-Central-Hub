import React, { useState } from 'react';

const HEIGHT_CM = 162;
const HEIGHT_M = HEIGHT_CM / 100;
const BIRTH_DATE = new Date('2004-11-19');

const BMIWidget = () => {
  const [weight, setWeight] = useState(60);

  const bmi = (weight / (HEIGHT_M * HEIGHT_M)).toFixed(1);
  const age = Math.abs(new Date(Date.now() - BIRTH_DATE.getTime()).getUTCFullYear() - 1970);

  const getStatus = (value) => {
    if (value < 18.5) return { label: 'Underweight', color: 'bg-sky-400', text: 'text-sky-600' };
    if (value < 24.9) return { label: 'Healthy', color: 'bg-emerald-500', text: 'text-emerald-600' };
    if (value < 29.9) return { label: 'Overweight', color: 'bg-orange-400', text: 'text-orange-600' };
    return { label: 'Obese', color: 'bg-red-500', text: 'text-red-600' };
  };

  const status = getStatus(bmi);
  const progress = Math.min((bmi / 40) * 100, 100);

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm h-full flex flex-col justify-between relative overflow-hidden transition-theme">

      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Health Index</p>
          <h3 className="text-sm font-semibold text-text-main">Body Mass Index</h3>
        </div>
        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-border ${status.text} bg-surface-highlight`}>
          {status.label}
        </div>
      </div>

      <div className="flex items-end gap-1 mt-2 mb-4">
        <span className={`text-5xl font-light tracking-tighter ${status.text}`}>{bmi}</span>
        <span className="text-xs text-text-muted font-mono mb-2">kg/m²</span>
      </div>

      <div className="bg-surface-highlight rounded-xl p-3 border border-border flex items-center justify-between mb-4">
        <span className="text-xs text-text-muted font-medium">Today's Weight</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-16 bg-background border border-border rounded-lg px-2 py-1 text-right text-sm font-mono text-text-main focus:outline-none focus:border-primary transition-colors"
          />
          <span className="text-[10px] text-text-muted font-bold">KG</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] text-text-muted font-mono border-t border-border pt-3">
        <div>HEIGHT: <span className="text-text-main">{HEIGHT_CM}cm</span></div>
        <div className="text-right">AGE: <span className="text-text-main">{age}</span></div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        <div className={`h-full transition-all duration-500 ${status.color}`} style={{ width: `${progress}%` }} />
        <div className="h-full bg-surface-highlight flex-1" />
      </div>
    </div>
  );
};

export default BMIWidget;