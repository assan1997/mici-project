"use client"; // This is a client component 👈🏽
import React, { useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OriginVariant = [
  "bottom-left",
  "bottom-right",
  "top-left",
  "top-right",
] as const;

const buttonContentHeight = "70px";

type dropDownProps = {
  dropdownOrigin?: (typeof OriginVariant)[number];
  otherStyles?: string;
  isActive: boolean;
  setIsActive: any;
  buttonContent?: React.ReactNode;
} & React.ComponentPropsWithRef<"div">;

const BaseDropdown = React.forwardRef<HTMLDivElement, dropDownProps>(
  (
    {
      children,
      buttonContent,
      dropdownOrigin = "bottom-left",
      isActive = false,
      setIsActive,
      otherStyles,
      ...rest
    },
    ref
  ) => {
    // const box = useRef(null)
    const box = useRef<HTMLDivElement>(null);

    // Cette modification spécifie que box
    // est une référence de type HTMLDivElement.
    // Ainsi, la propriété contains devrait être reconnue correctement
    // par le compilateur TypeScript et l'erreur devrait disparaître.

    // const [isActive, setIsActive] = useState(false)

    const handleClick = () => {
      setIsActive(true);
    };

    const handleOutsideClick = useCallback(
      (event: { target: any }) => {
        if (box?.current && !box?.current?.contains(event.target)) {
          setIsActive(false);
        }
      },
      [setIsActive]
    );

    useEffect(() => {
      document.addEventListener("click", handleOutsideClick);

      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }, [handleOutsideClick]);

    return (
      <div ref={box} className={`relative `}>
        <div
          onClick={() => {
            handleClick();
          }}
          className="focus:outline-none cursor-pointer w-full "
        >
          {buttonContent}
        </div>
        <AnimatePresence mode="wait">
          {isActive && (
            <div className="relative bottom-[-4px]  ">
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className={`
                                absolute z-50
                                ${
                                  dropdownOrigin === "bottom-left" &&
                                  `bottom-[-${buttonContentHeight}] left-0`
                                }
                                ${
                                  dropdownOrigin === "bottom-right" &&
                                  `bottom-[-${buttonContentHeight}] right-0`
                                }
                                ${
                                  dropdownOrigin === "top-left" &&
                                  `top-[-${buttonContentHeight}] left-0`
                                }
                                ${
                                  dropdownOrigin === "top-right" &&
                                  `top-[-${buttonContentHeight}] right-0`
                                }
                                ${otherStyles}
                                 bg-white shadow-large rounded-[12px] overflow-hidden
                            `}
              >
                {children}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

BaseDropdown.displayName = "BaseDropdown";

export default BaseDropdown;
