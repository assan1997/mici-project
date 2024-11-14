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
import { motion } from "framer-motion";
import { BaseInput, BaseTextArea } from "@/components/ui/forms/BaseInput";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import { z } from "zod";
import { Spinner } from "@/components/ui/loader/spinner";
import { createRoot } from "react-dom/client";
import { createError, resolveError } from "@/services/folder";
import { useToast } from "@/contexts/toast.context";
import BaseModal from "@/components/ui/modal/BaseModal";
import { CloseIcon } from "@/components/svg";
export const Details = () => {
  const pathname = usePathname();
  const category = useMemo(() => pathname.split("/")[3], [pathname]);
  const id = useMemo(() => pathname.split("/")[4], [pathname]);
  const errorSchema = z.object({
    description: z.string(),
  });
  const errorForm = useForm({ schema: errorSchema });
  const { showToast } = useToast();
  const [currentEntry, setCurrentEntry] = useState<number>();

  const tableHead = [
    "Statut",
    "Description",
    "Emis le",
    "Résolu le",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
  ];

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

  const { data, isLoading, mutate } = useSWR(
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

  const errors: [] = useMemo(() => (data?.errors ? data.errors : []), [data]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingResolve, setLoadingResolve] = useState<boolean>(false);
  const actionSchema = z.object({});
  const actionForm = useForm({ schema: actionSchema });

  const [errorInEntry, setErrorInEntry] = useState<any>();

  const onSubmit = async (data: z.infer<typeof errorSchema>) => {
    setLoading(true);
    let { description } = data;
    const { success } = await createError({
      description,
      folder_id: id as unknown as number,
    });
    if (success) {
      showToast({
        type: "success",
        message: "Crée avec succès",
        position: "top-center",
      });
      mutate();
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoading(false);
  };

  const [openResolveModal, setOpenResolveModal] = useState<boolean>(false);

  const makeResolve = async (data: z.infer<typeof actionSchema>) => {
    setLoadingResolve(true);
    const { success } = await resolveError(
      errorInEntry?.id as unknown as number
    );
    if (success) {
      showToast({
        type: "success",
        message: "Résolu avec succès",
        position: "top-center",
      });
      mutate();
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoadingResolve(false);
    setOpenResolveModal(false);
  };

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

      {
        id: 2,
        numberOfElement: 2,
        label: "Erreurs",
        content: (
          <div className="font-poppins h-screen bg-white flex p-[20px]">
            <div className="w-full h-full">
              <div className="mb-[20px]">
                <Form form={errorForm} onSubmit={onSubmit}>
                  <h1 className="font-medium text-[18px] font-poppins mb-[10px]">
                    Nouvelle erreur
                  </h1>
                  <div className="flex gap-x-[10px] items-center">
                    <div className="flex-1">
                      <BaseInput
                        label="Description"
                        id="description"
                        type="text"
                        {...errorForm.register("description")}
                      />
                    </div>

                    {isLoading}
                    {/* <button
                  type="submit"
                  disabled={isLoading}
                  className="w-[40px] h-[40px] flex items-center justify-center mt-[20px] border rounded-lg"
                >
                  {isLoading ? (
                    <Spinner color={"black"} size={20} />
                  ) : (
                    <PlusIcon size={20} color="black" />
                  )}
                </button> */}

                    <button
                      type="submit"
                      className={`w-fit h-[48px] mt-[20px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
                    >
                      {loading ? (
                        <>
                          <Spinner color={"#fff"} size={20} /> {"En cours"}
                        </>
                      ) : (
                        "Enregistrer"
                      )}
                    </button>
                  </div>
                </Form>
              </div>
              <div className="w-full border-t overflow-auto">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 1,
                    ease: [0.36, 0.01, 0, 0.99],
                    delay: 0.2,
                  }}
                >
                  <table className="w-full mb-[20rem] h-full relative">
                    <thead className="bg-white/50 transition">
                      <tr className="border-b bg-gray-50 cursor-pointer">
                        {tableHead?.map((head, index) => (
                          <th
                            key={index}
                            className={`relative min-w-[200px] w-auto text-[14px] py-[10px] font-medium  ${
                              index > 0 && index < tableHead.length
                            }  text-[#000000]`}
                          >
                            <div
                              className={`h-full font-poppins relative flex items-center text-start gap-x-[10px] px-[20px] ${
                                head === "Options"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div className={`w-full flex items-center`}>
                                <div
                                  className={`w-fit h-[40px] flex items-center  ${
                                    head === "Options"
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  {head}
                                </div>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white/10 -z-[1]">
                      {errors?.map((row: any, index: number) => {
                        return (
                          <tr
                            key={index}
                            // onClick={() => goToDetail(row?.id)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              document.getElementById("dropdown")?.remove();
                              const dropdown = document.createElement("div");
                              dropdown.id = "dropdown";
                              dropdown.style.boxShadow =
                                "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)";
                              dropdown.className = "w-[200px] h-auto absolute";
                              const target = e.target as HTMLElement;
                              target.appendChild(dropdown);
                              const root = createRoot(dropdown);
                              setErrorInEntry(row);
                              root.render(
                                <div className="bg-white w-[200px] z-[50] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
                                  <div className="flex flex-col items-center w-full">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenResolveModal(true);
                                      }}
                                      className="flex items-center w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                    >
                                      <span className="text-[14px]  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                        {loadingResolve ? (
                                          <Spinner color={"#000"} size={20} />
                                        ) : (
                                          "Marquer comme résolu"
                                        )}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              );
                              const handleClickOutside = (event: any) => {
                                if (!dropdown.contains(event.target)) {
                                  root.unmount();
                                  dropdown.remove();
                                  document.removeEventListener(
                                    "click",
                                    handleClickOutside
                                  );
                                }
                              };
                              document.addEventListener(
                                "click",
                                handleClickOutside
                              );
                            }}
                            className={`cursor-pointer border-b transition-all relative duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                          >
                            <td className="text-[#636363] relative min-w-[150px] w-auto p-[20px] text-start font-poppins text-[12px]">
                              <div
                                className={`flex w-fit justify-center py-[3px] px-[10px] font-medium rounded-full ${
                                  row?.resolved_at
                                    ? "bg-green-200 text-green-500"
                                    : "bg-danger-300 text-danger-500"
                                }`}
                              >
                                {row?.resolved_at ? "Résolu" : "Non résolu"}
                              </div>
                            </td>
                            <td className="text-[#636363] relative min-w-[100px]  p-[20px] text-start font-poppins text-[14px]">
                              {row?.description}
                            </td>
                            <td className="text-[#636363] min-w-[100px] p-[20px] text-start font-poppins text-[14px]">
                              {row?.emitted_at
                                ? formatTime(
                                    new Date(row?.["emitted_at"]).getTime(),
                                    "d:mo:y",
                                    "short"
                                  )
                                : null}
                            </td>

                            <td className="text-[#636363] min-w-[100px] p-[20px] text-start font-poppins text-[14px]">
                              {row?.resolved_at
                                ? formatTime(
                                    new Date(row?.["resolved_at"]).getTime(),
                                    "d:mo:y",
                                    "short"
                                  )
                                : null}
                            </td>
                            <td className="text-[#636363] min-w-[100px] p-[20px] text-start font-poppins text-[14px]">
                              {formatTime(
                                new Date(row?.["created_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}
                              {" à "}
                              {formatTime(
                                new Date(row?.["created_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>
                            <td className="text-[#636363] min-w-[100px] p-[20px] text-start font-poppins text-[14px]">
                              {formatTime(
                                new Date(row?.["updated_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}
                              {" à "}
                              {formatTime(
                                new Date(row?.["updated_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </motion.div>
              </div>
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
    ],
    [data, errors, loading, loadingResolve]
  );

  return (
    <>
      <BaseTabs
        tabs={[...tabs]}
        layoutId="active_pill_notification"
        headClass="flex items-center relative !px-0"
        animateButtonTabClass="absolute inset-x-0 bottom-0 h-[2px] font-poppins rounded-full bg-vermilion-200"
        contentClass="w-full"
        withLine
      />

      {/* MARQUÉ LA FORME COMMANDÉ */}
      <BaseModal open={openResolveModal} classname={""}>
        <Form form={actionForm} onSubmit={makeResolve}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  {"Marquer l'erreur comme résolu"}
                </span>
              </div>
              <button
                disabled={loadingResolve}
                type="button"
                onClick={() => setOpenResolveModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                {loadingResolve ? (
                  <Spinner color={"#fff"} size={20} />
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>
    </>
  );
};
