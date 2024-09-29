'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const useActiveState = () => {
  const box = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  const handleClick = (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsActive(!isActive);
    // e?.stopPropagation();
  };

  const handleOutsideClick = useCallback((event: { target: any }) => {
    if (box?.current && !box?.current?.contains(event.target)) {
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleOutsideClick]);


  return { isActive, box, handleClick };
};

export default useActiveState;
