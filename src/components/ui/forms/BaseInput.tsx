import React from "react";
import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import get from "lodash.get";

type InputProps = {
  label?: string;
  placeholder?: string;
  helperText?: string;
  id: string;
  type?: React.HTMLInputTypeAttribute;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & React.ComponentPropsWithRef<"input">;

const BaseInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      id,
      type = "text",
      placeholder,
      helperText,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const {
      formState: { errors },
    } = useFormContext();
    const error = get(errors, id);

    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-[#060606] font-poppins font-[500] text-[14px] leading-[20px]"
          >
            {label}
          </label>
        )}
        <div className="relative my-[4px]">
          {leftIcon && (
            <div className="absolute h-[48px] w-[48px] left-0 top-0 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            aria-describedby={id}
            id={id}
            placeholder={placeholder}
            className={`
                    w-full border-[1px] text-[#060606]  sm:hover:ring-primary-c1-50 font-poppins border-neutral-grayscale-200 rounded-[12px] h-[48px] py-[12px] focus:outline-none 
                    bg-white shadow-custom
                    text-[14px] leading-[24px] font-[400] placeholder:text-primary-black-leg-400
                    ${
                      leftIcon
                        ? "pl-[48px] pr-[12px]"
                        : rightIcon
                        ? "pr-[48px] pl-[12px]"
                        : "px-[12px]"
                    }
                `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute h-[48px] w-[48px] right-0 top-0 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.36, 0.01, 0, 0.99] }}
          >
            <span>{error.message?.toString()}</span>
          </motion.div>
        ) : helperText ? (
          <span>{helperText}</span>
        ) : null}
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";

export default BaseInput;
