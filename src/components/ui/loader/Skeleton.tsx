import React from "react";
import { Card, Skeleton } from "@nextui-org/react";

export function TableSkeleton({ head }: { head: string[] }) {
  const tableHead = [...head];
  return (
    <div className="bg-white flex flex-col space-y-2">
      <table className="w-full relative">
        <thead className="bg-white/50">
          <tr className="">
            {tableHead?.map((head, index) => (
              <th
                key={index}
                className={`font-poppins ${
                  head === "options" ? "w-auto" : "min-w-[250px]"
                } text-[13px] py-[10px] font-medium  ${
                  index > 0 && index < tableHead.length
                }  text-[#2f2f2f]`}
              >
                <div className="h-full relative flex items-center text-start px-[10px] justify-start">
                  {head}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white/80">
          {Array.from(new Array(10))?.map((row, index) => (
            <tr key={index} className="border-b">
              {tableHead?.map((_, index) => (
                <td
                  key={index}
                  className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]"
                >
                  <Skeleton className="rounded-[12px]">
                    <div className="h-[30px] rounded-[20px] bg-default-300"></div>
                  </Skeleton>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProfillSkeleton() {
  return (
    <div className="w-[195px] h-[50px] bg-white border flex items-center p-[8px] justify-between rounded-full">
      <div className="flex w-full h-full items-center gap-x-2">
        <Skeleton className="rounded-full">
          <div className="w-[34px] h-[34px] bg-slate-50 rounded-full"></div>
        </Skeleton>
        <div className="w-[calc(100%-54px)] h-full flex flex-col justify-center space-y-1">
          <Skeleton className="w-full rounded-[12px]">
            <div className="h-[13px] rounded-[12px] bg-slate-50"></div>
          </Skeleton>
          <Skeleton className="w-full rounded-[12px]">
            <div className="h-[13px] rounded-[12px] bg-slate-50"></div>
          </Skeleton>
        </div>
        <Skeleton className="rounded-full">
          <div className="w-[10px] h-[10px] bg-slate-50 rounded-full"></div>
        </Skeleton>
      </div>
    </div>
  );
}

export function ButtonSkeleton() {
  return (
    <Skeleton className="rounded-[12px]">
      <button
        type="button"
        className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
      ></button>
    </Skeleton>
  );
}

export function ColumnSkeleton() {
  return (
    <Skeleton className="rounded-[12px]">
      <div
        className={`w-fit h-[30px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
      ></div>
    </Skeleton>
  );
}
