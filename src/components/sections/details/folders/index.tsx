"use client";
import React, { useEffect, useMemo, useState } from "react";
import { BaseTabs } from "@/components/ui/tabs/BaseTabs";
import { useRouter, usePathname } from "next/navigation";
import { getShapeDetails } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import { ColumnSkeleton } from "@/components/ui/loader/Skeleton";
import useSWR from "swr";
import { getToken } from "@/lib/data/token";
import axios from "axios";
export const Details = () => {
  const pathname = usePathname();
  const category = useMemo(() => pathname.split("/")[3], [pathname]);
  const id = useMemo(() => pathname.split("/")[4], [pathname]);

  // const {
  //   data: allTasks,
  //   mutate,
  //   error,
  //   isLoading,
  // } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/folders`, async () => {
  //   const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${
  //     roleAdmin ? "all-tasks" : "tasks"
  //   }`;
  //   const token = await getToken();
  //   const reponse = await axios.get(URL, {
  //     headers: {
  //       accept: "application/json",
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });

  //   return reponse.data;
  // });

  const { data: allShapes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/shapes`,
    async () => {
      const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/shapes`;
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

  const { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/folders/${id}`,
    async () => {
      const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/folders/${id}`;
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

  useEffect(() => {
    console.log("allShapes", allShapes);
  }, [allShapes]);

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
                <div className="text-[12px] text-gray-500">Numero</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.file_number}
                </div>
              </div>
              <div className="border-b border-gray-100  w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Etat</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.state}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Couleur</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.color}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Support</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.support}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Détails</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.details}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Format</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.format}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Départment</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.department?.name}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Commercial</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.commercial?.name}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Client</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.client?.name}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Forme</div>
                <div className="text-[14px]">
                  {isLoading ? (
                    <ColumnSkeleton />
                  ) : (
                    allShapes?.find((shape: any) => shape.id === data.shape_id)
                      ?.reference
                  )}
                </div>
              </div>

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
              <div className="border-b border-gray-100 w-[300px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Règle</div>
                <div className="text-[14px]">
                  {isLoading ? <ColumnSkeleton /> : data?.rule_id}
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
