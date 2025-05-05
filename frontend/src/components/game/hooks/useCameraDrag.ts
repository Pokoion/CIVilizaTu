import { useEffect, useRef } from 'react';

type Offset = { x: number; y: number };
type SetCameraOffset = React.Dispatch<React.SetStateAction<Offset>>;

export function useCameraDrag(setCameraOffset: SetCameraOffset) {
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        dragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setCameraOffset(prev => {
          const nuevo = { x: prev.x + dx, y: prev.y + dy };
          console.log('Cámara arrastrada:', nuevo);
          return nuevo;
        });
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, [setCameraOffset]);
}