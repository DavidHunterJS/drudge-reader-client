import { useCallback } from 'react';

const useTooltip = () => {
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLLIElement>) => {
      const tooltip = event.currentTarget.querySelector(
        '.tooltipimg'
      ) as HTMLElement;
      if (tooltip) {
        const { left, top } = event.currentTarget.getBoundingClientRect();
        const offsetX = 10; // Adjust the horizontal offset as needed
        const offsetY = 10; // Adjust the vertical offset as needed
        tooltip.style.left = `${event.clientX - left + offsetX}px`;
        tooltip.style.top = `${event.clientY - top + offsetY}px`;
      }
    },
    []
  );

  return handleMouseMove;
};

export default useTooltip;
