"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BaseTabs } from "@/components/ui/tabs/BaseTabs";
import { useRouter, usePathname } from "next/navigation";
import { getShapeDetails } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import { ColumnSkeleton } from "@/components/ui/loader/Skeleton";
import useSWR from "swr";
import { getToken } from "@/lib/data/token";
import { useData } from "@/contexts/data.context";
import axios from "axios";
export const Details = () => {
  const { users, departments, clients } = useData();
  const pathname = usePathname();
  const id = useMemo(() => pathname.split("/")[4], [pathname]);

  const { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`,
    async () => {
      const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`;
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
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Attribué à</div>
                <div className="text-[14px]">
                  {isLoading ? (
                    <ColumnSkeleton />
                  ) : (
                    users?.find(
                      (user) => user.id === data.assignable.user_assignated_id
                    )?.name
                  )}
                </div>
              </div>

              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Description</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.description}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Terminé le</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.completed_at}
                </div>
              </div>
              <br />
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Type</div>
                <div className="text-[14px]">
                  {isLoading ? (
                    <ColumnSkeleton />
                  ) : (
                    data?.assignable_type.split("\\")[2]
                  )}
                </div>
              </div>

              {data?.assignable_type.split("\\")[2] === "Shape" ? (
                <>
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.code ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">Code</div>
                      <div className="text-[14px]">{data?.assignable.code}</div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.theoretical_weight ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Poids Théorique
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.theoretical_weight}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.cardboard_junction ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Jonction du carton
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.cardboard_junction}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.compression_box ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Box Compression
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.compression_box}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.weight_code ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Code Grammage
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.weight_code}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.weight ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        {`Grammage en (g)`}
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.weight}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.plate_surface ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Surface de la plaques en m
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.plate_surface}
                      </div>
                    </div>
                  ) : null}

                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.dim_lx_lh ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Dimension LxLxH
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.dim_lx_lh}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.dim_square ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Dimension Carré
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.dim_square}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.dim_plate ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Dimension Plaque
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.dim_plate}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.paper_type ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Type Papier
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.paper_type}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.pose_number ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        N° des poses
                      </div>
                      <div className="text-[14px]">
                        {data?.assignable.pose_number}
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.part ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">1/3</div>
                      <div className="text-[14px]">{data?.assignable.part}</div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.department ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Départment
                      </div>
                      <div className="text-[14px]">
                        {
                          departments.find(
                            (department) =>
                              department.id === data?.assignable?.department_id
                          )?.name
                        }
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.department ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Commercial
                      </div>
                      <div className="text-[14px]">
                        {
                          users?.find(
                            (user) =>
                              user.id === data?.assignable?.commercial_id
                          )?.name
                        }
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.client ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">Client</div>
                      <div className="text-[14px]">
                        {
                          clients?.find(
                            (client) =>
                              client.id === data?.assignable?.client_id
                          )?.name
                        }
                      </div>
                    </div>
                  ) : null}
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.reference ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">Réference</div>
                      <div className="text-[14px]">
                        {data?.assignable.reference}
                      </div>
                    </div>
                  ) : null}

                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.rule_id ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">Règle</div>
                      <div className="text-[14px]">
                        {data?.assignable.rule_id}
                      </div>
                    </div>
                  ) : null}

                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.created_at ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Date de création
                      </div>
                      <div className="text-[14px]">
                        <div>
                          {formatTime(
                            new Date(data?.assignable["created_at"]).getTime(),
                            "d:mo:y",
                            "short"
                          )}
                          {" à "}
                          {formatTime(
                            new Date(data?.assignable["created_at"]).getTime(),
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
                  ) : data?.assignable.created_at ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">
                        Date de de mise à jour
                      </div>
                      <div className="text-[14px]">
                        <div>
                          {formatTime(
                            new Date(data?.assignable["updated_at"]).getTime(),
                            "d:mo:y",
                            "short"
                          )}
                          {" à "}
                          {formatTime(
                            new Date(data?.assignable["updated_at"]).getTime(),
                            "h:m",
                            "short"
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : data?.assignable_type.split("\\")[2] === "Folder" ? (
                <>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Numero</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        data?.assignable?.file_number
                      )}
                    </div>
                  </div>

                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Code</div>
                    <div className="text-[14px]">
                      {isLoading ? <ColumnSkeleton /> : data?.assignable?.code}
                    </div>
                  </div>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Reference</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        data?.assignable?.reference
                      )}
                    </div>
                  </div>
                  <div className="border-b border-gray-100  w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Etat</div>
                    <div className="text-[14px]">
                      {isLoading ? <ColumnSkeleton /> : data?.assignable?.state}
                    </div>
                  </div>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Couleur</div>
                    <div className="text-[14px]">
                      {isLoading ? <ColumnSkeleton /> : data?.assignable?.color}
                    </div>
                  </div>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Support</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        data?.assignable?.support
                      )}
                    </div>
                  </div>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Détails</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        data?.assignable?.details
                      )}
                    </div>
                  </div>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Format</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        data?.assignable?.format
                      )}
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <ColumnSkeleton />
                    </div>
                  ) : data?.assignable.rule_id ? (
                    <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                      <div className="text-[12px] text-gray-500">Règle</div>
                      <div className="text-[14px]">
                        {data?.assignable.rule_id}
                      </div>
                    </div>
                  ) : null}
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Départment</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        departments.find(
                          (department) =>
                            department.id === data?.assignable?.department_id
                        )?.name
                      )}
                    </div>
                  </div>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Commercial</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        users?.find(
                          (user) => user.id === data?.assignable?.commercial_id
                        )?.name
                      )}
                    </div>
                  </div>
                  <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                    <div className="text-[12px] text-gray-500">Client</div>
                    <div className="text-[14px]">
                      {isLoading ? (
                        <ColumnSkeleton />
                      ) : (
                        clients?.find(
                          (client) => client.id === data?.assignable?.client_id
                        )?.name
                      )}
                    </div>
                  </div>
                </>
              ) : null}

              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de création
                </div>
                <div className="text-[14px]">
                  {isLoading ? (
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
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de de mise à jour
                </div>
                <div className="text-[14px]">
                  {isLoading ? (
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
            </div>
          </div>
        ),
      },
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
