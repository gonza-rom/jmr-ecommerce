'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Slider de rango de precios con dos thumbs.
 * - Estado LOCAL independiente del padre mientras se arrastra
 * - Solo notifica al padre con debounce de 500ms tras soltar el slider
 * - Los inputs numéricos notifican al perder el foco (onBlur)
 */
export default function PriceRangeSlider({
  min = 0,
  max = 100000,
  value,
  onChange,
  formatPrice = (n) => `$${n.toLocaleString('es-AR')}`,
}) {
  // Estado LOCAL — el padre no lo controla mientras el usuario arrastra
  const [localMin, setLocalMin] = useState(value?.[0] ?? min);
  const [localMax, setLocalMax] = useState(value?.[1] ?? max);

  const debounceRef = useRef(null);

  // Sin useEffect de sync — el padre usa key={sliderKey} para remount en reset

  const notifyParent = (newMin, newMax) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(newMin, newMax), 500);
  };

  // Slider handlers: actualiza estado local + debounce para el padre
  const handleMinSlider = (e) => {
    const val = Math.min(Number(e.target.value), localMax - 1);
    setLocalMin(val);
    notifyParent(val, localMax);
  };

  const handleMaxSlider = (e) => {
    const val = Math.max(Number(e.target.value), localMin + 1);
    setLocalMax(val);
    notifyParent(localMin, val);
  };

  // Input numérico: edición libre, notifica solo al perder foco
  const handleMinInput = (e) => setLocalMin(Number(e.target.value));
  const handleMaxInput = (e) => setLocalMax(Number(e.target.value));

  const handleMinBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const val = Math.max(min, Math.min(localMin, localMax - 1));
    setLocalMin(val);
    onChange(val, localMax);
  };

  const handleMaxBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const val = Math.min(max, Math.max(localMax, localMin + 1));
    setLocalMax(val);
    onChange(localMin, val);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const pctMin = ((localMin - min) / (max - min)) * 100;
  const pctMax = ((localMax - min) / (max - min)) * 100;
  const step   = Math.max(1, Math.floor((max - min) / 200));

  const thumbBase = [
    'absolute w-full h-full appearance-none bg-transparent',
    'pointer-events-none',
    '[&::-webkit-slider-thumb]:pointer-events-auto',
    '[&::-moz-range-thumb]:pointer-events-auto',
    '[&::-webkit-slider-thumb]:appearance-none',
    '[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
    '[&::-webkit-slider-thumb]:rounded-full',
    '[&::-webkit-slider-thumb]:bg-white',
    '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-jmr-green',
    '[&::-webkit-slider-thumb]:shadow-md',
    '[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing',
    '[&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform',
    '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5',
    '[&::-moz-range-thumb]:rounded-full',
    '[&::-moz-range-thumb]:bg-white',
    '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-jmr-green',
    '[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab',
  ].join(' ');

  return (
    <div className="w-full select-none">
      {/* Etiquetas de valores */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-jmr-green bg-green-50 px-2 py-0.5 rounded">
          {formatPrice(localMin)}
        </span>
        <span className="text-xs text-gray-400">—</span>
        <span className="text-sm font-semibold text-jmr-green bg-green-50 px-2 py-0.5 rounded">
          {formatPrice(localMax)}
        </span>
      </div>

      {/* Track + thumbs superpuestos */}
      <div className="relative h-6 flex items-center">
        {/* Fondo del track */}
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full pointer-events-none" />

        {/* Rango coloreado */}
        <div
          className="absolute h-1.5 bg-jmr-green rounded-full pointer-events-none"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />

        {/* Thumb MIN */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={localMin}
          onChange={handleMinSlider}
          className={thumbBase}
          style={{ zIndex: localMin > max * 0.9 ? 5 : 3 }}
        />

        {/* Thumb MAX */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={localMax}
          onChange={handleMaxSlider}
          className={thumbBase}
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Inputs numéricos directos */}
      <div className="flex gap-2 mt-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Mínimo</label>
          <input
            type="number"
            value={localMin}
            min={min}
            max={localMax - 1}
            onChange={handleMinInput}
            onBlur={handleMinBlur}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jmr-green text-center"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Máximo</label>
          <input
            type="number"
            value={localMax}
            min={localMin + 1}
            max={max}
            onChange={handleMaxInput}
            onBlur={handleMaxBlur}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-jmr-green text-center"
          />
        </div>
      </div>
    </div>
  );
}