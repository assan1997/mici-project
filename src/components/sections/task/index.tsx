"use client";
import { FC, useMemo, useState, useEffect } from "react";
import BaseModal from "@/components/ui/modal/BaseModal";
import { CloseIcon, OptionsIcon } from "@/components/svg";
import { BaseTextArea } from "@/components/ui/forms/BaseInput";
import { array, z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import React from "react";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import { Client, TaskInterface, useData, User } from "@/contexts/data.context";
import { formatTime } from "@/lib/utils/timestamp";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";

import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton } from "@/components/ui/loader/Skeleton";
import { useToast } from "@/contexts/toast.context";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";
import { Filter } from "@/components/ui/filter";

import { endTask } from "@/services/task";

export const Task: FC<{}> = ({}) => {
  const {
    users,
    clients,
    tasks: allTasks,
    status,
    dispatchTasks,
    refreshTaskData,
    onRefreshingTask,
    getAllTasks,
  } = useData();

  const endTaskShema = z.object({
    reason: z.string(),
    note: z.string(),
    user: z.number(),
  });

  const tableHead = [
    "Statut",
    "Référence",
    "Description",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
    "Terminé le",
    "Options",
  ];

  const { box, handleClick } = useActiveState();
  const [tasks, setTasks] = useState<TaskInterface[] | undefined>([]);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);

  interface ComboSelect {
    label: string;
    value: string;
  }

  const [user, setUser] = useState<ComboSelect[]>([]);
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);

  const [currentDatas, setCurrentDatas] = useState<any[]>(
    allTasks ? allTasks : []
  );

  useEffect(() => {
    endTaskForm.setValue("user", user[0]?.value as unknown as number);
  }, [user]);

  const endTaskForm = useForm({ schema: endTaskShema });
  const onSubmitEndTaskForm = async (data: z.infer<typeof endTaskShema>) => {
    setLoading(true);
    const { data: closeTaskData, success } = await endTask(
      taskInEntry?.id as unknown as number,
      {
        reason: data.reason,
        note: data.note,
        user_id: data.user,
      }
    );
    if (success) {
      showToast({
        type: "success",
        message: "Attribué avec succès",
        position: "top-center",
      });

      dispatchTasks((tmp) =>
        tmp?.map((task: TaskInterface) =>
          task.id === taskInEntry?.id
            ? { ...task, completed_at: new Date() as unknown as string }
            : task
        )
      );
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoading(false);
    setDelationModal(false);
  };

  useEffect(() => {
    setCurrentDatas(allTasks ? allTasks : []);
  }, [allTasks]);

  const { showToast } = useToast();
  const taskInEntry = useMemo(() => {
    const shape: TaskInterface | undefined = tasks?.find(
      (shape: TaskInterface) => shape.id === currentEntry
    );
    return shape;
  }, [currentEntry]);

  //   useState<boolean>(false);
  // const onSubmitStandBy = async (data: z.infer<typeof shapeStandBySchema>) => {
  //   setLoading(true);
  //   let { reason } = data;
  //   reason = reason.trim();
  //   const status_id = taskInEntry?.status_id !== 2 ? 2 : 1;
  //   const { data: standByShape, success } = await standbyOffsetShape(
  //     currentEntry as number,
  //     {
  //       type: "STANDBY",
  //       reason,
  //       status_id,
  //     }
  //   );
  //   if (success) {
  //     standByShape.status_id = status_id;
  //     dispatchOffsetShapes((tmp: any) => {
  //       let tmpDatas;
  //       let tmpData;
  //       if (tmp) {
  //         tmpData = tmp.find((t: any) => t.id === standByShape.id);
  //         tmpDatas = tmp.filter((t: any) => t.id !== standByShape.id);
  //         return [{ ...tmpData, status_id }, ...tmpDatas];
  //       }
  //     });
  //     standByform.setValue("reason", "");
  //     setOpenStandByModal(false);
  //     showToast({
  //       type: "success",
  //       message: `${status_id === 2 ? "Mis" : "Enlevé"} en standby avec succès`,
  //       position: "top-center",
  //     });
  //   } else {
  //     showToast({
  //       type: "danger",
  //       message: "L'opération a échoué",
  //       position: "top-center",
  //     });
  //   }
  //   setLoading(false);
  //   reset();
  // };
  // const onSubmitOservation = async (
  //   data: z.infer<typeof shapeObservationSchema>
  // ) => {
  //   let { observation } = data;
  //   setLoading(true);
  //   observation = observation.trim();
  //   const { data: observationData, success } = await observationOffsetShape(
  //     currentEntry as number,
  //     {
  //       type: "OBSERVATION",
  //       observation,
  //     }
  //   );
  //   if (success) {
  //     console.log("observationData", observationData);
  //     observationForm.setValue("observation", "");
  //     setOpenObservationModal(false);

  //     showToast({
  //       type: "success",
  //       message: "Observation crée avec succès",
  //       position: "top-center",
  //     });
  //   } else {
  //     showToast({
  //       type: "danger",
  //       message: "L'opération a échoué",
  //       position: "top-center",
  //     });
  //   }
  //   setLoading(false);
  //   reset();
  // };
  // const onSubmitAssign = async (data: z.infer<typeof shapeAssignSchema>) => {
  //   setLoading(true);
  //   let { user_id } = data;
  //   const { data: assignShape, success } = await assignToAnUserOffsetShape(
  //     currentEntry as number,
  //     {
  //       type: "ASSIGNATION",
  //       user_assignated_id: user_id,
  //       task_description: data.description,
  //     }
  //   );
  //   if (success) {
  //     // console.log('assignShape', assignShape);
  //     // tmp => {
  //     //   return tmp?.map((shape) => {
  //     //     return ({ ...shape, logs: [] })
  //     //     // shape.id === assignShape.id ? ({
  //     //     //   ...shape,
  //     //     //   logs: [
  //     //     //     {
  //     //     //       "id": shape.logs[shape.logs.length - 1].id + 1,
  //     //     //       "shape_id": shape.id,
  //     //     //       "title": "Assigné à une personne",
  //     //     //       "description": null,
  //     //     //       "user_treating_id": user?.id,
  //     //     //       "type": "ASSIGNATION",
  //     //     //       "created_at": new Date(),
  //     //     //       "updated_at": new Date(),
  //     //     //       "user_assignated_id": user_id,
  //     //     //       "bat_id": null,
  //     //     //       "folder_id": null
  //     //     //     },
  //     //     //     ...shape.logs]
  //     //     // }) : shape
  //     //   })
  //     // }
  //     // dispatchOffsetShapes([])
  //     assignForm.setValue("user_id", 0);
  //     setOpenAssignToUserModal(false);
  //     showToast({
  //       type: "success",
  //       message: "Assigné avec succès",
  //       position: "top-center",
  //     });
  //   } else {
  //     showToast({
  //       type: "danger",
  //       message: "L'opération a échoué",
  //       position: "top-center",
  //     });
  //   }
  //   setLoading(false);
  //   reset();
  // };
  const [sortedBy, setSortedBY] = useState<string>("");
  const sort = (key: string) => {
    setCurrentDatas((tmp) => {
      let sorted: any = [];

      if (key === "description") {
        sorted = tmp?.sort((a, b) => {
          if (a.description.toUpperCase() > b.description.toUpperCase()) {
            return sortedBy !== key ? 1 : -1;
          }
          if (a.description.toUpperCase() < b.description.toUpperCase()) {
            return sortedBy !== key ? -1 : 1;
          }
          return 0;
        });
      }

      if (key === "date & heure de création") {
        sorted = tmp?.sort((a, b) => {
          if (a.created_at.toUpperCase() > b.created_at.toUpperCase()) {
            return 1;
          }
          if (a.created_at.toUpperCase() < b.created_at.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "date & heure de mise à jour") {
        sorted = tmp?.sort((a, b) => {
          if (a.updated_at.toUpperCase() > b.updated_at.toUpperCase()) {
            return 1;
          }
          if (a.updated_at.toUpperCase() < b.updated_at.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "reference") {
        sorted = tmp?.sort((a, b) => {
          if (a.reference.toUpperCase() > b.reference.toUpperCase()) {
            return 1;
          }
          if (a.reference.toUpperCase() < b.reference.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "terminé le") {
        sorted = tmp?.sort((a, b) => {
          if (a.completed_at.toUpperCase() > b.completed_at.toUpperCase()) {
            return 1;
          }
          if (a.completed_at.toUpperCase() < b.completed_at.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      setSortedBY((tmp) => {
        console.log(
          "sortedBy",
          sortedBy,
          "key",
          key,
          "sortedBy===",
          sortedBy === key
        );
        // if (tmp === key) return "";
        return key;
      });

      if (key === sortedBy) {
        return allTasks ? allTasks : [];
      }

      return [...(sorted as unknown as any)];
    });
  };

  useEffect(() => {
    getAllTasks();
  }, []);

  return (
    <div className="w-full h-full">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 1,
          ease: [0.36, 0.01, 0, 0.99],
          delay: 0.2,
        }}
        className="rounded-[16px]"
      >
        <div className="w-full bg-white/10 h-[60px] gap-x-[4px] flex items-center justify-start border-b">
          <Filter
            type="button"
            title={""}
            row={""}
            index={""}
            list={[]}
            filterDatas={[]}
            dataHandler={setCurrentDatas}
            filterHandler={setTasks}
            onClick={() => {
              refreshTaskData();
            }}
          >
            {onRefreshingTask ? (
              <Spinner color={"#000"} size={20} />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5M21 10V4M21 10H15"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
          </Filter>
          <Filter
            type="search"
            title={"Rechercher une entrée"}
            row={""}
            indexs={["code", "reference", "dim_lx_lh", "commercial.name"]}
            list={status}
            filterDatas={allTasks ? allTasks : []}
            dataHandler={setCurrentDatas}
            filterHandler={setTasks}
          />
          <Filter
            type="date"
            title={"Affichage par date"}
            row={"Status"}
            index={"status_id"}
            list={status}
            filterDatas={allTasks ? allTasks : []}
            dataHandler={setCurrentDatas}
            filterHandler={setTasks}
          />
        </div>
        <div className="relative w-full overflow-auto bg-white">
          {!allTasks ? (
            <TableSkeleton head={tableHead} />
          ) : currentDatas.length > 0 ? (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                ease: [0.36, 0.01, 0, 0.99],
                delay: 0.2,
              }}
            >
              <table className="w-full mb-[20rem] relative">
                <thead className="bg-white/50">
                  <tr className="border-b">
                    {tableHead?.map((head, index) => (
                      <th
                        onClick={() => {
                          if (["Options", "Statut"].includes(head)) return;
                          sort(head.toLocaleLowerCase());
                        }}
                        key={index}
                        className={`w-fit ${
                          index === 0 ? "w-0" : "min-w-[150px]"
                        } text-[13px] py-[10px] font-medium  ${
                          index > 0 && index < tableHead.length
                        }  text-[#000000]`}
                      >
                        <div
                          className={`h-full font-poppins  relative flex items-center text-start gap-x-[10px] px-[20px] ${
                            head === "Options"
                              ? " justify-end"
                              : " justify-start"
                          }`}
                        >
                          {head}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white/10">
                  {tasks?.map((row, index) => {
                    return (
                      <tr
                        key={index}
                        className={`cursor-pointer border-b transition-all duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                      >
                        <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]">
                          <div
                            className={`flex w-fit justify-center py-[3px] px-[10px] font-medium rounded-full ${
                              !row.completed_at
                                ? "bg-blue-200 text-blue-900"
                                : "bg-green-200 text-green-500"
                            }`}
                          >
                            {!row.completed_at ? "En cours" : "Terminé"}
                          </div>
                        </td>
                        <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]">
                          {row?.assignable?.reference}
                        </td>
                        <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[14px]">
                          <div
                            className={`flex w-fit justify-center py-[3px] rounded-full`}
                          >
                            {row?.description}
                          </div>
                        </td>

                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
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
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                          {formatTime(
                            new Date(
                              row?.["updated_at"] as unknown as string
                            ).getTime(),
                            "d:mo:y",
                            "short"
                          )}
                          {" à "}
                          {formatTime(
                            new Date(
                              row?.["updated_at"] as unknown as string
                            ).getTime(),
                            "h:m",
                            "short"
                          )}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                          {row?.completed_at &&
                            formatTime(
                              new Date(
                                row?.["completed_at"] as unknown as string
                              ).getTime(),
                              "d:mo:y",
                              "short"
                            )}
                          {row?.completed_at && " à "}
                          {row?.completed_at &&
                            formatTime(
                              new Date(
                                row?.["completed_at"] as unknown as string
                              ).getTime(),
                              "h:m",
                              "short"
                            )}
                        </td>
                        <td className="text-[#636363] w-auto px-[20px] text-start font-poppins">
                          <div className="w-full h-full flex items-center justify-end">
                            <div ref={box}>
                              <MenuDropdown
                                dropdownOrigin="bottom-right"
                                otherStyles={"w-auto"}
                                buttonContent={
                                  <div>
                                    <div
                                      onClick={(e) => {
                                        handleClick(e);
                                        setCurrentEntry(row.id);
                                      }}
                                      className={`h-[44px] w-full flex items-center justify-center`}
                                    >
                                      <OptionsIcon color={"#636363"} />
                                    </div>
                                  </div>
                                }
                              >
                                <div className="bg-white w-[200px] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
                                  <div className="flex flex-col items-center w-full">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDelationModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      {/* <DeleteShapeIcon color={""} /> */}
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        Assigner à un autre utilisateur
                                      </span>
                                    </button>
                                    {/* <button
                                      type="button"
                                      onClick={() => {
                                        setOpenObservationModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <DeleteShapeIcon color={""} />
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        Faire une observation
                                      </span>
                                    </button> */}

                                    {/* <button
                                      type="button"
                                      onClick={() => {
                                        setDelationModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <DeleteShapeIcon color={""} />
                                      <span className="text-[14px] text-red-500 font-medium font-poppins leading-[20px] ">
                                        Supprimer la forme
                                      </span>
                                    </button> */}
                                  </div>
                                </div>
                              </MenuDropdown>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1,
                ease: [0.36, 0.01, 0, 0.99],
                delay: 0.2,
              }}
            >
              <div className="w-full bg-white/80 flex justify-center items-center font-poppins font-medium leading-[20px] px-[20px] h-[60px]">
                Aucune donnée
              </div>
            </motion.div>
          )}
        </div>
        {currentDatas.length > 0 ? (
          <Pagination
            datas={currentDatas ? currentDatas : []}
            listHandler={setTasks}
          />
        ) : null}
      </motion.div>

      {/* end MODAL */}
      <BaseModal open={openDelationModal} classname={""}>
        <Form form={endTaskForm} onSubmit={onSubmitEndTaskForm}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[18px] font-poppins text-[#060606]">
                  Attribuer à quelqu'un
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setDelationModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="w-full p-[20px]">
              <ComboboxMultiSelect
                label={"Utilisateur"}
                placeholder="Selectionnez un utilisateur"
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
                id={`utilisateur`}
                options={
                  users?.map((user: User) => ({
                    value: user.id as unknown as string,
                    label: user.name,
                  })) as any
                }
                error={undefined}
                isUniq={true}
                selectedElementInDropdown={user}
                setSelectedUniqElementInDropdown={setUser}
                borderColor="border-grayscale-200"
              />

              <BaseTextArea
                label="Raison"
                id="reason"
                placeholder={`Donnez un descriptif`}
                type="text"
                {...endTaskForm.register("reason")}
              />

              <BaseTextArea
                label="Note"
                id="note"
                placeholder={`Laisser une note`}
                type="text"
                {...endTaskForm.register("note")}
              />
            </div>

            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                {loading ? <Spinner color={"#fff"} size={20} /> : "Terminer"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>
    </div>
  );
};
