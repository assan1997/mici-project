"use client"; // This is a client component 👈🏽
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import useActiveState from "@/lib/hooks/useActiveState";

const OriginVariant = [
  "bottom-left",
  "bottom-right",
  "top-left",
  "top-right",
] as const;

const buttonContentHeight = "80px";

type dropDownProps = {
  dropdownOrigin?: (typeof OriginVariant)[number];
  otherStyles?: string;
  buttonContent?: React.ReactNode;
  children?: React.ReactNode;
  openWhen?: "double-click" | "click" | undefined;
};

const MenuDropdown = ({
  children,
  buttonContent,
  dropdownOrigin = "bottom-left",
  otherStyles,
  openWhen,
}: dropDownProps) => {
  const { isActive, box, handleClick } = useActiveState();

  return (
    <div ref={box} className={`relative inline-block`}>
      <button
        onClick={() => {
          if (!openWhen) handleClick() as any;
        }}
        onContextMenu={(e) => {
          if (openWhen === "double-click") {
            e.preventDefault()
            handleClick();
          }
        }}
        className="focus:outline-none cursor-pointer w-full "
      >
        {buttonContent}
      </button>
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.36, 0.01, 0, 0.99] }}
            className={`
                  absolute z-[500]
                  ${
                    dropdownOrigin === "bottom-left" &&
                    `bottom-[-${buttonContentHeight}] left-0 `
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
                  bg-white rounded-[8px] 
              `}
            style={{
              boxShadow:
                "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)",
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

MenuDropdown.displayName = "MenuDropdown";

export default MenuDropdown;
