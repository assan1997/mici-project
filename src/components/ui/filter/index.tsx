import { FC, useState } from "react";
import MenuDropdown from "../dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import { CloseIcon } from "@/components/svg";
export const Filter: FC<{
  title: string;
  row: string;
  index: string | number;
  dataHandler: Function;
  filterDatas: any[];
  list: {
    id: number | string;
    name: string;
  }[];
  filterHandler: Function;
}> = ({ title, row, index, list: entryList, filterDatas, filterHandler, dataHandler }) => {
  const { box, handleClick } = useActiveState();
  const [list, setList] = useState([...entryList]);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const reset = () => {
    filterHandler(filterDatas);
    dataHandler(filterDatas);
    setSelected(undefined);
  }

  return (
    <div ref={box}>
      <MenuDropdown
        dropdownOrigin="bottom-right"
        otherStyles={"w-auto"}
        buttonContent={
          <div className="border px-[12px] rounded-[12px]">
            <div
              onClick={() => {
                handleClick();
              }}
              className={`h-[44px] flex items-center justify-center gap-x-[4px]`}
            >
              <svg
                id="fi_2676824"
                height="20"
                viewBox="0 0 64 64"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill={"#636363"} d="m27 59a2 2 0 0 1 -2-2v-19.23l-18.54-20.39a5.61 5.61 0 0 1 4.15-9.38h42.78a5.61 5.61 0 0 1 4.15 9.38l-18.54 20.39v11.23a2 2 0 0 1 -.75 1.56l-10 8a2 2 0 0 1 -1.25.44zm-16.39-47a1.61 1.61 0 0 0 -1.19 2.69l19.06 21a2 2 0 0 1 .52 1.31v15.84l6-4.84v-11a2 2 0 0 1 .52-1.35l19.06-21a1.61 1.61 0 0 0 -1.19-2.65z"></path>
              </svg>
              {/* text-[#636363]  */}
              <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                {title} {selected ? ` - ${selected}` : ""}
              </span>

              {selected ? <button onClick={(e) => {
                e.stopPropagation();
                reset();
              }} className="border-l border-black px-[4px]">
                <CloseIcon size={10} />
              </button> : null}
            </div>
          </div>
        }
      >
        <div className="bg-white w-[200px] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
          <div className="flex flex-col items-center w-full">
            {list.map(({ id, name }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  filterHandler((tmp: any) => {
                    const newDatas = filterDatas.filter(
                      (dt) => dt[index] === id
                    );
                    console.log("tmp", tmp);
                    console.log("newDatas", newDatas);
                    dataHandler(newDatas);
                    setSelected(name);
                    return newDatas;
                  });
                }}
                className="flex items-center justify-start w-full gap-[8px] py-[8px] px-[10px] rounded-t-[12px] cursor-pointer"
              >
                <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </MenuDropdown>
    </div>
  );
};
