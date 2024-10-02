"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BaseTabs } from "@/components/ui/tabs/BaseTabs";
import { useRouter, usePathname } from "next/navigation";
import { getShapeDetails } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import { ColumnSkeleton } from "@/components/ui/loader/Skeleton";
export const Details = () => {
  const pathname = usePathname();
  const category = useMemo(() => pathname.split("/")[3], [pathname]);
  const id = useMemo(() => pathname.split("/")[5], [pathname]);
  const [data, setData] = useState<any>(undefined);

  useEffect(() => {
    (async () => {
      const { data } = await getShapeDetails(id);
      console.log("data", data);
      setData(data);
    })();
  }, [id]);

  const notificationTabs = useMemo(
    () => [
      {
        id: 1,
        numberOfElement: 2,
        label: "Informations",
        content: (
          <div className="font-poppins">
            <div className="w-full h-auto bg-white flex flex-wrap p-[20px] gap-[14px]">
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Code</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.code}
                </div>
              </div>
              <div className="border-b border-gray-100  w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Dim_lx_lh</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.dim_lx_lh}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Dim_square</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.dim_square}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Dim_plate</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.dim_plate}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Paper_type</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.paper_type}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Pose_number</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.pose_number}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Part</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.part}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Observations</div>
                <div className="text-[14px]">Infos</div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Départment</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.department?.name}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Commercial</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.commercial?.name}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Client</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.client?.name}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Réference</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.reference}
                </div>
              </div>

              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de création
                </div>
                <div className="text-[14px]">
                  {!data ? (
                    <ColumnSkeleton />
                  ) : (
                    <>
                      {formatTime(
                        new Date(data?.["created_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                      {" à "}
                      {formatTime(
                        new Date(data?.["created_at"]).getTime(),
                        "h:m",
                        "short"
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de de mise à jour
                </div>
                <div className="text-[14px]">
                  {!data ? (
                    <ColumnSkeleton />
                  ) : (
                    <>
                      {formatTime(
                        new Date(data?.["updated_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                      {" à "}
                      {formatTime(
                        new Date(data?.["updated_at"]).getTime(),
                        "h:m",
                        "short"
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] h-[50px]">
                <div className="text-[12px] text-gray-500">Règle</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.rule_id}
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 2,
        numberOfElement: 1,
        label: "Observations",
        content: (
          <div className="font-poppins">
            <div className="w-full h-auto  bg-white p-[20px]">
              {data?.observations?.reverse().map((obs: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-[14px] items-center border-b border-gray-100 w-full min-h-[50px] my-[10px] py-[20px] h-auto"
                >
                  <div className="w-[calc(100%-102px)]">
                    <div key={obs.id} className="text-[12px] text-gray-500">
                      Observation
                    </div>
                    <div className="text-[14px]">{obs?.observation}</div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  {/* <div className="min-w-[300px]">
                <div className="text-[12px] text-gray-500">
                  Performance
                </div>
                <div className="text-[14px] ">
                  {perf?.performance}
                </div>
              </div> */}
                  <div className="w-[300px]">
                    <div className="text-[12px] text-gray-500">Crée le</div>
                    {obs?.created_at ? (
                      <div className="text-[14px]">
                        {formatTime(
                          new Date(obs?.["created_at"]).getTime(),
                          "d:mo:y",
                          "short"
                        )}
                        {" à "}
                        {formatTime(
                          new Date(obs?.["created_at"]).getTime(),
                          "h:m",
                          "short"
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 3,
        numberOfElement: 1,
        label: "Performances",
        content: (
          <div className="font-poppins">
            <div className="w-full h-auto p-[20px] bg-white">
              {data?.performances?.reverse().map((perf: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-[14px] items-center border-b border-gray-100 my-[10px] w-full h-auto"
                >
                  <div className="w-[250px]x] w-auto">
                    <div key={perf.id} className="text-[12px] text-gray-500">
                      Utilisateur
                    </div>
                    <div className="text-[14px]">{perf?.user_name}</div>
                  </div>
                  {/* <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">Performance</div>
                    <div className="text-[14px] ">{perf?.performance}</div>
                  </div> */}
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">
                      Description de la tâche
                    </div>
                    <div className="text-[14px] ">{perf?.description}</div>
                  </div>

                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">Commencé le</div>
                    {perf?.started_at ? (
                      <div className="text-[14px]">
                        {formatTime(
                          new Date(perf?.["started_at"]).getTime(),
                          "d:mo:y",
                          "short"
                        )}
                        {" à "}
                        {formatTime(
                          new Date(perf?.["started_at"]).getTime(),
                          "h:m",
                          "short"
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">Terminé le</div>
                    {perf?.completed_at ? (
                      <div className="text-[14px]">
                        {formatTime(
                          new Date(perf?.["completed_at"]).getTime(),
                          "d:mo:y",
                          "short"
                        )}
                        {" à "}
                        {formatTime(
                          new Date(perf?.["completed_at"]).getTime(),
                          "h:m",
                          "short"
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">
                      Temps alloué
                    </div>
                    {perf?.time_allowed}
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">
                      Temps de réalisation
                    </div>
                    {perf?.time_taken}
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">Observation</div>
                    {perf?.performance}
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[250px]">
                    <div className="text-[12px] text-gray-500">Score</div>
                    {perf?.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 4,
        numberOfElement: 1,
        label: "Historique des actions",
        content: (
          <div className="font-poppins">
            <div className="w-full h-auto bg-white p-[20px]">
              {data?.loggers?.reverse().map((log: any) => (
                <div
                  key={log.id}
                  className="flex gap-[14px] my-[10px] items-center border-b border-gray-100 w-full h-[50px]"
                >
                  <div className="w-[300px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Titre
                    </div>
                    <div className="text-[14px]">{log?.title}</div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="min-w-[300px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Description
                    </div>
                    <div className="text-[14px] ">{log?.description}</div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[300px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Type
                    </div>
                    <div className="text-[14px]">{log?.type}</div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[300px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Date de création
                    </div>
                    <div className="text-[14px]">
                      {formatTime(
                        new Date(log?.["created_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                      {" à "}
                      {formatTime(
                        new Date(log?.["created_at"]).getTime(),
                        "h:m",
                        "short"
                      )}
                    </div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[300px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Crée par
                    </div>
                    <div className="text-[14px]">
                      {log?.treating_user?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      // {
      //   id: 5,
      //   numberOfElement: 1,
      //   label: 'Actions',
      //   content: <div className="font-poppins">
      //     <div className="w-full h-auto bg-white">
      //       5
      //     </div>
      //   </div>
      // },
    ],
    [data]
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
