// src/components/NetworkTree/useDragScroll.js
import { useState, useRef } from 'react';

/**
 * Custom hook para habilitar el desplazamiento horizontal mediante arrastre de mouse.
 */
export function useDragScroll() {
  const containerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (['BUTTON', 'INPUT', 'SVG', 'PATH'].includes(e.target.tagName)) return;
    setIsMouseDown(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return {
    containerRef,
    isMouseDown,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onMouseLeave: handleMouseLeave,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove,
    }
  };
}