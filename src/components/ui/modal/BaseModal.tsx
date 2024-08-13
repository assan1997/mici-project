"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

const BgVariant = ["vermilion-10", "vermilion-10-blur"] as const;

type ModalProps = {
  open: boolean;
  classname: string;
  topContent?: ReactNode;
  children: ReactNode;
  variant?: (typeof BgVariant)[number];
};

// backdrop-blur

const BaseModal: React.FC<ModalProps> = ({
  open,
  classname,
  topContent,
  children,
  variant = "vermilion-10",
}) => {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 h-screen w-full bg-black/50 flex items-center justify-center z-[1000]`}
        >
          <div className="space-y-[1.4rem]">
            {topContent}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
              className={`${classname} shadow-[0px_4px_32px_0px_#00000014] bg-white rounded-[0.8rem] relative overflow-hidden`}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
