"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BaseTabs } from "@/components/ui/tabs/BaseTabs";
import { useRouter, usePathname } from "next/navigation";
import { formatTime } from "@/lib/utils/timestamp";
import { ColumnSkeleton } from "@/components/ui/loader/Skeleton";
import useSWR from "swr";
import { getToken } from "@/lib/data/token";
import axios from "axios";
export const Details = () => {
  const pathname = usePathname();
  const category = useMemo(() => pathname.split("/")[3], [pathname]);
  const id = useMemo(() => pathname.split("/")[4], [pathname]);

  const { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/bats/${id}`,
    async () => {
      const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/bats/${id}`;
      const token = await getToken();
      const reponse = await axios.get(URL, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return reponse.data;
    }
  );

  const tabs = useMemo(
    () => [
      {
        id: 1,
        numberOfElement: 2,
        label: "Informations",
        content: (
          <div className="font-poppins">
            <div className="w-full h-auto flex flex-wrap items-center bg-white p-[20px] gap-[14px]">
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.code ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Code</div>
                  <div className="text-[14px]">{data?.code}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.theoretical_weight ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Poids Théorique
                  </div>
                  <div className="text-[14px]">{data?.theoretical_weight}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.cardboard_junction ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Jonction du carton
                  </div>
                  <div className="text-[14px]">{data?.cardboard_junction}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.compression_box ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Box Compression
                  </div>
                  <div className="text-[14px]">{data?.compression_box}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.weight_code ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Code Grammage</div>
                  <div className="text-[14px]">{data?.weight_code}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.weight ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    {`Grammage en (g)`}
                  </div>
                  <div className="text-[14px]">{data?.weight}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.plate_surface ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Surface de la plaques en m
                  </div>
                  <div className="text-[14px]">{data?.plate_surface}</div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.dim_lx_lh ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Dimension LxLxH
                  </div>
                  <div className="text-[14px]">{data?.dim_lx_lh}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.dim_square ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Dimension Carré
                  </div>
                  <div className="text-[14px]">{data?.dim_square}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.dim_plate ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Dimension Plaque
                  </div>
                  <div className="text-[14px]">{data?.dim_plate}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.paper_type ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Type Papier</div>
                  <div className="text-[14px]">{data?.paper_type}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.pose_number ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">N° des poses</div>
                  <div className="text-[14px]">{data?.pose_number}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.part ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">1/3</div>
                  <div className="text-[14px]">{data?.part}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.department ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Départment</div>
                  <div className="text-[14px]">{data?.department?.name}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.department ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Commercial</div>
                  <div className="text-[14px]">{data?.commercial?.name}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.client ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Client</div>
                  <div className="text-[14px]">{data?.commercial?.name}</div>
                </div>
              ) : null}
              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.reference ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Réference</div>
                  <div className="text-[14px]">{data?.reference}</div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.details ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Détails</div>
                  <div className="text-[14px]">{data?.details}</div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.product ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Produit</div>
                  <div className="text-[14px]">{data?.product}</div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.rule_id ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">Règle</div>
                  <div className="text-[14px]">{data?.rule_id}</div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.created_at ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Date de création
                  </div>
                  <div className="text-[14px]">
                    <div>
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
                    </div>
                  </div>
                </div>
              ) : null}

              {isLoading ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <ColumnSkeleton />
                </div>
              ) : data?.created_at ? (
                <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                  <div className="text-[12px] text-gray-500">
                    Date de de mise à jour
                  </div>
                  <div className="text-[14px]">
                    <div>
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
                    </div>
                  </div>
                </div>
              ) : null}
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
              {data?.observations?.reverse()?.map((obs: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-[14px] items-center border-b border-gray-100 w-full min-h-[50px] my-[10px] py-[20px] h-auto"
                >
                  <div className="w-[calc(100%-102px)] min-h-[50px]">
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
                  <div className="w-[300px] min-h-[50px]">
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
              {data?.performances
                ?.reverse()
                ?.map((perf: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-[14px] items-center border-b border-gray-100 my-[10px] w-full h-auto"
                  >
                    <div className="w-[250px]">
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
                      <div className="text-[12px] text-gray-500">
                        Commencé le
                      </div>
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
                      <div className="text-[12px] text-gray-500">
                        Terminé le
                      </div>
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
                      <div className="text-[12px] text-gray-500">
                        Observation
                      </div>
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
              {data?.loggers?.reverse()?.map((log: any) => (
                <div
                  key={log.id}
                  className="flex gap-[14px] my-[10px] items-center border-b border-gray-100 w-full"
                >
                  <div className="w-[300px] min-h-[50px] py-[10px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Titre
                    </div>
                    <div className="text-[14px]">{log?.title}</div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="min-w-[300px] min-h-[50px] py-[10px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Description
                    </div>
                    <div className="text-[14px] ">{log?.description}</div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[300px] min-h-[50px] py-[10px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Type
                    </div>
                    <div className="text-[14px]">{log?.type}</div>
                  </div>
                  <div className="w-[1px] bg-gray-400 h-[16px]" />
                  <div className="w-[300px] min-h-[50px] py-[10px]">
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
                  <div className="w-[300px] min-h-[50px] py-[10px]">
                    <div key={log.id} className="text-[12px] text-gray-500">
                      Crée par
                    </div>
                    <div className="text-[14px]">
                      {log?.treating_user?.name}
                    </div>
                  </div>
                  {log?.assignated_user ? (
                    <div className="w-[300px] min-h-[50px] py-[10px]">
                      <div key={log.id} className="text-[12px] text-gray-500">
                        Assigné à
                      </div>
                      <div className="text-[14px]">
                        {log?.assignated_user?.name}
                      </div>
                    </div>
                  ) : null}
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
      tabs={[...tabs]}
      layoutId="active_pill_notification"
      headClass="flex items-center relative !px-0"
      animateButtonTabClass="absolute inset-x-0 bottom-0 h-[2px] font-poppins rounded-full bg-vermilion-200"
      contentClass="w-full"
      withLine
    />
  );
};
