import { ChevronRight } from "@/components/icons";
import { FC, useEffect, useMemo, useState } from "react";
export const Pagination: FC<{
  datas: any[];
  listHandler: Function;
}> = ({ datas, listHandler }) => {
  const [currentEnd, setCurrentEnd] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const firstPage = useMemo(() => currentEnd === 10, [currentEnd]);
  const totalPages = useMemo(() => {
    if (Array.isArray(datas)) return Math.ceil(datas.length / 10);
    else return 0;
  }, [datas]);
  const lastPage = useMemo(
    () => totalPages === currentPage,
    [currentPage, totalPages]
  );
  const next = () => {
    setCurrentEnd((prevEnd) => {
      const newEnd = prevEnd + 10;
      const slicedDatas = datas?.slice(prevEnd, newEnd);
      listHandler(slicedDatas);
      return newEnd;
    });
    setCurrentPage((tmp) => tmp + 1);
  };
  const prev = () => {
    setCurrentEnd((prevEnd) => {
      const newEnd = prevEnd - 10;
      const slicedDatas = datas?.slice(newEnd - 10, newEnd);
      listHandler(slicedDatas);
      return newEnd;
    });
    setCurrentPage((tmp) => tmp - 1);
  };
  const init = () => {
    setCurrentEnd(() => {
      const newEnd = 10;
      const slicedDatas = datas?.slice(0, newEnd);
      listHandler(slicedDatas);
      return newEnd;
    });
    setCurrentPage(1);
  };
  useEffect(() => {
    if (datas && datas.length > 0) init();
  }, [datas]);

  return (
    <div className="w-full bg-white/80 border-t border-gray-100 flex justify-end items-center px-[20px] h-[60px]">
      <div className="flex gap-x-[4px]">
        <span className="text-[12px] text-grayscale-900 font-medium font-poppins leading-[20px]">
          {currentPage}
        </span>
        <span className="text-[12px] text-grayscale-900 font-medium font-poppins leading-[20px]">{` - `}</span>
        <span className="text-[12px] text-grayscale-900 font-medium font-poppins leading-[20px]">
          {totalPages}
        </span>
      </div>

      <button
        disabled={firstPage}
        onClick={() => {
          prev();
        }}
      >
        <ChevronRight size={20} color={firstPage ? "#636363" : "#000"} />
      </button>
      <button
        disabled={lastPage}
        onClick={() => {
          next();
        }}
        className="rotate-[180deg]"
      >
        <ChevronRight size={20} color={lastPage ? "#636363" : "#000"} />
      </button>
    </div>
  );
};
