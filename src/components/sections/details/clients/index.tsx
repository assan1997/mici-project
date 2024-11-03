"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { BaseTabs } from "@/components/ui/tabs/BaseTabs";
import { useRouter, usePathname } from "next/navigation";
import { getClient } from "@/services/clients";
import { formatTime } from "@/lib/utils/timestamp";
import { ColumnSkeleton } from "@/components/ui/loader/Skeleton";

import { z } from "zod";

export const Details = () => {
  const pathname = usePathname();
  const category = useMemo(() => pathname.split("/")[3], [pathname]);
  const id = useMemo(() => pathname.split("/")[4], [pathname]);
  const [data, setData] = useState<any>(undefined);
  const Schema = z.object({
    month: z.string(),
  });

  useEffect(() => {
    (async () => {
      const { data } = await getClient(id as unknown as number);
      setData(data);
    })();
  }, [id]);

  const tabs = useMemo(
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
                <div className="text-[12px] text-gray-500">Commercial</div>
                <div className="text-[14px]">
                  {!data ? <ColumnSkeleton /> : data?.user?.name}
                </div>
              </div>

              <div className="border-b border-gray-100  w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">Départements</div>
                <div className="text-[14px]">
                  {!data ? (
                    <ColumnSkeleton />
                  ) : (
                    data?.departments?.map((department: any) => (
                      <Fragment key={department?.id}>
                        <span
                          className="inline-block my-[4px]"
                          key={department?.id}
                        >
                          {department?.name}
                        </span>
                        <br />
                      </Fragment>
                    ))
                  )}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de création
                </div>
                <div className="text-[14px]">
                  {!data ? (
                    <ColumnSkeleton />
                  ) : (
                    <>
                      {formatTime(
                        new Date(data?.created_at).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                      {" à "}
                      {formatTime(
                        new Date(data?.created_at).getTime(),
                        "h:m",
                        "short"
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-100 w-[300px] mb-[10px] min-h-[50px]">
                <div className="text-[12px] text-gray-500">
                  Date de mise à jour
                </div>
                <div className="text-[14px]">
                  {!data ? (
                    <ColumnSkeleton />
                  ) : (
                    <>
                      {formatTime(
                        new Date(data?.updated_at).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                      {" à "}
                      {formatTime(
                        new Date(data?.updated_at).getTime(),
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
