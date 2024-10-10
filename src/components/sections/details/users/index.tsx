"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BaseTabs } from "@/components/ui/tabs/BaseTabs";
import { useRouter, usePathname } from "next/navigation";
import { getUser } from "@/services/users";
import { formatTime } from "@/lib/utils/timestamp";
import { ColumnSkeleton } from "@/components/ui/loader/Skeleton";
import {
  CircularProgress,
  Card,
  CardBody,
  CardFooter,
  Chip,
} from "@nextui-org/react";

export const Details = () => {
  const pathname = usePathname();
  const category = useMemo(() => pathname.split("/")[3], [pathname]);
  const id = useMemo(() => pathname.split("/")[4], [pathname]);
  const [data, setData] = useState<any>(undefined);

  useEffect(() => {
    (async () => {
      const { data } = await getUser(id);
      console.log("data", data);
      setData(data);
    })();
  }, [id]);

  const [displayProgress, setDisplayProgress] =
    useState<string>("ahead_of_time");
  const [progress, setProgress] = useState<number>(0);

  console.log("progress", progress);
  const notificationTabs = useMemo(
    () => [
      {
        id: 1,
        numberOfElement: 2,
        label: "Informations",
        content: (
          <div className="w-full font-poppins h-auto flex  items-center bg-white p-[20px]">
            <div className="flex flex-wrap gap-x-[20px]  w-[calc(100%-400px)]">
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
            <div className="w-[400px] flex items-center justify-center">
              {data?.performance?.error ? (
                <span>Pas de tâches pour cette utilisateur dans ce mois </span>
              ) : (
                <>
                  <CircularProgress
                    classNames={{
                      svg: "w-[200px] h-[200px]",
                      indicator: "green",
                      track: "gray",
                      value: "text-3xl font-semibold text-black",
                    }}
                    value={data?.performance?.global_performance}
                    strokeWidth={2}
                    showValueLabel={true}
                  />
                  <div className="flex flex-col min-w-[200px] gap-[5px]">
                    <button
                      className={`gap-x-[5px] px-[10px]  py-[6px] font-medium transition rounded-[12px] flex items-center justify-between`}
                    >
                      <div className="text-[12px]">En avance</div>
                      <span className="">
                        {data?.performance?.performance_summary?.ahead_of_time}
                      </span>
                    </button>

                    <button
                      className={`gap-x-[5px] px-[10px] py-[6px] font-medium transition text-black rounded-[12px] flex items-center justify-between`}
                    >
                      <div className="text-[12px]">En retard</div>
                      <span className="">
                        {data?.performance?.performance_summary?.late}
                      </span>
                    </button>

                    <button
                      className={`gap-x-[5px] px-[10px] py-[6px] font-medium transition text-black rounded-[12px] flex items-center justify-between`}
                    >
                      <div className="text-[12px]">{`À l'heure`}</div>
                      <span className="">
                        {data?.performance?.performance_summary?.on_time}
                      </span>
                    </button>

                    <div className="flex font-medium justify-between px-[10px] items-center">
                      <span className="text-[12px]">Total tâches</span>
                      {data?.performance?.total_tasks}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ),
      },
      // {
      //   id: 2,
      //   numberOfElement: 1,
      //   label: "Performances",
      //   content: (
      //     <div className="font-poppins py-[20px]">
      //       {/* <div className="w-full h-auto p-[20px] bg-white">
      //         {data?.performances?.reverse().map((perf: any, index: number) => (
      //           <div
      //             key={index}
      //             className="flex gap-[14px] items-center border-b border-gray-100 my-[10px] w-full h-auto"
      //           >

      //             <div className="w-[250px]">
      //               <div key={perf.id} className="text-[12px] text-gray-500">
      //                 Utilisateur
      //               </div>
      //               <div className="text-[14px]">{perf?.user_name}</div>
      //             </div>
      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">Performance</div>
      //               <div className="text-[14px] ">{perf?.performance}</div>
      //             </div>
      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">
      //                 Description de la tâche
      //               </div>
      //               <div className="text-[14px] ">{perf?.description}</div>
      //             </div>

      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">Commencé le</div>
      //               {perf?.started_at ? (
      //                 <div className="text-[14px]">
      //                   {formatTime(
      //                     new Date(perf?.["started_at"]).getTime(),
      //                     "d:mo:y",
      //                     "short"
      //                   )}
      //                   {" à "}
      //                   {formatTime(
      //                     new Date(perf?.["started_at"]).getTime(),
      //                     "h:m",
      //                     "short"
      //                   )}
      //                 </div>
      //               ) : null}
      //             </div>
      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">Terminé le</div>
      //               {perf?.completed_at ? (
      //                 <div className="text-[14px]">
      //                   {formatTime(
      //                     new Date(perf?.["completed_at"]).getTime(),
      //                     "d:mo:y",
      //                     "short"
      //                   )}
      //                   {" à "}
      //                   {formatTime(
      //                     new Date(perf?.["completed_at"]).getTime(),
      //                     "h:m",
      //                     "short"
      //                   )}
      //                 </div>
      //               ) : null}
      //             </div>
      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">
      //                 Temps alloué
      //               </div>
      //               {perf?.time_allowed}
      //             </div>
      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">
      //                 Temps de réalisation
      //               </div>
      //               {perf?.time_taken}
      //             </div>
      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">Observation</div>
      //               {perf?.performance}
      //             </div>
      //             <div className="w-[1px] bg-gray-400 h-[16px]" />
      //             <div className="w-[250px]">
      //               <div className="text-[12px] text-gray-500">Score</div>
      //               {perf?.score}
      //             </div>
      //           </div>
      //         ))}
      //       </div> */}
      //       <CircularProgress
      //         classNames={{
      //           svg: "w-[200px] h-[200px]",
      //           indicator: "blue-500",
      //           track: "stroke-white/80",
      //           value: "text-3xl font-semibold text-black",
      //         }}
      //         value={70}
      //         strokeWidth={2}
      //         showValueLabel={true}
      //       />
      //     </div>
      //   ),
      // },
    ],
    [data, displayProgress, progress]
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
