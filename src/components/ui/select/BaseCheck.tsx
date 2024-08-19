'use client'
import get from 'lodash.get';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { CheckIcon } from '../../svg/check';
export type CheckboxProps = {
    label?: string;
    boxClass?: string;
    inputName: string;
    value?: string;
    checked?: boolean
} & React.ComponentPropsWithRef<'input'>;
export const BaseCheckbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, boxClass, inputName, value, checked, ...props }, ref) => {
        const {
            formState: { errors },
        } = useFormContext();
        const error = get(errors, inputName);
        const [decorateBox, setDecorateBox] = React.useState(false);
        return (
            <div>
                <label
                    className={`flex items-center gap-[10px] group shrink-0 border ${decorateBox ? 'border-powder-pink-400' : 'border-grayscale-50'
                        } ${boxClass} `}
                >
                    <input
                        type="checkbox"
                        name={inputName}
                        value={value}
                        id={inputName}
                        className="peer relative 
                        appearance-none shrink-0 w-[20px] h-[20px] border-2 border-grayscale-300 rounded-[8px] 
                        shadow-[0px_2px_2px_0px_rgba(27,28,29,0.12)] bg-white 
                        sm:group-hover:border-grayscale-400 focus:outline-none 
                        focus:ring-offset-0 focus:ring-0 focus:border-powder-pink-400 
                        focus:bg-powder-pink-25 sm:group-hover:focus:border-powder-pink-600 
                        checked:bg-black checked:border-0 sm:group-hover:checked:bg-powder-pink-500 
                        sm:group-hover:checked:border-powder-pink-800 focus:checked:border-powder-pink-600 
                        focus:checked:bg-powder-pink-600 disabled:border-grayscale-400 disabled:bg-grayscale-100 
                        disabled:cursor-not-allowed sm:group-hover:disabled:bg-grayscale-100 transition-all 
                        duration-200 cursor-pointer"
                        onClick={() => {
                            setDecorateBox((prev) => !prev);
                        }}
                        checked={checked}
                        {...props}
                    />
                    <CheckIcon className="absolute w-[16px] h-[16px] pointer-events-none hidden peer-checked:block stroke-white outline-none text-white translate-x-1" />
                    {label && (
                        <span className="block text-[14px] font-poppins font-[400] leading-[2.4rem] cursor-pointer peer-disabled:cursor-not-allowed ">
                            {label}
                        </span>
                    )}
                </label>
                {error && (
                    <span className="mt-2 text-danger-500 font-poppins text-[12px]">
                        {error?.message?.toString()}
                    </span>
                )}
            </div>
        );
    }
);
BaseCheckbox.displayName = 'BaseCheckbox';