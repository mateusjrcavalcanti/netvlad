import { useState } from 'react';
import MapImage from '../assets/map.png';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface MapProps {
  selectedRectangle?: string;
}

export default function Map({ selectedRectangle }: MapProps) {
  const [rectangles] = useState<Rectangle[]>([
    { x: 5, y: 5, width: 140, height: 100, label: 'armarios' },
    { x: 145, y: 5, width: 193, height: 62, label: 'porta' },
    { x: 5, y: 105, width: 142, height: 92, label: 'bancadas_a' },
    { x: 145, y: 68, width: 58, height: 128, label: 'corredor' },
    { x: 203, y: 68, width: 140, height: 128, label: 'bancadas_b' },
  ]);

  console.log('rectangles', rectangles, selectedRectangle);
  

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img src={MapImage} alt="" style={{ width: '100%', height: 'auto' }} />
      {rectangles
        .filter(rect => selectedRectangle !== null && (selectedRectangle === undefined || rect.label === selectedRectangle))
        .map((rect, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: rect.y,
              left: rect.x,
              width: rect.width,
              height: rect.height,
              border: '2px solid red',
              backgroundColor: 'rgba(255, 0, 0, 0.3)',
            }}
          />
        ))}
    </div>
  );
}
