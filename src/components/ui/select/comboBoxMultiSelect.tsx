import React, {
  ChangeEventHandler,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon } from "../../svg/chevronDownIcon";
import { BaseCheckbox } from "./BaseCheck";
import { SearchMdIcon } from "@/components/svg/search-md";
interface FormikSelectFieldProps {
  label: string;
  icon: any;
  id: string;
  selectedElementInDropdown?: Array<{ value: string; label: string }> | [];
  setSelectedElementInDropdown?: any;
  selectedUniqElementInDropdown?: string | null;
  setSelectedUniqElementInDropdown?: any;
  options: Array<{ value: string; label: string }>;
  className?: string;
  borderColor?: string;
  error?: any;
  isUniq?: boolean;
  hAuto?: boolean;
  placeholder?: string;
  search?: boolean;
  otherActions?: () => void;
}
const ComboboxCheck: React.FC<FormikSelectFieldProps> = ({
  label,
  icon,
  id,
  options,
  selectedElementInDropdown,
  setSelectedElementInDropdown,
  className,
  isUniq,
  hAuto,
  selectedUniqElementInDropdown,
  setSelectedUniqElementInDropdown,
  borderColor,
  error,
  placeholder,
  otherActions,
  ...rest
}) => {
  const selectDropdownBox = useRef<HTMLDivElement>(null);
  const [selectDropdown, setSelectDropdown] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [localOptions, setLocalOptions] = useState<any>([]);
  const hasAsterisk = label?.endsWith("*");
  const mainText = hasAsterisk ? label?.slice(0, -1) : label;
  const asterisk = hasAsterisk ? "*" : "";

  //  SELECT ELEMENTS IN DROPDOWN --------
  function controlDataSelection(one: { value: string; label: string }) {
    if (isUniq) {
      setSelectedUniqElementInDropdown(
        JSON.stringify([one]) !== JSON.stringify(selectedElementInDropdown)
          ? [one]
          : []
      );
      if (otherActions) {
        otherActions();
      }
      return;
    } else if (
      selectedElementInDropdown?.find(
        (x: { value: string; label: string }) => x?.value === one?.value
      )
    ) {
      setSelectedElementInDropdown(
        (
          el:
            | {
                value: string;
                label: string;
              }[]
            | []
        ) =>
          el?.filter(
            (y: { value: string; label: string }) => y?.value !== one?.value
          )
      );
    } else {
      setSelectedElementInDropdown(
        (
          el:
            | {
                value: string;
                label: string;
              }[]
            | []
        ) => [...el, one]
      );
    }
  }
  function removeLevel(id: string) {
    let data = selectedElementInDropdown?.filter((x) => x.value !== id);
    if (setSelectedElementInDropdown) setSelectedElementInDropdown(data);
    else if (setSelectedUniqElementInDropdown)
      setSelectedUniqElementInDropdown(data);
  }
  // GET INPUT VALUE ON CHANGE ---------
  function filteredDataInDropdown(e: any) {
    setSearchQuery(e.target.value);
    setLocalOptions(
      (
        prev:
          | {
              value: string;
              label: string;
            }[]
          | []
      ) =>
        options.filter((p) => p.label?.toLowerCase()?.includes(e.target.value))
    );
  }
  //  OPEN & CLOSE DROPDOWN ------------
  const handleOutsideClick = useCallback((event: { target: any }) => {
    if (
      selectDropdownBox?.current &&
      !selectDropdownBox?.current?.contains(event.target)
    ) {
      setSelectDropdown("");
    }
  }, []);
  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [handleOutsideClick]);
  useEffect(() => {
    setLocalOptions(options);
  }, [JSON.stringify(options)]);

  const selectedContainer = useRef<any>(null);
  const [canSearch, setCanSearch] = useState<boolean>(false);

  useEffect(() => {
    // selectedContainer.current
  }, []);

  const handleSearch = (event: any) => {
    let { value } = event.target;
    value = value.trim();
    setLocalOptions(
      options.filter(
        (tmpOption) =>
          tmpOption?.label.toLowerCase().includes(value.toLowerCase()) &&
          tmpOption
      )
    );
    if (value.length > 0) setSelectDropdown(id);
    else setSelectDropdown("");
  };
  const inputRef = useRef<any>(null);
  const handleOpenSearch = (e: any) => {
    e.stopPropagation();
    setCanSearch((tmp) => {
      setTimeout(() => {
        //console.log("tmp", tmp);
        if (inputRef.current) {
          if (tmp) inputRef.current.focus();
          // else inputRef.current.blur()
        }
      });
      return !tmp;
    });
  };
  return (
    <>
      <section
        ref={selectDropdownBox}
        className={`relative inline-block  ${className}`}
      >
        {mainText && (
          <label className="block text-[14px] font-poppins leading-[20px] text-grayscale-900 font-[500] mb-[4px]">
            <span className="text-grayscale-900">{mainText}</span>
            {asterisk && <span className="text-danger-500">{asterisk}</span>}
          </label>
        )}
        <label
          htmlFor={id}
          onClick={(e) => {
            e.stopPropagation();
            if (selectDropdown) {
              setSelectDropdown("");
            } else {
              setSelectDropdown(id);
            }
          }}
          className={twMerge(
            `shadow-field flex items-center justify-between px-[1.2rem] text-grayscale-900 font-[500] w-full text-[1.4rem] border rounded-[14px] bg-white placeholder:text-[1.4rem] placeholder:text-grayscale-600 placeholder:font-[400] ${
              selectDropdown === id &&
              "border-vermilion-300 ring-2 ring-offset-2 ring-vermilion-400"
            } transition duration-300 ease-out cursor-pointer`,
            // hAuto ? 'min-h-[48px] py-[1rem]' : 'h-[4rem]'
            "min-h-[40px]",
            borderColor,
            error?.id &&
              "border-danger-600 focus:border-danger-600 focus:ring-1 focus:ring-offset-2 focus:ring-danger-700"
          )}
        >
          <button
            className="mr-[10px]"
            type="button"
            onClick={handleOpenSearch}
          >
            <SearchMdIcon color={canSearch ? "#FD8D65" : "#636363"} />
          </button>
          {
            <>
              {canSearch ? (
                <input
                  onBlur={() => {}}
                  placeholder="Recherche"
                  ref={inputRef}
                  onChange={handleSearch}
                  className={`p-[.8rem] h-[24px] font-medium text-[14px] w-full border-none outline-none font-poppins`}
                />
              ) : (
                <div
                  ref={selectedContainer}
                  className={`w-[93%] flex items-center ${
                    hAuto ? "flex-wrap" : ""
                  } gap-[.8rem] overflow-y-hidden `}
                >
                  {selectedElementInDropdown &&
                  selectedElementInDropdown?.length > 0 ? (
                    selectedElementInDropdown?.map((el, idx) => (
                      <div
                        key={idx}
                        className="border border-grayscale-100 rounded-[8px] p-[.8rem] w-fit h-[24px] flex items-center justify-between gap-2"
                      >
                        <span className="text-[14px] font-poppins font-medium text-grayscale-700 font-[500] leading-[2rem] whitespace-nowrap">
                          {el?.label}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLevel(el?.value);
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 9L9 3M3 3L9 9"
                              stroke="#4F4D55"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-black text-[14px] font-medium leading-[24px] font-poppins">
                      {placeholder || `Sélectionner`}
                    </span>
                  )}
                </div>
              )}
            </>
          }
          <div
            className="shrink-0 text-gray-500 transition duration-300 ease-linear"
            onClick={(e) => {
              e.stopPropagation();
              if (selectDropdown) {
                setSelectDropdown("");
              } else {
                setSelectDropdown(id);
              }
            }}
          >
            <ChevronDownIcon />
          </div>
          {/* </div> */}
        </label>
        <Transition
          show={selectDropdown === id}
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div
            className={`
              ${selectDropdown === id ? "block" : "hidden"}
              absolute left-0 mt-4 origin-top-left z-50 rounded-[12px] p-[1rem] border border-gray-200 bg-white shadow-[0px_12px_16px_-4px_#10182814]  focus:outline-none
              w-[100%] max-h-[28.8rem] overflow-y-scroll
            `}
          >
            {localOptions && localOptions.length > 0 ? (
              <ul className="flex flex-col w-full gap-[4px]">
                {localOptions?.map(
                  (
                    item: {
                      value: string;
                      label: string;
                    },
                    index: number
                  ) => (
                    <Fragment key={index}>
                      <BaseCheckbox
                        value={item.value}
                        label={item.label}
                        inputName={`${id}_name`}
                        boxClass="!border-none"
                        onClick={() => {
                          controlDataSelection(item);
                          setCanSearch(false);
                          // inputRef.current.value = " "
                        }}
                        checked={
                          selectedElementInDropdown?.find(
                            (x) => x.value === item.value
                          )
                            ? true
                            : false
                        }
                        {...rest}
                      />
                    </Fragment>
                  )
                )}
              </ul>
            ) : (
              <div className="w-full">
                <span className="block text-center text-[12px] font-poppins opacity-60 ">
                  {"Aucune donnée trouvée"}
                </span>
              </div>
            )}
          </div>
        </Transition>
      </section>
    </>
  );
};
export default ComboboxCheck;
