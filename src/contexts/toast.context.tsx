'use client'

import { motion } from 'framer-motion';
import React, { createContext, useContext, useState } from 'react';
import { FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import { MdOutlineDangerous } from 'react-icons/md';
import Link from 'next/link';
import { CloseIcon } from '@/components/svg';
import { twMerge } from 'tailwind-merge';

const typeVariants = ['success', 'danger', 'warning', 'info'] as const;
const positionVariants = [
  'bottom-left',
  'bottom-right',
  'bottom-center',
  'top-left',
  'top-right',
  'top-center',
] as const;

type Toast = {
  message: string;
  type: (typeof typeVariants)[number];
  position: (typeof positionVariants)[number];
  url?: string;
  urlText?: string;
  className?: string;
};

type ToastContextType = {
  showToast: (options: Toast) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => { },
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const toastTimeoutDuration = 5000;

  const setToastWithTimeout = (options: Toast | null) => {
    if (options) setToast({ ...options });

    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      setToast(null);
    }, toastTimeoutDuration);

    setTimeoutId(newTimeoutId);
  };

  const showToast = (options: Toast) => {
    setToastWithTimeout(options);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setToastWithTimeout(null);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    clearTimeout(timeoutId);
  };
  const handleClose = () => {
    if (isHovered) {
      setToast(null);
    }
  };

  const getPositionValue = () => {
    if (toast?.position === 'top-left') return -100;
    if (toast?.position === 'top-right') return 100;
    if (toast?.position === 'bottom-left') return -100;
    if (toast?.position === 'bottom-right') return 100;
    if (toast?.position === 'top-center') return -50;
    return 50;
  };

  const getPositionAxis = () => {
    if (
      toast?.position === 'top-left' ||
      toast?.position === 'top-right' ||
      toast?.position === 'bottom-left' ||
      toast?.position === 'bottom-right'
    ) {
      return 'x';
    }
    return 'y';
  };

  const animationConfig = {
    initial: {
      opacity: 0,
      scale: 0.8,
      [getPositionAxis()]: getPositionValue(),
    },
    animate: {
      opacity: 1,
      scale: 1,
      [toast?.position === 'bottom-center' || toast?.position === 'top-center'
        ? 'y'
        : 'x']: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      [getPositionAxis()]: getPositionValue(),
    },
  };

  const iconMap = {
    success: <FiCheckCircle className="shrink-0 text-xl text-success-500" />,
    danger: <MdOutlineDangerous className="shrink-0 text-xl text-danger-500" />,
    warning: <FiInfo className="shrink-0 text-xl text-warning-500" />,
    info: <FiInfo className="shrink-0 text-xl text-info-500" />,
  };
  const icon = toast && iconMap[toast.type];

  const positionClasses = {
    'bottom-center': 'bottom-[2.2rem] left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-[2.2rem] left-[2.2rem]',
    'bottom-right': 'bottom-[2.2rem] right-[2.2rem]',
    'top-center': 'left-1/2 top-[2.2rem] -translate-x-1/2',
    'top-left': 'left-[2.2rem] top-[2.2rem]',
    'top-right': 'right-[2.2rem] top-[2.2rem]',
  };
  const positionClass = toast && positionClasses[toast.position];
  let backgroundColor;
  let textColor;
  let closeTextColor;
  if (toast) {
    if (toast.type === 'success') {
      backgroundColor = 'bg-success-500';
      textColor = 'text-white';
      closeTextColor = '#ffffff';
    } else if (toast.type === 'danger') {
      backgroundColor = 'bg-danger-100';
      textColor = 'text-danger-600';
      closeTextColor = '#ffffff';
    } else if (toast.type === 'warning') {
      backgroundColor = 'bg-warning-100';
      textColor = 'text-warning-600';
      closeTextColor = '#ffffff';
    } else if (toast.type === 'info') {
      backgroundColor = 'bg-info-100';
      textColor = 'text-info-600';
      closeTextColor = '#ffffff';
    }
  }


  console.log('backgroundColor', backgroundColor)
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={` whitespace-nowrap fixed ${positionClass} z-[1234567895655555665656556655665]`}
        >
          <motion.div
            initial={animationConfig.initial}
            animate={animationConfig.animate}
            exit={animationConfig.exit}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={twMerge(` 
              inline-flex w-auto items-center justify-between gap-[1.6rem] 
              rounded-[8px] px-[2rem] py-[1.2rem]
              shadow-sm transition-all duration-500 bg-success-500 ease-out sm:gap-[2rem]` , toast?.className, backgroundColor)
            }
          >
            <div className="flex items-center gap-[1.4rem]">
              {/* {icon && <div className="flex items-center gap-3.5">{icon}</div>} */}
              <div>
                <span className={`${textColor} text-[14px] font-[500] leading-[16px]`}>
                  {toast.message}
                </span>
                <div>
                  {toast.url && (
                    <Link
                      href={toast.url || '/'}
                      className=" relative"
                      target="_blank"
                    >
                      <span
                        className={`${textColor} mt-4 text-[14px] font-[500] leading-[16px] underline`}
                      >
                        {toast.urlText}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="cursor-pointer shrink-0" onClick={handleClose}>
              <CloseIcon color={`${closeTextColor}`} />
            </div>
          </motion.div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
