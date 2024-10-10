"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BaseTabs } from "@/components/ui/tabs/BaseTabs";
import { useRouter, usePathname } from "next/navigation";
import { getUser, getUserPerformance } from "@/services/users";
import { formatTime } from "@/lib/utils/timestamp";
import { ColumnSkeleton } from "@/components/ui/loader/Skeleton";
import {
  CircularProgress,
  Card,
  CardBody,
  CardFooter,
  Chip,
} from "@nextui-org/react";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import { z } from "zod";

interface ComboSelect {
  label: string;
  value: string;
}

export const Details = () => {
  const pathname = usePathname();
  const category = useMemo(() => pathname.split("/")[3], [pathname]);
  const id = useMemo(() => pathname.split("/")[4], [pathname]);
  const [data, setData] = useState<any>(undefined);
  const Schema = z.object({
    month: z.string(),
  });

  const form = useForm({ schema: Schema });

  const [displayProgress, setDisplayProgress] =
    useState<string>("ahead_of_time");
  const [progress, setProgress] = useState<number>(0);
  const years = useMemo(() => [{ name: "2024" }], []);
  const months = useMemo(
    () => [
      { name: "January", number: 1, days: 31 },
      { name: "February", number: 2, days: 28 }, // 29 in leap years
      { name: "March", number: 3, days: 31 },
      { name: "April", number: 4, days: 30 },
      { name: "May", number: 5, days: 31 },
      { name: "June", number: 6, days: 30 },
      { name: "July", number: 7, days: 31 },
      { name: "August", number: 8, days: 31 },
      { name: "September", number: 9, days: 30 },
      { name: "October", number: 10, days: 31 },
      { name: "November", number: 11, days: 30 },
      { name: "December", number: 12, days: 31 },
    ],
    []
  );

  const onSubmit = async (data: z.infer<typeof Schema>) => {};
  const [performance, setPerformance] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState<ComboSelect[]>([]);
  const [selectedYear, setSelectedYear] = useState<ComboSelect[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await getUser(id);
      setData(data);
      setPerformance(data.performance);
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!data || !selectedYear[0]?.value || !selectedMonth[0]?.value) return;
      const period: string = `${selectedYear[0]?.value}-${selectedMonth[0]?.value}`;
      const { data: perfData } = await getUserPerformance(data.id, period);
      console.log("perfData", perfData);
      setPerformance(perfData);
    })();
  }, [data, selectedYear, selectedMonth]);

  const notificationTabs = useMemo(
    () => [
      {
        id: 1,
        numberOfElement: 2,
        label: "Informations",
        content: (
          <div className="w-full font-poppins h-[300px] flex  items-center bg-white p-[20px]">
            <div className="flex flex-wrap gap-x-[20px] h-hull w-[calc(100%-400px)]">
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500"> Name</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.name}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Email</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.email}
                </div>
              </div>

              <div className="border-b border-gray-100  w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Avatar</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.avatar}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de création
                </div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.created_at}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de mise à jour
                </div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.updated_at}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Département</div>
                <div className="text-[14px] flex items-center">
                  {!data ? (
                    <ColumnSkeleton />
                  ) : (
                    data?.departments?.map((dep: any) => (
                      <span key={dep.id}>{dep.name}</span>
                    ))
                  )}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Sections</div>
                <div className="text-[14px] flex items-center">
                  {!data ? (
                    <ColumnSkeleton />
                  ) : (
                    data?.sections?.map((dep: any) => (
                      <span key={dep.id}>{dep.name}</span>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="w-[400px] flex h-full items-center justify-center">
              <div className="flex flex-col h-full">
                <div className="h-[80px] w-full">
                  <Form form={form} onSubmit={onSubmit}>
                    <div className="flex gap-x-[10px]">
                      <ComboboxMultiSelect
                        label={""}
                        placeholder="Selectionnez une année"
                        className="w-full"
                        icon={
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.24996 5.83333H8.54163M6.24996 9.16667H8.54163M6.24996 12.5H8.54163M11.4583 5.83333H13.75M11.4583 9.16667H13.75M11.4583 12.5H13.75M16.6666 17.5V5.16667C16.6666 4.23325 16.6666 3.76654 16.485 3.41002C16.3252 3.09641 16.0702 2.84144 15.7566 2.68166C15.4001 2.5 14.9334 2.5 14 2.5H5.99996C5.06654 2.5 4.59983 2.5 4.24331 2.68166C3.92971 2.84144 3.67474 3.09641 3.51495 3.41002C3.33329 3.76654 3.33329 4.23325 3.33329 5.16667V17.5M18.3333 17.5H1.66663"
                              stroke="black"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                        id={`commercial`}
                        options={
                          years?.map((year) => ({
                            value: year.name as unknown as string,
                            label: year.name,
                          })) as any
                        }
                        error={undefined}
                        isUniq={true}
                        selectedElementInDropdown={selectedYear}
                        setSelectedUniqElementInDropdown={setSelectedYear}
                        borderColor="border-grayscale-200"
                      />
                      <ComboboxMultiSelect
                        label={""}
                        placeholder="Sélectionnez un mois"
                        className="w-full"
                        icon={
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.24996 5.83333H8.54163M6.24996 9.16667H8.54163M6.24996 12.5H8.54163M11.4583 5.83333H13.75M11.4583 9.16667H13.75M11.4583 12.5H13.75M16.6666 17.5V5.16667C16.6666 4.23325 16.6666 3.76654 16.485 3.41002C16.3252 3.09641 16.0702 2.84144 15.7566 2.68166C15.4001 2.5 14.9334 2.5 14 2.5H5.99996C5.06654 2.5 4.59983 2.5 4.24331 2.68166C3.92971 2.84144 3.67474 3.09641 3.51495 3.41002C3.33329 3.76654 3.33329 4.23325 3.33329 5.16667V17.5M18.3333 17.5H1.66663"
                              stroke="black"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        }
                        id={`commercial`}
                        options={
                          months?.map((month) => ({
                            value: month.number as unknown as string,
                            label: month.name,
                          })) as any
                        }
                        error={undefined}
                        isUniq={true}
                        selectedElementInDropdown={selectedMonth}
                        setSelectedUniqElementInDropdown={setSelectedMonth}
                        borderColor="border-grayscale-200"
                      />
                    </div>
                  </Form>
                </div>
                <div className="h-[calc(100%-80px)] w-full flex items-center">
                  {performance?.error ? (
                    <span>
                      Pas de tâches pour cette utilisateur dans ce mois{" "}
                    </span>
                  ) : (
                    <div className="flex w-full justify-between items-center">
                      <CircularProgress
                        classNames={{
                          svg: "w-[150px] h-[150px]",
                          indicator: "green",
                          track: "gray",
                          value: "text-3xl font-semibold text-black",
                        }}
                        value={performance?.global_performance}
                        strokeWidth={2}
                        showValueLabel={true}
                      />
                      <div className="flex flex-col gap-[5px]">
                        <button
                          className={`gap-x-[5px] px-[10px] py-[6px] font-medium transition rounded-[12px] flex items-center justify-between`}
                        >
                          <div className="text-[12px]">En avance</div>
                          <span className="">
                            {
                              data?.performance?.performance_summary
                                ?.ahead_of_time
                            }
                          </span>
                        </button>

                        <button
                          className={`gap-x-[5px] px-[10px] py-[6px] font-medium transition text-black rounded-[12px] flex items-center justify-between`}
                        >
                          <div className="text-[12px]">En retard</div>
                          <span className="">
                            {performance?.performance_summary?.late}
                          </span>
                        </button>

                        <button
                          className={`gap-x-[5px] px-[10px] py-[6px] font-medium transition text-black rounded-[12px] flex items-center justify-between`}
                        >
                          <div className="text-[12px]">{`À l'heure`}</div>
                          <span className="">
                            {performance?.performance_summary?.on_time}
                          </span>
                        </button>

                        <div className="flex font-medium justify-between px-[10px] gap-x-[10px] items-center">
                          <span className="text-[12px]">Total tâches</span>
                          {performance?.total_tasks}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [
      data,
      displayProgress,
      months,
      selectedMonth,
      performance,
      selectedYear,
      progress,
    ]
  );

  return (
    <BaseTabs
      tabs={[...notificationTabs]}
      layoutId="active_pill_notification"
      headClass="flex items-center relative !px-0"
      animateButtonTabClass="absolute inset-x-0 bottom-0 h-[2px] font-poppins rounded-full bg-vermilion-200"
      contentClass="w-full"
      withLine
    />
  );
};
