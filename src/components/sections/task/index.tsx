"use client";
import { FC, useMemo, useState, useEffect } from "react";
import BaseModal from "@/components/ui/modal/BaseModal";
import { CloseIcon, OptionsIcon } from "@/components/svg";
import { BaseTextArea } from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import React from "react";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import { TaskInterface, useData, User } from "@/contexts/data.context";
import { formatTime } from "@/lib/utils/timestamp";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";

import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton } from "@/components/ui/loader/Skeleton";
import { useToast } from "@/contexts/toast.context";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";
import { Filter } from "@/components/ui/filter";

import { endTask, endAndAssignTask } from "@/services/task";
import { createRoot } from "react-dom/client";
import { useSideBar } from "@/contexts/sidebar.context";
import useSWR from "swr";
import axios from "axios";
import { getToken } from "@/lib/data/token";
import { useRouter } from "next/navigation";

export const Task: FC<{}> = ({}) => {
  const { roleAdmin } = useSideBar();

  const getAllTasks = async () => {
    const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/all-tasks`;
    const token = await getToken();
    const reponse = await axios.get(URL, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return reponse.data;
  };

  const getUserTasks = async () => {
    const URL: string = `${process.env.NEXT_PUBLIC_API_URL}/tasks`;
    const token = await getToken();
    const reponse = await axios.get(URL, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return reponse.data;
  };

  const { data, mutate, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/all-tasks`,
    roleAdmin ? getAllTasks : getUserTasks
  );

  const allTasks: TaskInterface[] = useMemo(() => {
    console.log("data===", data?.data);
    return data ? data : [];
  }, [data]);

  const {
    users,
    status,
    departments,
    clients,
    dispatchTasks,
    refreshTaskData,
    onRefreshingTask,
  } = useData();

  const endAndAssignTaskShema = z.object({
    reason: z.string(),
    note: z.string(),
    user: z.number(),
  });

  const endTaskShema = z.object({
    reason: z.string(),
  });

  const tableHead = [
    "Statut",
    "Reference",
    "Type",
    "Departement",
    "Client",
    "Code",
    "Attribué à",
    "Description",
    // "Dimension LxLxH",
    // "Dimensions Carré",
    // "Dimensions Plaque",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
    "Terminé le",
    "Options",
  ];

  const { box, handleClick } = useActiveState();
  const [tasks, setTasks] = useState<TaskInterface[] | undefined>([]);
  const [endAndAssignModal, setEndAndAssignModal] = useState<boolean>(false);
  const [endModal, setEndModal] = useState<boolean>(false);

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
    endAndAssignTaskForm.setValue("user", user[0]?.value as unknown as number);
  }, [user]);

  const endAndAssignTaskForm = useForm({ schema: endAndAssignTaskShema });
  const endTaskForm = useForm({ schema: endTaskShema });

  const onSubmitEndAndAssignTaskForm = async (
    data: z.infer<typeof endAndAssignTaskShema>
  ) => {
    setLoading(true);
    const { data: closeTaskData, success } = await endAndAssignTask(
      taskInEntry?.id as unknown as number,
      {
        reason: data.reason,
        task_description: data.note,
        user_assignated_id: data.user,
      }
    );
    if (success) {
      showToast({
        type: "success",
        message: "Attribué avec succès",
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
    setEndAndAssignModal(false);
    reset();
  };

  const onSubmitEndTaskForm = async (data: z.infer<typeof endTaskShema>) => {
    setLoading(true);
    const { success } = await endTask(taskInEntry?.id as unknown as number, {
      reason: data.reason,
    });
    if (success) {
      showToast({
        type: "success",
        message: "Terminé avec succès",
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
    setEndModal(false);
    reset();
  };

  useEffect(() => {
    setCurrentDatas(allTasks ? allTasks : []);
  }, [allTasks]);

  const reset = () => {
    endAndAssignTaskForm.setValue("note", "");
    endAndAssignTaskForm.setValue("reason", "");
    endAndAssignTaskForm.setValue("user", 0);
    endTaskForm.setValue("reason", "");
    setUser([]);
  };

  const { showToast } = useToast();
  const taskInEntry = useMemo(() => {
    const task: TaskInterface | undefined = tasks?.find(
      (task: TaskInterface) => task.id === currentEntry
    );
    return task;
  }, [currentEntry]);

  const [sortedBy, setSortedBY] = useState<string>("");

  const sort = (key: string) => {
    setCurrentDatas((tmp) => {
      let sorted: any = [];
      setSortedBY(key);
      if (key === "client") {
        sorted = tmp?.sort((a, b) => {
          if (a?.client.name.toUpperCase() > b?.client?.name?.toUpperCase()) {
            return sortedBy !== key ? 1 : -1;
          }
          if (a?.client?.name?.toUpperCase() < b?.client?.name?.toUpperCase()) {
            return sortedBy !== key ? -1 : 1;
          }
          return 0;
        });
      }
      if (key === "attribué à") {
        sorted = tmp?.sort((a, b) => {
          if (
            (users
              ?.find((user) => user.id === a.user_id)
              ?.name?.toUpperCase() as unknown as string) >
            (users
              ?.find((user) => user.id === b.user_id)
              ?.name?.toUpperCase() as unknown as string)
          ) {
            return 1;
          }
          if (
            (users
              ?.find((user) => user.id === a.user_id)
              ?.name?.toUpperCase() as unknown as string) <
            (users
              ?.find((user) => user.id === b.user_id)
              ?.name?.toUpperCase() as unknown as string)
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "commercial") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.commercial?.name?.toUpperCase() >
            b?.commercial?.name?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.commercial?.name?.toUpperCase() <
            b?.commercial?.name?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "type") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable_type.split("\\")[2].toLowerCase() >
            b?.assignable_type.split("\\")[2].toLowerCase()
          ) {
            return 1;
          }
          if (
            a?.assignable_type.split("\\")[2].toLowerCase() <
            b?.assignable_type.split("\\")[2].toLowerCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "departement") {
        sorted = tmp?.sort((a, b) => {
          if (
            (departments
              ?.find(
                (department) => department.id === a.assignable.department_id
              )
              ?.name?.toUpperCase() as unknown as string) >
            (departments
              ?.find(
                (department) => department.id === b.assignable.department_id
              )
              ?.name?.toUpperCase() as unknown as string)
          ) {
            return 1;
          }
          if (
            (departments
              ?.find((user) => user.id === a.assignable.department_id)
              ?.name?.toUpperCase() as unknown as string) <
            (departments
              ?.find((user) => user.id === b.assignable.department_id)
              ?.name?.toUpperCase() as unknown as string)
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "client") {
        sorted = tmp?.sort((a, b) => {
          if (
            (clients
              ?.find((client) => client.id === a.assignable.client_id)
              ?.name?.toUpperCase() as unknown as string) >
            (clients
              ?.find((client) => client.id === b.assignable.client_id)
              ?.name?.toUpperCase() as unknown as string)
          ) {
            return 1;
          }
          if (
            (clients
              ?.find((client) => client.id === a.assignable.client_id)
              ?.name?.toUpperCase() as unknown as string) <
            (clients
              ?.find((client) => client.id === b.assignable.client_id)
              ?.name?.toUpperCase() as unknown as string)
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "code") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.code?.toUpperCase() >
            b?.assignable?.code?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.code?.toUpperCase() <
            b?.assignable?.code?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "reference") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.reference?.toUpperCase() >
            b?.assignable?.reference?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.reference?.toUpperCase() <
            b?.assignable?.reference?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "departement") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.department?.name?.toUpperCase() >
            b?.assignable?.department?.name?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.department?.name?.toUpperCase() <
            b?.assignable?.department?.name?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "dimension lxlxh") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.dim_lx_lh?.toUpperCase() >
            b?.assignable?.dim_lx_lh?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.dim_lx_lh?.toUpperCase() <
            b?.assignable?.dim_lx_lh?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "dimensions carré") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.dim_square?.toUpperCase() >
            b?.assignable?.dim_square?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.dim_square?.toUpperCase() <
            b?.assignable?.dim_square?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "dimensions plaque") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.dim_plate?.toUpperCase() >
            b?.assignable?.dim_plate?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.dim_plate?.toUpperCase() <
            b?.assignable?.dim_plate?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "type papier") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.paper_type?.toUpperCase() >
            b?.assignable?.paper_type?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.paper_type?.toUpperCase() <
            b?.assignable?.paper_type?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      // if (key === "n° des poses") {
      //   sorted = tmp?.sort((a, b) => {
      //     if (a.pose_number.toUpperCase() > b.pose_number.toUpperCase()) {
      //       return 1;
      //     }
      //     if (a.pose_number.toUpperCase() < b.pose_number.toUpperCase()) {
      //       return -1;
      //     }
      //     return 0;
      //   });
      // }

      if (key === "n° des poses") {
        sorted = tmp?.sort((a, b) => {
          if (a.pose_number?.toUpperCase() > b.pose_number?.toUpperCase()) {
            return 1;
          }
          if (a.pose_number?.toUpperCase() < b.pose_number?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "1/3") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.assignable?.part?.toUpperCase() >
            b.assignable?.part?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.assignable?.part?.toUpperCase() <
            b?.assignable?.part?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      return [...(sorted as unknown as any)];
    });
  };

  const resetSortedBy = () => {
    setCurrentDatas(allTasks ? [...allTasks] : []);
    setSortedBY("");
  };

  const [combineSearch, setCombineSearch] = useState<any[]>([]);
  let combo: any = [];
  const handleCombineSearch = () => {
    combineSearch?.map((item) => {
      if (item.id === "Code" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) => task.assignable.code === item?.selectedValues[0]?.value
        );
      }

      // if (item.id === "Client" && item?.selectedValues.length > 0) {
      //   combo = (combo.length === 0 ? allTasks : combo)?.filter(
      //     (task: any) => task?.assignable?.client?.name === item?.selectedValues[0]?.value
      //   );
      // }

      if (item.id === "Reference" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            task?.assignable?.reference === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Commercial" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            task?.assignable?.commercial?.name ===
            item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Attribué à" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            users?.find((user) => user.id === task.user_id)?.name ===
            item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Type" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            task?.assignable_type.split("\\")[2] ===
            item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Departement" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            departments?.find(
              (department) => department.id === task.assignable.department_id
            )?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Client" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            clients?.find((client) => client.id === task.assignable.client_id)
              ?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions LxLxH" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            task?.assignable?.dim_lx_lh === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions Carré" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            task?.assignable?.dim_square === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions Plaque" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allTasks : combo)?.filter(
          (task: any) =>
            task?.assignable?.dim_plate === item?.selectedValues[0]?.value
        );
      }

      // if (item.id === "Type Papier" && item?.selectedValues.length > 0) {
      //   combo = (combo.length === 0 ? allTasks : combo)?.filter(
      //     (task: any) =>
      //       task?.assignable?.paper_type === item?.selectedValues[0]?.value
      //   );
      // }

      // if (item.id === "N° des poses" && item?.selectedValues.length > 0) {
      //   combo = (combo.length === 0 ? allTasks : combo)?.filter(
      //     (task: any) =>
      //       task?.assignable?.pose_number === item?.selectedValues[0]?.value
      //   );
      // }

      // if (item.id === "1/3" && item?.selectedValues.length > 0) {
      //   combo = (combo.length === 0 ? allTasks : combo)?.filter(
      //     (task: any) =>
      //       task?.assignable?.part === item?.selectedValues[0]?.value
      //   );
      // }
    });

    setCurrentDatas(combo);
  };

  const deleteSearchCombinaison = (
    e: { stopPropagation: () => void },
    row: string
  ) => {
    e.stopPropagation();
    setCombineSearch((tmp: any) => {
      return [...tmp.filter((combine: any) => combine.id !== row)];
    });
  };
  const createSearchCombinaison = (
    e: { stopPropagation: () => void },
    row: string
  ) => {
    e.stopPropagation();
    setCombineSearch((tmp: any) => {
      const mySet = new Set();
      const obj = {
        id: row,
        searchField: "",
        fields: [],
        selectedValues: [],
      };

      if (allTasks)
        allTasks.forEach((all: any) => {
          if (row === "Code") {
            mySet.add(all?.assignable?.code);
          }
          // if (row === "Client" && all?.assignable?.client?.name)
          //   mySet.add(all?.assignable?.client?.name);
          if (row === "Attribué à") {
            mySet.add(users?.find((user) => user.id === all.user_id)?.name);
          }

          if (row === "Type" && all?.assignable_type) {
            mySet.add(all?.assignable_type.split("\\")[2]);
          }

          if (row === "Reference" && all?.assignable?.reference)
            mySet.add(all?.assignable?.reference);
          // if (row === "Commercial" && all?.assignable?.name)
          //   mySet.add(all?.commercial?.name);
          if (row === "Departement" && all?.assignable?.department_id)
            mySet.add(
              departments?.find(
                (department) => department.id === all.assignable.department_id
              )?.name
            );

          if (row === "Client" && all?.assignable?.department_id)
            mySet.add(
              clients?.find((client) => client.id === all.assignable.client_id)
                ?.name
            );
          if (row === "Dimension LxLxH" && all?.assignable?.dim_lx_lh)
            mySet.add(all?.assignable?.dim_lx_lh);
          if (row === "Dimensions Carré" && all?.assignable?.dim_square)
            mySet.add(all?.assignable?.dim_square);
          if (row === "Dimensions Plaque" && all?.assignable?.dim_plate)
            mySet.add(all?.assignable?.dim_plate);
          if (row === "Description" && all?.description)
            mySet.add(all?.description);
        });

      obj.fields = Array.from(mySet) as any;
      tmp.push(obj);
      return [...tmp];
    });
  };

  useEffect(() => {
    if (combineSearch.some((cmb) => cmb.selectedValues.length > 0)) {
      handleCombineSearch();
    } else setCurrentDatas(allTasks as any);
  }, [combineSearch]);

  const excludedsTableHeadInActions = useMemo(
    () => [
      "Options",
      "Statut",
      "Date & Heure de création",
      "Date & Heure de mise à jour",
      "Terminé le",
      "Description",
    ],
    []
  );

  const Router = useRouter();
  const goToDetail = (id: any) => {
    Router.push(`/workspace/details/user-tasks/${id}`);
  };

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
            <div className="w-[40px] h-[40px] flex items-center justify-center">
              {onRefreshingTask ? (
                <Spinner color={"#000"} size={16} />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5M21 10V4M21 10H15"
                    stroke="#475569"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </Filter>
          <Filter
            type="status"
            title={"Affichage par statut"}
            row={"Status"}
            index={"status_id"}
            list={status.filter((st) => [1, 4].includes(st.id) && st)}
            filterDatas={
              Array.isArray(allTasks)
                ? allTasks?.map((task: TaskInterface) => ({
                    ...task,
                    status_id: task.completed_at ? 4 : 1,
                  }))
                : []
            }
            dataHandler={setCurrentDatas}
            filterHandler={setTasks}
          />
          {/* <Filter
            type="status"
            title={"Affichage par type"}
            row={"Status"}
            index={"status_id"}
            list={status.filter((st) => [1, 4].includes(st.id) && st)}
            filterDatas={
              allTasks
                ? allTasks.map((task: TaskInterface) => ({
                    ...task,
                    status_id: task.completed_at ? 4 : 1,
                  }))
                : []
            }
            dataHandler={setCurrentDatas}
            filterHandler={setTasks}
          /> */}
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
          {!allTasks || isLoading ? (
            <TableSkeleton head={tableHead} />
          ) : currentDatas?.length > 0 ? (
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
                <thead className="bg-white/50 transition">
                  <tr className="border-b bg-gray-50 cursor-pointer">
                    {tableHead?.map((head, index) => (
                      <th
                        key={index}
                        className={`relative w-fit ${
                          index === 0 ? "w-0" : "min-w-[180px] w-auto"
                        } text-[14px] py-[10px] font-medium  ${
                          index > 0 && index < tableHead.length
                        }  text-[#000000]`}
                      >
                        <div
                          className={`h-full font-poppins relative flex items-center text-start gap-x-[10px] px-[20px] ${
                            head === "Options" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            onClick={() => {
                              if (
                                [
                                  "Options",
                                  "Statut",
                                  "Date & Heure de création",
                                  "Date & Heure de mise à jour",
                                ].includes(head)
                              )
                                return;
                              if (sortedBy === head.toLowerCase())
                                resetSortedBy();
                              else sort(head.toLowerCase());
                            }}
                            className={`w-full flex items-center`}
                          >
                            <div
                              className={`w-full h-[40px] flex items-center  ${
                                head === "Options"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {head}
                            </div>

                            <div>
                              {![
                                "Options",
                                "Statut",
                                "Date & Heure de création",
                                "Date & Heure de mise à jour",
                              ].includes(head) ? (
                                <div className="flex justify-between items-center w-full">
                                  <div
                                    className={`cursor-pointer ${
                                      sortedBy === head.toLowerCase()
                                        ? "bg-blue-200"
                                        : ""
                                    } shrink-0 p-[8px] rounded-lg`}
                                  >
                                    <svg
                                      version="1.1"
                                      id="fi_690342"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={15}
                                      height={15}
                                      viewBox="0 0 512 512"
                                    >
                                      <g>
                                        <g>
                                          <path
                                            fill={
                                              sortedBy === head.toLowerCase()
                                                ? "#3b82f6"
                                                : "#64748b"
                                            }
                                            d="M106.23,0H75.86L1.496,212.467h42.273l11.172-31.92h71.37l11.012,31.92h42.207L106.23,0z M68.906,140.647l21.976-62.791 l21.664,62.791H68.906z"
                                          ></path>
                                        </g>
                                      </g>
                                      <g>
                                        <g>
                                          <polygon
                                            fill={
                                              sortedBy === head.toLowerCase()
                                                ? "#3b82f6"
                                                : "#64748b"
                                            }
                                            points="483.288,359.814 407.478,435.624 407.478,0 367.578,0 367.578,435.624 291.768,359.814 263.555,388.027 387.528,512 511.501,388.027"
                                          ></polygon>
                                        </g>
                                      </g>
                                      <g>
                                        <g>
                                          <polygon
                                            fill={
                                              sortedBy === head.toLowerCase()
                                                ? "#3b82f6"
                                                : "#64748b"
                                            }
                                            points="182.043,299.247 0.499,299.247 0.499,339.147 122.039,339.147 0.499,480.372 0.499,511.717 180.048,511.717 .048,471.817 60.503,471.817 182.043,330.592"
                                          ></polygon>
                                        </g>
                                      </g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                      <g></g>
                                    </svg>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div>
                            {![
                              "Options",
                              "Statut",
                              "Date & Heure de création",
                              "Date & Heure de mise à jour",
                            ].includes(head) ? (
                              <div className="flex justify-end items-center w-full">
                                <div
                                  className={`cursor-pointer ${
                                    combineSearch.some((cmb) => {
                                      return cmb.id === head;
                                    })
                                      ? "bg-blue-200"
                                      : ""
                                  } shrink-0 p-[8px] rounded-lg`}
                                  onClick={(e) => {
                                    combineSearch.find((cmb) => cmb.id === head)
                                      ? deleteSearchCombinaison(e, head)
                                      : createSearchCombinaison(e, head);
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M2 4.6C2 4.03995 2 3.75992 2.10899 3.54601C2.20487 3.35785 2.35785 3.20487 2.54601 3.10899C2.75992 3 3.03995 3 3.6 3H20.4C20.9601 3 21.2401 3 21.454 3.10899C21.6422 3.20487 21.7951 3.35785 21.891 3.54601C22 3.75992 22 4.03995 22 4.6V5.26939C22 5.53819 22 5.67259 21.9672 5.79756C21.938 5.90831 21.8901 6.01323 21.8255 6.10776C21.7526 6.21443 21.651 6.30245 21.4479 6.4785L15.0521 12.0215C14.849 12.1975 14.7474 12.2856 14.6745 12.3922C14.6099 12.4868 14.562 12.5917 14.5328 12.7024C14.5 12.8274 14.5 12.9618 14.5 13.2306V18.4584C14.5 18.6539 14.5 18.7517 14.4685 18.8363C14.4406 18.911 14.3953 18.9779 14.3363 19.0315C14.2695 19.0922 14.1787 19.1285 13.9971 19.2012L10.5971 20.5612C10.2296 20.7082 10.0458 20.7817 9.89827 20.751C9.76927 20.7242 9.65605 20.6476 9.58325 20.5377C9.5 20.4122 9.5 20.2142 9.5 19.8184V13.2306C9.5 12.9618 9.5 12.8274 9.46715 12.7024C9.43805 12.5917 9.39014 12.4868 9.32551 12.3922C9.25258 12.2856 9.15102 12.1975 8.94789 12.0215L2.55211 6.4785C2.34898 6.30245 2.24742 6.21443 2.17449 6.10776C2.10986 6.01323 2.06195 5.90831 2.03285 5.79756C2 5.67259 2 5.53819 2 5.26939V4.6Z"
                                      stroke="black"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="relative h-auto w-full z-50">
                          {![
                            "Options",
                            "Statut",
                            "Date & Heure de création",
                            "Date & Heure de mise à jour",
                          ].includes(head) &&
                          combineSearch.some((cmb) => {
                            return cmb.id === head;
                          }) ? (
                            <motion.div
                              initial={{ y: 40, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{
                                duration: 1,
                                ease: [0.36, 0.01, 0, 0.99],
                                delay: 0.2,
                              }}
                            >
                              <div className="my-[10px] px-[20px]">
                                <Form
                                  form={endAndAssignTaskForm}
                                  onSubmit={onSubmitEndAndAssignTaskForm}
                                >
                                  <ComboboxMultiSelect
                                    placeholder=""
                                    className="w-full"
                                    icon={
                                      <svg
                                        width="16"
                                        height="16"
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
                                    id={`users`}
                                    options={
                                      // users?.map((user: User) => ({
                                      //   value: user.id as unknown as string,
                                      //   label: user.name,
                                      // })) as any
                                      combineSearch
                                        .find((opt) => opt.id === head)
                                        ?.fields?.map((field: unknown) => ({
                                          value: field as unknown as string,
                                          label: field as unknown as string,
                                        }))
                                    }
                                    error={undefined}
                                    isUniq={true}
                                    selectedElementInDropdown={
                                      combineSearch.find(
                                        (opt) => opt.id === head
                                      )?.selectedValues
                                    }
                                    setSelectedUniqElementInDropdown={(
                                      data: any
                                    ) => {
                                      setCombineSearch((tmp) => {
                                        if (data.length > 0) {
                                          return tmp?.map((cmb) =>
                                            cmb.id === head
                                              ? {
                                                  ...cmb,
                                                  selectedValues: [...data],
                                                }
                                              : { ...cmb }
                                          );
                                        }
                                        return tmp.filter(
                                          (cmb) => cmb.id !== head
                                        );
                                      });
                                    }}
                                    borderColor="border-grayscale-200"
                                    label={""}
                                  />
                                </Form>
                              </div>
                            </motion.div>
                          ) : null}
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
                        onContextMenu={(e) => {
                          e.preventDefault();
                          document.getElementById("dropdown")?.remove();
                          const dropdown = document.createElement("div");
                          dropdown.id = "dropdown";
                          dropdown.className =
                            "w-[200px] h-auto absolute z-[500]";
                          const target = e.target as HTMLElement;
                          target.appendChild(dropdown);
                          setCurrentEntry(row?.id);
                          const root = createRoot(dropdown);
                          root.render(
                            <div className="bg-white w-[200px] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
                              <div className="flex flex-col items-center w-full">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    setEndAndAssignModal(true);
                                    e.stopPropagation();
                                  }}
                                  className="flex items-center justify-start w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                >
                                  {/* <DeletetaskIcon color={""} /> */}
                                  <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] text-start ">
                                    Assigner à un utilisateur
                                  </span>
                                </button>
                                {roleAdmin ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      setEndModal(true);
                                      e.stopPropagation();
                                    }}
                                    className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                  >
                                    {/* <DeletetaskIcon color={""} /> */}
                                    <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                      Terminer
                                    </span>
                                  </button>
                                ) : null}
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
                        className={`cursor-pointer border-b transition-all duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                      >
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]"
                        >
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
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] w-auto px-[20px] text-start font-poppins text-[14px]"
                        >
                          {row?.assignable?.reference}
                        </td>

                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] w-auto px-[20px] text-start font-poppins text-[14px]"
                        >
                          {row?.assignable_type.split("\\")[2]}
                        </td>

                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] w-auto px-[20px] text-start font-poppins text-[14px]"
                        >
                          {
                            departments?.find(
                              (department) =>
                                department.id === row?.assignable?.department_id
                            )?.name
                          }
                        </td>

                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] w-auto px-[20px] text-start font-poppins text-[14px]"
                        >
                          {
                            clients?.find(
                              (client) =>
                                client.id === row?.assignable?.client_id
                            )?.name
                          }
                        </td>

                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] w-auto px-[20px] text-start font-poppins text-[14px]"
                        >
                          {row?.assignable?.code}
                        </td>

                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] w-auto px-[20px] text-start font-poppins text-[14px]"
                        >
                          {users?.find((user) => user.id === row.user_id)?.name}
                        </td>

                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] w-auto px-[20px] text-start font-poppins text-[14px]"
                        >
                          <div
                            className={`flex w-fit justify-center py-[3px] rounded-full`}
                          >
                            {row?.description}
                          </div>
                        </td>
                        {/* <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[14px]">
                          {row?.assignable?.dim_lx_lh}
                        </td>

                        <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[14px]">
                          {row?.assignable?.dim_square}
                        </td>

                        <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[14px]">
                          {row?.assignable?.dim_plate}
                        </td> */}

                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
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
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
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
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
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
                                      onClick={(e) => {
                                        setEndAndAssignModal(true);
                                        e.stopPropagation();
                                      }}
                                      className="flex items-center justify-start w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      {/* <DeletetaskIcon color={""} /> */}
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        Assigner à un utilisateur
                                      </span>
                                    </button>
                                    {roleAdmin ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          setEndModal(true);
                                          e.stopPropagation();
                                        }}
                                        className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                      >
                                        {/* <DeletetaskIcon color={""} /> */}
                                        <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                          Terminer
                                        </span>
                                      </button>
                                    ) : null}
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
                <div className="w-full bg-white/80 flex gap-x-[10px] justify-center items-center font-poppins font-medium leading-[20px] px-[20px] h-[60px]">
                  Aucune donnée
                  {currentDatas?.length === 0 ? (
                    <Filter
                      type="button"
                      title={""}
                      row={""}
                      index={""}
                      list={[]}
                      filterDatas={allTasks ? allTasks : []}
                      dataHandler={setCurrentDatas}
                      filterHandler={setTasks}
                      onClick={() => {
                        setCombineSearch((tmp: any) => {
                          tmp.pop();
                          return [...tmp];
                        });
                      }}
                    >
                      <div
                        className={`h-[30px] w-[30px]  shrink-0  flex items-center  justify-center`}
                      >
                        <CloseIcon size={14} color="black" />
                      </div>
                    </Filter>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        {currentDatas?.length > 0 ? (
          <Pagination
            datas={currentDatas ? currentDatas : []}
            listHandler={setTasks}
          />
        ) : null}
      </motion.div>

      {/* end with assignation */}
      <BaseModal open={endAndAssignModal} classname={""}>
        <Form
          form={endAndAssignTaskForm}
          onSubmit={onSubmitEndAndAssignTaskForm}
        >
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  {`Attribuer à quelqu'un`}
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setEndAndAssignModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="w-full p-[20px] flex flex-col gap-y-[10px]">
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
                label="Description de la tâche"
                id="description"
                placeholder={`Donnez un descriptif`}
                type="text"
                {...endAndAssignTaskForm.register("reason")}
              />

              <BaseTextArea
                label="Note"
                id="note"
                placeholder={`Laisser une note`}
                type="text"
                {...endAndAssignTaskForm.register("note")}
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

      {/* end without assignation */}
      <BaseModal open={endModal} classname={""}>
        <Form form={endTaskForm} onSubmit={onSubmitEndTaskForm}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  {`Terminer`}
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setEndModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="w-full p-[20px]">
              <BaseTextArea
                label="Raison"
                id="reason"
                placeholder={`Donnez un descriptif`}
                type="text"
                {...endTaskForm.register("reason")}
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
