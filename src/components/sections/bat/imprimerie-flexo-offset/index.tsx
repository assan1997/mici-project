"use client";
import { FC, useMemo, useState, useEffect, useCallback } from "react";
import BaseDropdown from "@/components/ui/dropdown/BaseDropdown";
import BaseModal from "@/components/ui/modal/BaseModal";
import Link from "next/link";
import {
  CloseIcon,
  DeleteUserIcon,
  DetailsIcon,
  EditIcon,
  FolderIcon,
  OptionsIcon,
  RulerIcon,
  UpdateIcon,
  DeleteShapeIcon,
  LogIcon,
} from "@/components/svg";
import { BaseInput, BaseTextArea } from "@/components/ui/forms/BaseInput";
import { array, string, z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import React from "react";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import { Client, Department, useData, User } from "@/contexts/data.context";
import { BatInterface } from "@/contexts/data.context";
import { createOffsetShape } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import {
  OffsetShapeEntry,
  updateOffsetShape,
  standbyOffsetShape,
  observationOffsetShape,
  assignToAnUserOffsetShape,
} from "@/services/shapes";
import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton, ButtonSkeleton } from "@/components/ui/loader/Skeleton";
import { useToast } from "@/contexts/toast.context";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";
import { Filter } from "@/components/ui/filter";
import {
  createBat,
  BatEntry,
  updateBat,
  standbyBat,
  observationBat,
  assignToAnUserBat,
  deleteBat,
} from "@/services/bat";

export const ImprimerieFlexoOffset: FC<{}> = ({}) => {
  const {
    users,
    clients,
    departments,
    bats: allBats,
    user,
    dispatchBats,
    status,
  } = useData();
  const batSchema = z.object({
    client: z.number(),
    commercial: z.number(),
    department: z.number(),
    // rules: z.string(),
    product: z.number().default(1),
    fabrication: z.number().default(1),
    shape: z.number().default(1),
    reference: z.string(),
    details: z.string(),
  });
  const batStandBySchema = z.object({
    reason: z.string(),
  });
  const batObservationSchema = z.object({
    observation: z.string(),
  });
  const batAssignSchema = z.object({
    user_id: z.number(),
  });
  const form = useForm({ schema: batSchema });
  const standByform = useForm({ schema: batStandBySchema });
  const observationForm = useForm({ schema: batObservationSchema });
  const assignForm = useForm({ schema: batAssignSchema });
  const tableHead = [
    "Statut",
    "Client",
    "reference",
    // "Produit",
    "Departement",
    // "Fabrication",
    "Commercial",
    // "Details",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
    "Options",
  ];
  const reset = () => {
    form.setValue("client", 0);
    form.setValue("commercial", 0);
    form.setValue("department", 0);
    form.setValue("product", 0);
    form.setValue("fabrication", 0);
    form.setValue("reference", "");
    form.setValue("details", "");
    setCurrentEntry(undefined);
    setCommercial([]);
    setDepartment([]);
    setClient([]);
  };
  const { box, handleClick, isActive } = useActiveState();
  const [bats, setBats] = useState<BatInterface[] | undefined>([]);
  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const onSubmit = async (data: z.infer<typeof batSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      // rules,
      product,
      fabrication,
      details,
      reference,
    } = data;
    reference = reference.trim();
    details = details.trim();

    const { data: createdBat, success } = await createBat({
      client_id: client,
      department_id: department,
      commercial_id: commercial,
      product_id: product,
      fabrication_id: fabrication,
      details,
      reference,
    });
    if (success) {
      reset();
      setCreationModal(false);
      createdBat.department = departments.filter(
        (dep) => dep.id === department && dep
      );
      createdBat.commercial = users?.find((use) => use.id === commercial);
      createdBat.client = clients?.find((cli) => cli?.id === client);
      dispatchBats((tmp) => {
        if (tmp) return [createdBat, ...tmp];
      });

      showToast({
        type: "success",
        message: "Crée avec succès",
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoading(false);
  };
  interface ComboSelect {
    label: string;
    value: string;
  }
  const [commercial, setCommercial] = useState<ComboSelect[]>([]);
  const [assignUser, setAssignUser] = useState<ComboSelect[]>([]);
  const [client, setClient] = useState<ComboSelect[]>([]);
  const [department, setDepartment] = useState<ComboSelect[]>([]);
  const [shape, setShape] = useState<ComboSelect[]>([]);
  const [fabrication, setFabrication] = useState<ComboSelect[]>([]);
  const [product, setProduct] = useState<ComboSelect[]>([]);
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentDatas, setCurrentDatas] = useState<any[]>(
    allBats ? allBats : []
  );

  useEffect(() => {
    setCurrentDatas(allBats ? allBats : []);
  }, [allBats]);

  const { showToast } = useToast();
  const batInEntry = useMemo(() => {
    const bat: BatInterface | undefined = bats?.find(
      (bat: BatInterface) => bat.id === currentEntry
    );
    if (!bat) return;
    const dep = {
      value: bat?.department?.id,
      label: bat?.department?.name,
    };
    const comm = {
      value: bat?.commercial?.id,
      label: bat?.commercial?.name,
    };
    const cli = {
      value: bat?.client?.id,
      label: bat?.client?.name,
    };
    const shp = {
      value: bat?.shape?.id,
      label: bat?.shape?.reference,
    };
    const prd = {
      value: bat?.product?.id,
      label: bat?.product?.reference,
    };
    const fab = {
      value: bat?.fabrication?.id,
      label: bat?.fabrication?.reference,
    };
    if (dep.label && dep.value) setDepartment([dep as any]);
    if (comm.label && comm.value) setCommercial([comm as any]);
    if (cli.label && cli.value) setClient([cli as any]);
    if (shp.label && cli.value) setShape([shp as any]);
    if (prd.label && prd.value) setProduct([prd as any]);
    if (fab.label && fab.value) setProduct([fab as any]);
    form.setValue("reference", bat.reference);
    form.setValue("details", bat.details);
    return bat;
  }, [currentEntry]);

  useEffect(() => {
    form.setValue("department", department[0]?.value as unknown as number);
  }, [department]);

  useEffect(() => {
    form.setValue("commercial", commercial[0]?.value as unknown as number);
  }, [commercial]);

  useEffect(() => {
    form.setValue("client", client[0]?.value as unknown as number);
  }, [client]);

  const onSubmitUpdate = async (data: z.infer<typeof batSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      // rules,
      product,
      fabrication,
      reference,
      details,
    } = data;
    reference = reference.trim();
    details = details.trim();
    // rules = rules.trim();
    const entry: BatEntry = {
      client_id: client,
      department_id: department,
      commercial_id: commercial,
      product_id: product,
      fabrication_id: fabrication,
      reference,
      details,
    };
    if (
      !entry?.client_id ||
      JSON.stringify(entry?.client_id) ===
        JSON.stringify(batInEntry?.client?.id)
    )
      delete entry?.client_id;
    if (
      !entry.department_id ||
      JSON.stringify(entry?.department_id) ===
        JSON.stringify(batInEntry?.department?.id)
    )
      delete entry.department_id;
    if (
      !entry.commercial_id ||
      JSON.stringify(entry?.commercial_id) ===
        JSON.stringify(batInEntry?.commercial?.id)
    )
      delete entry.commercial_id;
    if (
      !entry.product_id ||
      JSON.stringify(entry?.product_id) === JSON.stringify(batInEntry?.product)
    )
      delete entry.product_id;

    if (
      !entry.fabrication_id ||
      JSON.stringify(entry?.fabrication_id) ===
        JSON.stringify(batInEntry?.fabrication)
    )
      delete entry.fabrication_id;

    if (
      !entry.details ||
      JSON.stringify(entry?.details) === JSON.stringify(batInEntry?.details)
    )
      delete entry?.details;

    // if (
    //   !entry.bat ||
    //   JSON.stringify(entry.bat) ===
    //   JSON.stringify(batInEntry?.bat)
    // ) delete entry.bat;

    // if (
    //   !entry.observation ||
    //   JSON.stringify(entry.observation) ===
    //   JSON.stringify(batInEntry?.observation)
    // ) delete entry.observation;

    // if (
    //   !entry.code ||
    //   JSON.stringify(entry.code) ===
    //   JSON.stringify(batInEntry?.code)
    // ) delete entry.code;

    const { data: updatedShape, success } = await updateBat(
      currentEntry as number,
      entry
    );
    if (success) {
      updatedShape.department = departments.find(
        (dep) => dep.id === department && dep
      );
      updatedShape.commercial = users?.find((use) => use.id === commercial);
      updatedShape.client = clients?.find((cli) => cli.id === client);
      dispatchBats((tmp) => {
        let tmpDatas;
        let tmpData;
        if (tmp) {
          tmpData = tmp.find((t) => t.id === updatedShape.id);
          tmpDatas = tmp.filter((t) => t.id !== updatedShape.id);
          return [{ ...updatedShape, logs: tmpData?.logs }, ...tmpDatas];
        }
      });
      setOpenEditionModal(false);
      showToast({
        type: "success",
        message: "Modifier avec succès",
        position: "top-center",
      });
    } else {
      //console.log("error");
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    reset();
    setLoading(false);
  };
  const [openAssignToUserModal, setOpenAssignToUserModal] =
    useState<boolean>(false);
  const [openLogsModal, setOpenLogsModal] = useState<boolean>(false);
  const handleDeleteBat = async (id: number) => {
    // const { success } = await deleteBat(id);
    // if (!success) return;
    alert("ooo");
    dispatchBats((bats: BatInterface[] | undefined) => {
      return bats?.filter((bat: BatInterface) => bat.id !== id && bat);
    });
    setDelationModal(false);
  };
  const [openStandByModal, setOpenStandByModal] = useState<boolean>(false);
  const [openObservationModal, setOpenObservationModal] =
    useState<boolean>(false);
  const [openDetailsModal, setOpenDetailsModal] = useState<boolean>(false);

  const onSubmitStandBy = async (data: z.infer<typeof batStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    const status_id = batInEntry?.status_id !== 2 ? 2 : 1;
    const { data: standbyedBat, success } = await standbyBat(
      currentEntry as number,
      {
        type: "STANDBY",
        reason,
        status_id,
      }
    );
    if (success) {
      standbyedBat.status_id = status_id;
      dispatchBats((tmp: any) => {
        let tmpDatas;
        let tmpData;
        if (tmp) {
          tmpData = tmp.find((t: any) => t.id === standbyedBat.id);
          tmpDatas = tmp.filter((t: any) => t.id !== standbyedBat.id);
          return [{ ...tmpData, status_id }, ...tmpDatas];
        }
      });
      standByform.setValue("reason", "");
      setOpenStandByModal(false);
      showToast({
        type: "success",
        message: `${status_id === 2 ? "Mis" : "Enlevé"} en standby avec succès`,
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoading(false);
    reset();
  };
  const onSubmitOservation = async (
    data: z.infer<typeof batObservationSchema>
  ) => {
    let { observation } = data;
    setLoading(true);
    observation = observation.trim();
    const { data: observationData, success } = await observationBat(
      currentEntry as number,
      {
        type: "OBSERVATION",
        observation,
      }
    );
    if (success) {
      observationForm.setValue("observation", "");
      setOpenObservationModal(false);

      showToast({
        type: "success",
        message: "Observation crée avec succès",
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoading(false);
    reset();
  };
  const onSubmitAssign = async (data: z.infer<typeof batAssignSchema>) => {
    setLoading(true);
    let { user_id } = data;
    const { data: assignBat, success } = await assignToAnUserBat(
      currentEntry as number,
      {
        type: "ASSIGNATION",
        assignated_user: user_id,
      }
    );
    if (success) {
      // //console.log('assignShape', assignShape);
      // tmp => {
      //   return tmp?.map((bat) => {
      //     return ({ ...bat, logs: [] })
      //     // bat.id === assignShape.id ? ({
      //     //   ...bat,
      //     //   logs: [
      //     //     {
      //     //       "id": bat.logs[bat.logs.length - 1].id + 1,
      //     //       "shape_id": bat.id,
      //     //       "title": "Assigné à une personne",
      //     //       "description": null,
      //     //       "user_treating_id": user?.id,
      //     //       "type": "ASSIGNATION",
      //     //       "created_at": new Date(),
      //     //       "updated_at": new Date(),
      //     //       "user_assignated_id": user_id,
      //     //       "bat_id": null,
      //     //       "folder_id": null
      //     //     },
      //     //     ...bat.logs]
      //     // }) : bat
      //   })
      // }
      // dispatchBats([])
      assignForm.setValue("user_id", 0);
      setOpenAssignToUserModal(false);
      showToast({
        type: "success",
        message: "Assigné avec succès",
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoading(false);
    reset();
  };

  useEffect(() => {
    assignForm.setValue("user_id", assignUser[0]?.value as unknown as number);
  }, [assignUser]);

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          disabled={!bats}
          type="button"
          onClick={() => {
            setCreationModal((tmp) => !tmp);
            reset();
          }}
          className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
        >
          Créer
          <EditIcon color="#E65F2B" />
        </button>
      </div>
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
        <div className="w-full bg-white/80 rounded-t-xl h-[60px] px-[20px] flex items-center justify-start border-b">
          {allBats ? (
            <Filter
              title={"Filtrer par le statut"}
              row={"Status"}
              index={"status_id"}
              list={status}
              filterDatas={allBats ? allBats : []}
              dataHandler={setCurrentDatas}
              filterHandler={setBats}
              type={"status"}
            />
          ) : null}
        </div>
        <div className="relative w-full overflow-x-auto  bg-white">
          {!allBats ? (
            <TableSkeleton head={tableHead} />
          ) : currentDatas.length > 0 ? (
            <table className={`transition-all w-full relative`}>
              <thead className="bg-white/50">
                <tr className="border-b">
                  {tableHead?.map((head, index) => (
                    <th
                      key={index}
                      className={`w-fit ${
                        index === 0 ? "w-0" : "min-w-[150px]"
                      } text-[13px] py-[10px] font-medium  ${
                        index > 0 && index < tableHead.length
                      }  text-[#000000]`}
                    >
                      <div
                        className={`h-full font-poppins relative flex items-center text-start px-[20px] ${
                          head === "Options" ? " justify-end" : " justify-start"
                        }`}
                      >
                        {head}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/80">
                {bats?.map((row, index) => {
                  const statut = status.find((st) => st.id === row?.status_id);
                  return (
                    <tr key={index} className={`border-b`}>
                      <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]">
                        <div
                          className={`flex w-fit justify-center py-[4px] px-[10px] font-medium rounded-lg ${
                            row?.status_id === 2
                              ? "bg-orange-100 text-orange-600"
                              : row?.status_id === 3
                              ? "bg-danger-200"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {statut?.name}
                        </div>
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.client?.name}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.reference}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.department?.name}
                      </td>
                      {/* <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.fabrication}
                      </td> */}
                      {/* <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.format}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.color}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.support}
                      </td> */}
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.commercial.name}
                      </td>
                      {/* <td className="text-[#636363] truncate w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.details}
                      </td> */}
                      {/* <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.bat}
                      </td> */}
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
                      <td className="text-[#636363] w-auto px-[20px] text-start font-poppins">
                        <div className="w-full h-full flex items-center justify-end">
                          <div ref={box}>
                            <MenuDropdown
                              dropdownOrigin="bottom-right"
                              otherStyles={"w-auto"}
                              buttonContent={
                                <div>
                                  <div
                                    onClick={() => {
                                      handleClick();
                                      setCurrentEntry(row.id);
                                    }}
                                    className={`h-[44px] flex items-center justify-center`}
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
                                    onClick={() => setOpenEditionModal(true)}
                                    className="flex items-center justify-start w-full gap-[8px] py-[8px] px-[10px] rounded-t-[12px] cursor-pointer"
                                  >
                                    {/* <UpdateIcon color={""} /> */}
                                    <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                                      Modifier les entrées
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDetailsModal(true);
                                    }}
                                    className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                  >
                                    <span className="text-[14px] text-[#000] font-poppins text-grayscale-900 font-medium leading-[20px] ">
                                      Voir les détails
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenAssignToUserModal(true);
                                    }}
                                    className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                  >
                                    {/* <DetailsIcon color={""} /> */}
                                    <span className="text-[14px] text-[#000] font-poppins text-grayscale-900 font-medium leading-[20px]">
                                      Assigner à un utilisateur
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenLogsModal(true);
                                    }}
                                    className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                  >
                                    {/* <LogIcon color={""} /> */}
                                    <span className="text-[14px] text-[#000] text-grayscale-900 font-medium font-poppins leading-[20px]">
                                      Voir les logs
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenStandByModal(true);
                                    }}
                                    className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                  >
                                    {/* <DeleteShapeIcon color={""} /> */}
                                    <span className="text-[14px] text-[#000] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                      {"Standby"}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenObservationModal(true);
                                    }}
                                    className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                  >
                                    {/* <DeleteShapeIcon color={""} /> */}
                                    <span className="text-[14px] text-[#000] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                      Faire une observation
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDelationModal(true);
                                    }}
                                    className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                  >
                                    {/* <DeleteShapeIcon color={""} /> */}
                                    <span className="text-[14px] text-red-500 text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                      Supprimer la forme
                                    </span>
                                  </button>
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
          ) : (
            <div className="w-full bg-white/80 flex justify-center  items-center px-[20px] rounded-b-xl h-[60px]">
              Aucune donnée
            </div>
          )}
        </div>
        {currentDatas.length > 0 ? (
          <Pagination
            datas={currentDatas ? currentDatas : []}
            listHandler={setBats}
          />
        ) : null}
      </motion.div>

      <BaseModal open={openCreationModal} classname={""}>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-[calc(150vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[20px] font-medium font-poppins text-[#060606]">
                Nouvelle BAT
              </span>
              <button
                type="button"
                onClick={() => setCreationModal(false)}
                className={`w-[30px] h-[30px] flex items-center justify-center border rounded-lg bg-white transition-all`}
              >
                <span className={``}>
                  <CloseIcon />
                </span>
              </button>
            </div>
            <div className="flex flex-col justify-start w-full h-auto relative py-[10px] px-[20px]">
              <div className="w-full grid gap-[8px] grid-cols-3">
                <ComboboxMultiSelect
                  label={"Département"}
                  placeholder="Selectionnez un département"
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
                  id={`departement`}
                  options={departments
                    ?.filter((dep) => [1, 2].includes(dep.id))
                    ?.map((department: Department) => ({
                      value: department.id as unknown as string,
                      label: department.name,
                    }))}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={department}
                  setSelectedUniqElementInDropdown={setDepartment}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Client"}
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
                  id={`client`}
                  options={
                    clients?.map((client: Client) => ({
                      value: client.id as unknown as string,
                      label: client.name,
                    })) as any
                  }
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={client}
                  setSelectedUniqElementInDropdown={setClient}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Commercial"}
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
                  id={`commercial`}
                  options={
                    users?.map((commercial: User) => ({
                      value: commercial.id as unknown as string,
                      label: commercial.name,
                    })) as any
                  }
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={commercial}
                  setSelectedUniqElementInDropdown={setCommercial}
                  borderColor="border-grayscale-200"
                />

                <ComboboxMultiSelect
                  label={"Produit"}
                  placeholder="Selectionnez un produit"
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
                  id={`produit`}
                  options={[]}
                  // options={users?.map((commercial: User) => ({
                  //   value: commercial.id as unknown as string,
                  //   label: commercial.name,
                  // })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={product}
                  setSelectedUniqElementInDropdown={setProduct}
                  borderColor="border-grayscale-200"
                />

                <ComboboxMultiSelect
                  label={"Fabrication"}
                  placeholder="Selectionnez une fabrication"
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
                  id={`fabrication`}
                  options={[]}
                  // options={users?.map((commercial: User) => ({
                  //   value: commercial.id as unknown as string,
                  //   label: commercial.name,
                  // })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={fabrication}
                  setSelectedUniqElementInDropdown={setFabrication}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Forme"}
                  placeholder="Selectionnez une forme"
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
                  id={`shape`}
                  options={[]}
                  // options={users?.map((commercial: User) => ({
                  //   value: commercial.id as unknown as string,
                  //   label: commercial.name,
                  // })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={shape}
                  setSelectedUniqElementInDropdown={setShape}
                  borderColor="border-grayscale-200"
                />
                {/* <BaseInput
                  label="Support"
                  id="support"
                  placeholder="Support"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("support")}
                /> */}
                <BaseTextArea
                  field="text-area"
                  label="Details"
                  id="details"
                  placeholder="Details"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("details")}
                />
                <BaseInput
                  label="Reference"
                  id="reference"
                  placeholder="Reference"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("reference")}
                />
                {/* <BaseInput
                  label="Fabrication"
                  id="fabrication"
                  placeholder="Fabrication"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("fabrication")}
                /> */}
                {/* <BaseInput
                  label="Dimensions plaque"
                  id="file_number"
                  placeholder="Dimensions plaque"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("file_number")}
                />
                <BaseInput
                  label="Type Papier"
                  id="format"
                  placeholder="Type Papier"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("format")}
                />
                <BaseInput
                  label="N° des poses"
                  id="color"
                  placeholder="N° des poses"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("color")}
                /> */}
              </div>
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center px-[20px] py-[10px] h-[80px] border-t">
              <button
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
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
          </div>
        </Form>
      </BaseModal>
      {/* EDITION MODAL */}
      <BaseModal open={openEditionModal} classname={""}>
        <Form form={form} onSubmit={onSubmitUpdate}>
          <div className="w-[calc(150vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[20px] font-medium font-poppins text-[#060606]">
                Modification
              </span>
              <button
                type="button"
                onClick={() => setOpenEditionModal(false)}
                className={`w-[30px] h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <span className={``}>
                  <CloseIcon />
                </span>
              </button>
            </div>
            <div className="flex flex-col justify-start w-full h-auto relative py-[10px] px-[20px]">
              <div className="w-full grid gap-[8px] grid-cols-3">
                <ComboboxMultiSelect
                  label={"Département"}
                  placeholder="Selectionnez un département"
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
                  id={`departement`}
                  options={departments
                    ?.filter((dep) => [1, 2].includes(dep.id))
                    ?.map((department: Department) => ({
                      value: department.id as unknown as string,
                      label: department.name,
                    }))}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={department}
                  setSelectedUniqElementInDropdown={setDepartment}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Client"}
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
                  id={`client`}
                  options={
                    clients?.map((client: Client) => ({
                      value: client.id as unknown as string,
                      label: client.name,
                    })) as any
                  }
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={client}
                  setSelectedUniqElementInDropdown={setClient}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Commercial"}
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
                  id={`commercial`}
                  options={
                    users?.map((commercial: User) => ({
                      value: commercial.id as unknown as string,
                      label: commercial.name,
                    })) as any
                  }
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={commercial}
                  setSelectedUniqElementInDropdown={setCommercial}
                  borderColor="border-grayscale-200"
                />

                <ComboboxMultiSelect
                  label={"Produit"}
                  placeholder="Selectionnez un produit"
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
                  id={`produit`}
                  options={[]}
                  // options={users?.map((commercial: User) => ({
                  //   value: commercial.id as unknown as string,
                  //   label: commercial.name,
                  // })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={product}
                  setSelectedUniqElementInDropdown={setProduct}
                  borderColor="border-grayscale-200"
                />

                <ComboboxMultiSelect
                  label={"Fabrication"}
                  placeholder="Selectionnez une fabrication"
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
                  id={`fabrication`}
                  options={[]}
                  // options={users?.map((commercial: User) => ({
                  //   value: commercial.id as unknown as string,
                  //   label: commercial.name,
                  // })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={fabrication}
                  setSelectedUniqElementInDropdown={setFabrication}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Forme"}
                  placeholder="Selectionnez une forme"
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
                  id={`shape`}
                  options={[]}
                  // options={users?.map((commercial: User) => ({
                  //   value: commercial.id as unknown as string,
                  //   label: commercial.name,
                  // })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={shape}
                  setSelectedUniqElementInDropdown={setShape}
                  borderColor="border-grayscale-200"
                />
                {/* <BaseInput
                  label="Support"
                  id="support"
                  placeholder="Support"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("support")}
                /> */}
                <BaseTextArea
                  field="text-area"
                  label="Details"
                  id="details"
                  placeholder="Details"
                  defaultValue={batInEntry?.details}
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("details")}
                />
                <BaseInput
                  label="Reference"
                  id="reference"
                  placeholder="Reference"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("reference")}
                />
                {/* <BaseInput
                  label="Fabrication"
                  id="fabrication"
                  placeholder="Fabrication"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("fabrication")}
                /> */}
                {/* <BaseInput
                  label="Dimensions plaque"
                  id="file_number"
                  placeholder="Dimensions plaque"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("file_number")}
                />
                <BaseInput
                  label="Type Papier"
                  id="format"
                  placeholder="Type Papier"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("format")}
                />
                <BaseInput
                  label="N° des poses"
                  id="color"
                  placeholder="N° des poses"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("color")}
                /> */}
              </div>
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center px-[20px] py-[10px] h-[80px] border-t">
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                {loading ? <Spinner color={"#fff"} size={20} /> : "Modifier"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>
      <BaseModal open={openDetailsModal} classname={""}>
        <div>
          <div className="w-[calc(150vh)] overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[20px] font-medium font-poppins text-[#060606]">
                Détails
              </span>
              <button
                type="button"
                onClick={() => setOpenDetailsModal(false)}
                className={`w-[30px] h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <span className={``}>
                  <CloseIcon />
                </span>
              </button>
            </div>
            <div className="flex flex-col justify-start w-full h-auto relative py-[10px] px-[20px]">
              <div className="w-full grid gap-[8px] grid-cols-3">
                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Département
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {department?.[0]?.label}
                  </div>
                </div>
                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Client
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {client?.[0]?.label}
                  </div>
                </div>
                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Commercial
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {commercial?.[0]?.label}
                  </div>
                </div>
                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Produit
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {product?.[0]?.label}
                  </div>
                </div>

                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Fabrication
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {fabrication?.[0]?.label}
                  </div>
                </div>

                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Forme
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {shape?.[0]?.label}
                  </div>
                </div>

                {/* <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Forme
                  </span>
                  <div className="border rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {
                      shape?.[0]?.label
                    }
                  </div>
                </div> */}

                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Reference
                  </span>
                  <div className="border rounded-[12px] text-[#636363] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {batInEntry?.reference}
                  </div>
                </div>

                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Date de création
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {formatTime(
                      new Date(batInEntry?.["created_at"] as any).getTime(),
                      "d:mo:y",
                      "short"
                    )}
                    {" à "}
                    {formatTime(
                      new Date(batInEntry?.["created_at"] as any).getTime(),
                      "h:m",
                      "short"
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Date de modification
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {formatTime(
                      new Date(batInEntry?.["updated_at"] as any).getTime(),
                      "d:mo:y",
                      "short"
                    )}
                    {" à "}
                    {formatTime(
                      new Date(batInEntry?.["updated_at"] as any).getTime(),
                      "h:m",
                      "short"
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Détails
                  </span>
                  <div className="border p-[10px] text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {batInEntry?.details}
                  </div>
                </div>

                <div>
                  <span className="font-poppins font-medium text-[14px]">
                    Assigner à
                  </span>
                  <div className="border text-[#636363] rounded-[12px] font-medium text-[14px] min-h-[48px] flex items-center justify-center">
                    {batInEntry?.assignated_user?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
      {/* DELATION MODAL */}
      <BaseModal open={openDelationModal} classname={""}>
        <div className="w-[calc(80vh)] h-auto overflow-auto">
          <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
            <div className="flex flex-col">
              <span className="text-[20px] font-poppins text-[#060606]">
                Confirmer la suppression
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                Vous êtes sur point de supprimer <br /> une bat, cette action
                est definitive !
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
          <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
            <button
              type="button"
              onClick={() => {
                handleDeleteBat(currentEntry as unknown as number);
              }}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
            >
              {loading ? <Spinner color={"#fff"} size={20} /> : "Supprimer"}
            </button>
          </div>
        </div>
      </BaseModal>
      {/* LOGS MODAL */}
      <BaseModal open={openLogsModal} classname={""}>
        <div className="w-[calc(150vh)] h-auto ">
          <div className="w-full bg-white/80 sticky top-0 right-0 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
            <div className="flex flex-col">
              <span className="text-[20px] font-poppins text-[#060606]">
                Historique
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                {
                  "Vous consultez ici l'historique des actions menées sur cette forme."
                }
              </span>
            </div>
            <button
              disabled={loading}
              type="button"
              onClick={() => setOpenLogsModal(false)}
              className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
            >
              <CloseIcon />
            </button>
          </div>
          {/* "Utilisateur assigné" */}
          <div className="overflow-auto max-h-[80vh]">
            {!batInEntry?.logs ? (
              <div className="w-full flex justify-center items-center p-[20px]">
                <span>Aucun log</span>
              </div>
            ) : (
              <table className="w-full relative">
                <thead className="bg-white/50">
                  <tr className="">
                    {[
                      "Titre",
                      "Description",
                      "Type",
                      "Date de création",
                      "Utilisateur",
                    ]?.map((head, index) => (
                      <th
                        key={index}
                        className={`  ${
                          head === "options" ? "w-auto" : "min-w-[150px]"
                        } text-[13px] py-[10px] font-medium  ${
                          index > 0 && index < tableHead.length
                        }  text-[#636363]`}
                      >
                        <div className="h-full font-poppins relative flex items-center text-start py-[10px] px-[20px] justify-start">
                          {head}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>{" "}
                <tbody className="bg-white/80">
                  {batInEntry?.logs?.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="text-[#636363] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.title}
                      </td>
                      <td className="text-[#636363] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.description}
                      </td>
                      <td className="text-[#636363] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.type}
                      </td>
                      <td className="text-[#636363] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
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
                      <td className="text-[#636363] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                        {
                          users?.find(
                            (user: User) => user.id === row.user_treating_id
                          )?.name
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </BaseModal>

      {/* standBy MODAL */}
      <BaseModal open={openStandByModal} classname={""}>
        <Form form={standByform} onSubmit={onSubmitStandBy}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  {batInEntry?.status_id !== 2
                    ? "Mettre en standby"
                    : "Enlever en standby"}
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  {`Vous êtes sur point ${
                    batInEntry?.status_id !== 2 ? " de mettre" : "d'enlever "
                  } une forme en standby`}
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenStandByModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-[20px]">
              <BaseInput
                label="Raison"
                id="reason"
                placeholder={` Dites pourquoi vous ${
                  batInEntry?.status_id !== 2
                    ? "mettez en standBy"
                    : "enlevez en standby"
                } `}
                // leftIcon={<RulerIcon color={""} size={20} />}
                type="text"
                {...standByform.register("reason")}
              />
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              {/* <button
                type="button"
                onClick={() => setOpenStandByModal((tmp) => !tmp)}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                Annuler
              </button> */}
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
              >
                {loading ? (
                  <Spinner color={"#fff"} size={20} />
                ) : batInEntry?.status_id !== 2 ? (
                  "Mettre en standBy"
                ) : (
                  "Enlever en standby"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      {/* assign to user MODAL */}
      <BaseModal open={openAssignToUserModal} classname={""}>
        <Form form={assignForm} onSubmit={onSubmitAssign}>
          <div className="w-[calc(80vh)] h-[80vh]">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Assigner à un utilisateur
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  Vous allez attribuer cette forme à un utilisateur
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenAssignToUserModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-[20px]">
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
                id={`users`}
                options={
                  users?.map((user: User) => ({
                    value: user.id as unknown as string,
                    label: user.name,
                  })) as any
                }
                error={undefined}
                isUniq={true}
                selectedElementInDropdown={assignUser}
                setSelectedUniqElementInDropdown={setAssignUser}
                borderColor="border-grayscale-200"
              />
            </div>
          </div>
          <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
            <button
              type="submit"
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border bg-[#060606] hover:bg-[#060606]/90 rounded-xl `}
            >
              {loading ? <Spinner color={"#fff"} size={20} /> : `Attribuer`}
            </button>
          </div>
        </Form>
      </BaseModal>

      {/* observation MODAL */}
      <BaseModal open={openObservationModal} classname={""}>
        <Form form={observationForm} onSubmit={onSubmitOservation}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Observation
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  Faites une observation
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenObservationModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-[20px]">
              <BaseTextArea
                label="Observation"
                id="observation"
                placeholder="observation"
                // leftIcon={<FolderIcon size={18} color={""} />}
                type="text"
                field="text-area"
                {...observationForm.register("observation")}
              />
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              {/* <button
                type="button"
                onClick={() => setOpenObservationModal((tmp) => !tmp)}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                Annuler
              </button> */}
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
              >
                {loading ? (
                  <Spinner color={"#fff"} size={20} />
                ) : (
                  "Enregistrer cette observation"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      {/* lock MODAL */}
      <BaseModal open={openObservationModal} classname={""}>
        <Form form={observationForm} onSubmit={onSubmitOservation}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Observation
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  Faites une observation
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenObservationModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-[20px]">
              <BaseTextArea
                label="Observation"
                id="observation"
                placeholder="observation"
                // leftIcon={<FolderIcon size={18} color={""} />}
                type="text"
                field="text-area"
                {...observationForm.register("observation")}
              />
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              {/* <button
                type="button"
                onClick={() => setOpenObservationModal((tmp) => !tmp)}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                Annuler
              </button> */}
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
              >
                {loading ? (
                  <Spinner color={"#fff"} size={20} />
                ) : (
                  "Enregistrer cette observation"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>
    </div>
  );
};
