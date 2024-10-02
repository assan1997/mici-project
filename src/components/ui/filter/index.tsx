import {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MenuDropdown from "../dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import { CloseIcon } from "@/components/svg";
import { Calendar as CalendarIcon } from "@/components/svg";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar } from "@hassanmojab/react-modern-calendar-datepicker";
import { BaseInput } from "../forms/BaseInput";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import { z } from "zod";
import { Spinner } from "../loader/spinner";
export const Filter: FC<{
  type: "date" | "status" | "search";
  title: string;
  row: string;
  index?: string | number;
  indexs?: string[];
  dataHandler: Function;
  filterDatas: any[];
  list: {
    id: number | string;
    name: string;
  }[];
  filterHandler: Function;
}> = ({
  type,
  title,
  row,
  index,
  indexs,
  list: entryList,
  filterDatas,
  filterHandler,
  dataHandler,
}) => {
  const { box, handleClick } = useActiveState();
  const [list, setList] = useState(
    entryList.map((l) => ({ ...l, active: false }))
  );
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [processSearch, setProcessSearch] = useState<boolean>(false);

  const currentDate = useMemo(() => {
    const date = new Date();
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }, []);

  const [selectedDate, setSlectedDate] = useState<any>({
    from: currentDate,
    to: currentDate,
  });

  const searchSchema = z.object({
    search: z.string(),
  });

  function handleSearch(entry: string) {
    let search: string = entry.toLowerCase();

    function deepSearch(indexs: any[], level: string, cb: Function) {
      for (let element of indexs) {
        if (!element) continue;
        if (typeof element === "object") {
          if (Array.isArray(element)) {
            element.forEach((item) => {
              const deepIndexs = Object.values(item);
              deepSearch(deepIndexs, "array in object", cb);
            });
          } else {
            const deepIndexs = Object.values(element);
            deepSearch(deepIndexs, "!==array in object", cb);
          }
        } else {
          cb(
            indexs
              .filter((item) => item && item)
              .map((item) => item && item.toString().toLowerCase())
          );
        }
      }
    }
    filterHandler((tmp: any) => {
      const newDatas = filterDatas.filter((dt) => {
        setProcessSearch(true);
        const indexs = Object.values(dt);
        let result: any;
        const cb: Function = (data: string[]) => {
          const found = data.some((index) => {
            return index.includes(search.trim());
          });
          if (found) result = dt;
        };
        deepSearch(indexs, "initial", cb);
        return result;
      });
      dataHandler(newDatas);
      setProcessSearch(false);
      return newDatas;
    });
  }
  const onSubmit = async (data: z.infer<typeof searchSchema>) => {
    let { search } = data;
    handleSearch(search);
  };

  const [firstLoading, setFirstLoading] = useState<boolean>(true);
  const resetDateRef = useRef<any>();
  useEffect(() => {
    setFirstLoading(false);
    return () => setFirstLoading(true);
  }, []);

  const handleSelectedDate = (provideInData: any) => {
    if (firstLoading) return;
    const startedDay = provideInData?.from?.day;
    const startedMonth = provideInData?.from?.month;
    const startedYear = provideInData?.from?.year;
    const endedDay = provideInData?.to?.day;
    const endedMonth = provideInData?.to?.month;
    const endedYear = provideInData?.to?.year;
    const selectedStartedTimestamp = new Date(
      `${startedYear}-${startedMonth}-${startedDay}`
    ).getTime();
    const selectedEndedTimestamp = new Date(
      `${endedYear}-${endedMonth}-${endedDay}`
    ).getTime();

    filterHandler((tmp: any) => {
      const newDatas = filterDatas.filter((dt) => {
        const timestamp = new Date(
          `${new Date(dt.created_at || dt.updated_at).getFullYear()}-${
            new Date(dt.created_at || dt.updated_at).getMonth() + 1
          }-${new Date(dt.created_at || dt.updated_at).getDate()}`
        ).getTime();
        const found =
          selectedStartedTimestamp === timestamp ||
          (selectedStartedTimestamp <= timestamp &&
            selectedEndedTimestamp >= timestamp) ||
          selectedEndedTimestamp === timestamp;
        return found && dt;
      });
      dataHandler(newDatas);
      return newDatas;
    });
  };
  // useEffect(() => {

  //   handleSelectedDate();
  //   // console.log("selectedDate", selectedDate);
  // }, [selectedDate, firstLoading]);

  const form = useForm({ schema: searchSchema });
  const reset = (e: any) => {
    e.stopPropagation();
    filterHandler(filterDatas);
    dataHandler(filterDatas);
    setSelected(undefined);
    form.setValue("search", "");
  };

  if (type === "date")
    return (
      <div className="relative">
        <div ref={box}>
          <MenuDropdown
            dropdownOrigin="bottom-right"
            otherStyles={"w-auto"}
            buttonContent={
              <div className="rounded-[20px] bg-white px-[10px] border">
                <div
                  onClick={() => {
                    handleClick();
                  }}
                  className={`h-[40px] flex items-center gap-x-[10px] justify-center`}
                >
                  <CalendarIcon className={""} size={16} />
                  <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                    {title} {selected ? ` - ${selected}` : ""}
                  </span>
                  {/* <div className="h-1/3 w-[1px] bg-black"></div>j */}
                  <div
                    ref={resetDateRef}
                    onClick={reset}
                    className="border-black p-[10px]"
                  >
                    <CloseIcon size={10} />
                  </div>
                </div>
              </div>
            }
          >
            <div className="bg-white w-auto shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
              {/* <div className="w-[200px] h-[200px] bg-red-500"></div> */}
              <Calendar
                onChange={(data) => {
                  setSlectedDate(() => {
                    handleSelectedDate(data);
                    return data;
                  });
                }}
                value={selectedDate as any}
              />
            </div>
          </MenuDropdown>
        </div>
      </div>
    );
  if (type === "status")
    return (
      <div ref={box}>
        <MenuDropdown
          dropdownOrigin="bottom-right"
          otherStyles={"w-auto"}
          buttonContent={
            <div className="rounded-[20px] min-w-[300px]  bg-white px-[10px] border">
              <div
                onClick={() => {
                  handleClick();
                }}
                className={`h-[40px] flex items-center justify-between`}
              >
                <div className="flex gap-x-[10px] items-center">
                  <svg
                    fill="none"
                    height="16"
                    viewBox="0 0 24 24"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                    id="fi_8017777"
                  >
                    <path
                      clipRule="evenodd"
                      d="m18 12c2.2091 0 4-1.7909 4-4 0-2.20914-1.7909-4-4-4-1.8638 0-3.4299 1.27477-3.874 3h-11.126c-.55228 0-1 .44772-1 1 0 .55229.44772 1 1 1h11.126c.4441 1.7252 2.0102 3 3.874 3zm-2-4c0 1.10457.8954 2 2 2s2-.89543 2-2-.8954-2-2-2-2 .89543-2 2zm-14 8c0-2.2091 1.79086-4 4-4 1.86384 0 3.42994 1.2748 3.87398 3h11.12602c.5523 0 1 .4477 1 1s-.4477 1-1 1h-11.12602c-.44404 1.7252-2.01014 3-3.87398 3-2.20914 0-4-1.7909-4-4zm6 0c0-1.1046-.89543-2-2-2s-2 .8954-2 2 .89543 2 2 2 2-.8954 2-2z"
                      fill="rgb(0,0,0)"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <div className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                    {title} {selected ? ` - ${selected}` : ""}
                  </div>
                </div>
                <div onClick={reset} className="px-[4px]">
                  <CloseIcon size={10} />
                </div>
              </div>
            </div>
          }
        >
          <div className="bg-white w-[200px] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
            <div className="flex flex-col items-center p-[4px] w-full">
              {list.map(({ id, name, active }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    filterHandler((tmp: any) => {
                      const newDatas = filterDatas.filter(
                        (dt) => dt[index as any] === id
                      );
                      dataHandler(newDatas);
                      setSelected(name);
                      return newDatas;
                    });

                    setList((tmp) =>
                      tmp.map((l) =>
                        l.id === id
                          ? { ...l, active: true }
                          : { ...l, active: false }
                      )
                    );
                  }}
                  className="flex items-center justify-start w-full cursor-pointer"
                >
                  <div
                    className={`text-[14px] text-justify w-full p-[4px] transition-all hover:bg-slate-50 ${
                      active ? "bg-slate-100" : ""
                    } text-[#000] rounded-lg font-poppins font-medium leading-[20px]`}
                  >
                    {name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </MenuDropdown>
      </div>
    );
  if (type === "search")
    return (
      <div ref={box} className="">
        <MenuDropdown
          dropdownOrigin="bottom-right"
          otherStyles={"w-auto"}
          buttonContent={
            <div className="rounded-[20px] bg-white px-[10px] border">
              <div
                onClick={() => {
                  handleClick();
                }}
                className={`h-[40px] flex items-center justify-center gap-x-[4px]`}
              >
                <svg
                  enableBackground="new 0 0 48 48"
                  height="16"
                  viewBox="0 0 48 48"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  id="fi_2811790"
                >
                  <g id="_x32_-Magnifying_Glass">
                    <path d="m40.2850342 37.4604492-6.4862061-6.4862061c1.9657593-2.5733643 3.0438843-5.6947021 3.0443115-8.9884033 0-3.9692383-1.5458984-7.7011719-4.3530273-10.5078125-2.8066406-2.8066406-6.5380859-4.3525391-10.5078125-4.3525391-3.9692383 0-7.7011719 1.5458984-10.5078125 4.3525391-5.7939453 5.7944336-5.7939453 15.222168 0 21.015625 2.8066406 2.8071289 6.5385742 4.3530273 10.5078125 4.3530273 3.2937012-.0004272 6.4150391-1.0785522 8.9884033-3.0443115l6.4862061 6.4862061c.3901367.390625.9023438.5859375 1.4140625.5859375s1.0239258-.1953125 1.4140625-.5859375c.78125-.7807617.78125-2.0473633 0-2.828125zm-25.9824219-7.7949219c-4.234375-4.234375-4.2338867-11.1245117 0-15.359375 2.0512695-2.0507813 4.7788086-3.1806641 7.6796875-3.1806641 2.9013672 0 5.628418 1.1298828 7.6796875 3.1806641 2.0512695 2.0512695 3.1811523 4.7788086 3.1811523 7.6796875 0 2.9013672-1.1298828 5.628418-3.1811523 7.6796875s-4.7783203 3.1811523-7.6796875 3.1811523c-2.9008789.0000001-5.628418-1.1298827-7.6796875-3.1811523z"></path>
                  </g>
                </svg>
                {/* text-[#636363]  */}
                <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                  {title} {selected ? ` - ${selected}` : ""}
                </span>
                {selected ? (
                  <div onClick={reset} className="border-black px-[4px]">
                    <CloseIcon size={10} />
                  </div>
                ) : null}
              </div>
            </div>
          }
        >
          <Form form={form} onSubmit={onSubmit}>
            <div className="bg-white w-[500px] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
              <div className="w-full p-[10px]">
                <BaseInput
                  id="search"
                  placeholder="Recherchez et appuyez sur entrée"
                  leftIcon={
                    <svg
                      enableBackground="new 0 0 48 48"
                      height={20}
                      viewBox="0 0 48 48"
                      width={20}
                      xmlns="http://www.w3.org/2000/svg"
                      id="fi_2811806"
                    >
                      <g id="_x32_-Magnifying_Glass">
                        <path d="m40.8994141 39.4853516-7.8127441-7.8127441c2.3978882-2.734375 3.7209473-6.1942749 3.7209473-9.8649902 0-4.0068359-1.5605469-7.7734375-4.3935547-10.6064453s-6.5996094-4.3935547-10.6064453-4.3935547-7.7734375 1.5605469-10.6064453 4.3935547-4.3935547 6.5996094-4.3935547 10.6064453 1.5605469 7.7734375 4.3935547 10.6064453 6.5996094 4.3935547 10.6064453 4.3935547c3.6707153 0 7.1306152-1.3230591 9.8649902-3.7209473l7.8127441 7.8127441c.1953125.1953125.4511719.2929688.7070313.2929688s.5117188-.0976563.7070313-.2929688c.3906249-.390625.3906249-1.0234375-.0000001-1.4140625zm-28.2841797-8.4853516c-2.4550781-2.4555664-3.8076172-5.7202148-3.8076172-9.1923828s1.3525391-6.7368164 3.8076172-9.1923828c2.4555664-2.4550781 5.7202148-3.8076172 9.1923828-3.8076172s6.7368164 1.3525391 9.1923828 3.8076172c2.4550781 2.4555664 3.8076172 5.7202148 3.8076172 9.1923828s-1.3525391 6.7368164-3.8076172 9.1923828c-2.4555664 2.4550781-5.7202148 3.8076172-9.1923828 3.8076172s-6.7368164-1.3525391-9.1923828-3.8076172z"></path>
                      </g>
                    </svg>
                  }
                  rightIcon={
                    processSearch ? (
                      <Spinner color={"#000"} size={20} />
                    ) : (
                      <button type="button" onClick={reset}>
                        <CloseIcon />
                      </button>
                    )
                  }
                  type="text"
                  onChange={(e) => {
                    form.setValue("search", e.target.value);
                    handleSearch(e.target.value);
                  }}
                  // {...form.register("search")}
                />
              </div>
            </div>
          </Form>
        </MenuDropdown>
      </div>
    );
};
