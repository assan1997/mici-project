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
  field?: string;
} & React.ComponentPropsWithRef<"textarea"> & React.ComponentPropsWithRef<"input">;

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
      field,
      ...props
    },
    ref,
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
          {<input
            ref={ref}
            type={type}
            aria-describedby={id}
            id={id}
            placeholder={placeholder}
            className={`
                w-full border-[1px] font-poppins sm:hover:ring-primary-c1-50 border-neutral-grayscale-200 rounded-[10px] h-[48px] py-[12px] focus:outline-none focus:border-vermilion-300 focus:ring-2 focus:ring-vermilion-400
                bg-white shadow-custom focus:ring-offset-2 transition duration-300 ease-out disabled:cursor-not-allowed disabled:placeholder:text-grayscale-500 readOnly:cursor-not-allowed
                text-[14px] leading-[24px] font-[400]  placeholder:text-primary-black-leg-400
                ${leftIcon ? "pl-[48px] pr-[12px]" : rightIcon ? "pr-[48px] pl-[12px]" : "px-[12px]"}
            `}
            {...props}
          />
          }

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

const BaseTextArea = React.forwardRef<HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      id,
      type = "text",
      placeholder,
      helperText,
      leftIcon,
      rightIcon,
      field,
      ...props
    },
    ref,
  ) => {
    const {
      formState: { errors },
    } = useFormContext();
    const error = get(errors, id);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-[#060606] font-poppins font-[500] text-[14px] leading-[20px]"
          >
            {label}
          </label>
        )}
        <div className="relative  w-full my-[4px]">
          {leftIcon && (
            <div className="absolute h-[48px] w-[48px] left-0 top-0 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          {
            <textarea
              ref={ref}
              aria-describedby={id}
              id={id}
              placeholder={placeholder}
              className={`font-poppins
                w-full border-[1px] sm:hover:ring-primary-c1-50 border-neutral-grayscale-200 rounded-[10px] min-h-[48px] h-auto py-[12px] focus:outline-none focus:border-vermilion-300 focus:ring-2 focus:ring-vermilion-400
                bg-white shadow-custom focus:ring-offset-2 transition duration-300 ease-out disabled:cursor-not-allowed disabled:placeholder:text-grayscale-500 readOnly:cursor-not-allowed
                text-[14px] leading-[24px] font-[400]  placeholder:text-primary-black-leg-400
                ${leftIcon ? "pl-[48px] pr-[12px]" : rightIcon ? "pr-[48px] pl-[12px]" : "px-[12px]"}
            `}
              {...props}>{ }</textarea>
          }

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

BaseTextArea.displayName = "BaseTextArea"

BaseInput.displayName = "BaseInput";

export { BaseInput, BaseTextArea };
