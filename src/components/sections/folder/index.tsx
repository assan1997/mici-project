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
  LogIcon
} from "@/components/svg";
import { BaseInput, BaseTextArea } from "@/components/ui/forms/BaseInput";
import { array, string, z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import React from "react";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import {
  Client,
  Department,
  useData,
  User,
} from "@/contexts/data.context";
import { FolderInterface } from "@/contexts/data.context";
import { createOffsetShape } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import { OffsetShapeEntry, updateOffsetShape, standbyOffsetShape, observationOffsetShape, assignToAnUserOffsetShape } from "@/services/shapes";
import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton, ButtonSkeleton } from "@/components/ui/loader/Skeleton";
import { useToast } from "@/contexts/toast.context";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";
import { Filter } from "@/components/ui/filter";
import { createFolder, FolderEntry } from "@/services/folder";

export const Folder: FC<{}> = ({ }) => {
  const {
    users,
    clients,
    departments,
    folders: allFolders,
    user,
    dispatchOffsetShapes,
    status
  } = useData();
  const folderSchema = z.object({
    client: z.number(),
    commercial: z.number(),
    department: z.number(),
    // rules: z.string(),
    folder: z.number(),
    code: z.string(),
    product: z.number(),
    fabrication: z.number(),
    file_number: z.string(),
    format: z.string(),
    color: z.string(),
    support: z.string(),
    bat: z.number(),
    state: z.string(),
    details: z.string(),
  });
  const folderStandBySchema = z.object({
    reason: z.string(),
  });
  const folderObservationSchema = z.object({
    observation: z.string(),
  });
  const folderAssignSchema = z.object({
    user_id: z.number(),
  });
  const form = useForm({ schema: folderSchema });
  const standByform = useForm({ schema: folderStandBySchema });
  const observationForm = useForm({ schema: folderObservationSchema });
  const assignForm = useForm({ schema: folderAssignSchema });
  const tableHead = [
    "Statut",
    "N° Dossier",
    "Client",
    "Etat",
    "Produit",
    "Fabrication",
    "Format",
    "Couleurs",
    "Support",
    "Commercial",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
    "Options",
  ];
  const reset = () => {
    form.setValue("client", 0);
    form.setValue("commercial", 0);
    form.setValue("department", 0);
    form.setValue("code", "");
    form.setValue("product", 0);
    form.setValue("fabrication", 0);
    form.setValue("file_number", "");
    form.setValue("format", "");
    form.setValue("color", "");
    form.setValue("support", "");
    setCurrentEntry(undefined);
    setCommercial([]);
    setDepartment([]);
    setClient([]);
  };
  const { box, handleClick } = useActiveState();
  const [folders, setFolders] = useState<FolderInterface[] | undefined>([]);
  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const onSubmit = async (data: z.infer<typeof folderSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      // rules,
      code,
      product,
      fabrication,
      file_number,
      format,
      color,
      support,
      folder,
      details,
      state
    } = data;
    support = support.trim();
    // rules = rules.trim();
    state = state.trim();

    const { data: createdFolder, success } = await createFolder({
      client_id: client,
      department_id: department,
      commercial_id: commercial,
      product_id: product,
      fabrication_id: fabrication,
      file_number,
      format,
      color,
      support,
      shape_id: folder,
      bat_id: 1,
      details,
      state
    });
    if (success) {
      reset();
      setCreationModal(false);
      createdFolder.department = departments.filter(
        (dep) => dep.id === department && dep
      );
      createdFolder.commercial = users?.find(
        (use) => use.id === commercial
      );
      createdFolder.client = clients?.find((cli) => cli?.id === client);
      dispatchOffsetShapes((tmp) => {
        if (tmp) return [createdFolder, ...tmp]
      });

      showToast({
        type: "success",
        message: "Crée avec succès",
        position: "top-center"
      })
    }
    else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center"
      })
    }
    setLoading(false);
    console.log("createdFolder", createdFolder);
  };
  interface ComboSelect {
    label: string;
    value: string;
  }
  const [commercial, setCommercial] = useState<ComboSelect[]>([]);
  const [assignUser, setAssignUser] = useState<ComboSelect[]>([]);
  const [client, setClient] = useState<ComboSelect[]>([]);
  const [department, setDepartment] = useState<ComboSelect[]>([]);
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentDatas, setCurrentDatas] = useState<any[]>(allFolders ? allFolders : []);

  useEffect(() => {
    setCurrentDatas(allFolders ? allFolders : [])
  }, [allFolders]);

  const { showToast } = useToast();
  const folderInEntry = useMemo(() => {
    const folder: FolderInterface | undefined = folders?.find(
      (folder: FolderInterface) => folder.id === currentEntry
    );
    if (!folder) return;

    const dep = {
      value: folder?.department.id,
      label: folder?.department.name,
    };

    const comm = {
      value: folder?.commercial.id,
      label: folder?.commercial.name,
    };

    const cli = {
      value: folder?.client?.id,
      label: folder?.client?.name,
    };

    if (dep) setDepartment([dep as any]);
    if (comm) setCommercial([comm as any]);
    if (cli) setClient([cli as any]);

    // form.setValue("code", folder.code);
    form.setValue("product", folder.product);
    form.setValue("fabrication", folder.fabrication);
    form.setValue("file_number", folder.file_number);
    form.setValue("format", folder.format);
    form.setValue("color", folder.color);
    form.setValue("support", folder.support);
    form.setValue("state", folder.state);
    form.setValue("bat", folder.bat);
    form.setValue("details", folder.details);

    return folder;
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

  const onSubmitUpdate = async (data: z.infer<typeof folderSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      // rules,
      code,
      product,
      fabrication,
      file_number,
      format,
      color,
      support,
      folder,
      details,
      state
    } = data;
    support = support.trim();
    // rules = rules.trim();
    code = code.trim();
    const entry: FolderEntry = {
      client_id: client,
      department_id: department,
      commercial_id: commercial,
      product_id: product,
      fabrication_id: fabrication,
      file_number,
      format,
      color,
      support,
      shape_id: folder,
      bat_id: 1,
      details,
      state
    };
    if (!entry.client_id || JSON.stringify(entry.client_id) === JSON.stringify(folderInEntry?.client?.id)) delete entry.client_id;
    if (
      !entry.department_id ||
      JSON.stringify(entry.department_id) ===
      JSON.stringify(folderInEntry?.department.id)
    ) delete entry.department_id;

    if (
      !entry.commercial_id ||
      JSON.stringify(entry.commercial_id) ===
      JSON.stringify(folderInEntry?.commercial.id)
    ) delete entry.commercial_id;

    if (
      !entry.product_id ||
      JSON.stringify(entry.product_id) ===
      JSON.stringify(folderInEntry?.product)
    ) delete entry.product_id;

    if (
      !entry.fabrication_id ||
      JSON.stringify(entry.fabrication_id) ===
      JSON.stringify(folderInEntry?.fabrication)
    ) delete entry.fabrication_id;

    if (
      !entry.file_number ||
      JSON.stringify(entry.file_number) ===
      JSON.stringify(folderInEntry?.file_number)
    ) delete entry.file_number;

    if (
      !entry.format ||
      JSON.stringify(entry.format) ===
      JSON.stringify(folderInEntry?.format)
    ) delete entry.format;

    if (
      !entry.color ||
      JSON.stringify(entry.color) ===
      JSON.stringify(folderInEntry?.color)
    ) delete entry.color;

    if (
      !entry.support ||
      JSON.stringify(entry.support) ===
      JSON.stringify(folderInEntry?.support)
    ) delete entry.support;

    if (
      !entry.details ||
      JSON.stringify(entry.details) ===
      JSON.stringify(folderInEntry?.details)
    ) delete entry.details;

    // if (
    //   !entry.folder ||
    //   JSON.stringify(entry.folder) ===
    //   JSON.stringify(folderInEntry?.folder)
    // ) delete entry.folder;

    // if (
    //   !entry.observation ||
    //   JSON.stringify(entry.observation) ===
    //   JSON.stringify(folderInEntry?.observation)
    // ) delete entry.observation;

    // if (
    //   !entry.code ||
    //   JSON.stringify(entry.code) ===
    //   JSON.stringify(folderInEntry?.code)
    // ) delete entry.code;

    const { data: updatedShape, success } = await updateOffsetShape(
      currentEntry as number,
      entry
    );
    if (success) {
      updatedShape.department = departments.find(
        (dep) => dep.id === department && dep
      );
      updatedShape.commercial = users?.find(
        (use) => use.id === commercial
      );
      updatedShape.client = clients?.find((cli) => cli.id === client);
      dispatchOffsetShapes((tmp) => {
        let tmpDatas;
        let tmpData;
        if (tmp) {
          tmpData = tmp.find(t => t.id === updatedShape.id);
          tmpDatas = tmp.filter((t) => t.id !== updatedShape.id);
          return [{ ...updatedShape, logs: tmpData?.logs }, ...tmpDatas]
        }
      });
      setOpenEditionModal(false);
      showToast({
        type: "success",
        message: "Modifier avec succès",
        position: "top-center"
      })
    } else {
      console.log("error");
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center"
      })
    }
    reset()
    setLoading(false)
  };
  const [openAssignToUserModal, setOpenAssignToUserModal] = useState<boolean>(false);
  const [openLogsModal, setOpenLogsModal] = useState<boolean>(false);
  const handleDeleteShape = (id: number) => { };
  const [openStandByModal, setOpenStandByModal] = useState<boolean>(false);
  const [openObservationModal, setOpenObservationModal] = useState<boolean>(false);
  const onSubmitStandBy = async (data: z.infer<typeof folderStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    const status_id = folderInEntry?.status_id !== 2 ? 2 : 1
    const { data: standbyFolder, success } = await standbyOffsetShape(
      currentEntry as number,
      {
        type: "STANDBY",
        reason,
        status_id
      }
    );
    if (success) {
      standbyFolder.status_id = status_id;
      dispatchOffsetShapes((tmp: any) => {
        let tmpDatas;
        let tmpData;
        if (tmp) {
          tmpData = tmp.find((t: any) => t.id === standbyFolder.id);
          tmpDatas = tmp.filter((t: any) => t.id !== standbyFolder.id);
          return [{ ...tmpData, status_id }, ...tmpDatas]
        }
      });
      standByform.setValue('reason', '');
      setOpenStandByModal(false);
      showToast({
        type: "success",
        message: `${status_id === 2 ? "Mis" : "Enlevé"} en standby avec succès`,
        position: "top-center"
      })
    }
    else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center"
      })
    }
    setLoading(false);
    reset();
  }
  const onSubmitOservation = async (data: z.infer<typeof folderObservationSchema>) => {
    let { observation } = data;
    setLoading(true);
    observation = observation.trim();
    const { data: observationData, success } = await observationOffsetShape(currentEntry as number,
      {
        type: "OBSERVATION",
        observation
      })
    if (success) {
      console.log('observationData', observationData);
      observationForm.setValue('observation', '');
      setOpenObservationModal(false);

      showToast({
        type: "success",
        message: "Observation crée avec succès",
        position: "top-center"
      })
    }
    else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center"
      })
    }
    setLoading(false);
    reset();
  }
  const onSubmitAssign = async (data: z.infer<typeof folderAssignSchema>) => {
    setLoading(true);
    let { user_id } = data;
    const { data: assignShape, success } = await assignToAnUserOffsetShape(
      currentEntry as number,
      {
        type: "ASSIGNATION",
        user_id,
      }
    );
    if (success) {
      // console.log('assignShape', assignShape);
      // tmp => {
      //   return tmp?.map((folder) => {
      //     return ({ ...folder, logs: [] })
      //     // folder.id === assignShape.id ? ({
      //     //   ...folder,
      //     //   logs: [
      //     //     {
      //     //       "id": folder.logs[folder.logs.length - 1].id + 1,
      //     //       "shape_id": folder.id,
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
      //     //     ...folder.logs]
      //     // }) : folder
      //   })
      // }
      // dispatchOffsetShapes([])
      assignForm.setValue('user_id', 0);
      setOpenAssignToUserModal(false);
      showToast({
        type: "success",
        message: "Assigné avec succès",
        position: "top-center"
      })

    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center"
      })
    }
    setLoading(false);
    reset();
  }
  useEffect(() => {
    assignForm.setValue("user_id", assignUser[0]?.value as unknown as number);
  }, [assignUser]);

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          disabled={!folders}
          type="button"
          onClick={() => {
            setCreationModal((tmp) => !tmp);
            reset()
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
          {allFolders ? <Filter
            title={"Filtrer par le statut"}
            row={"Status"}
            index={"status_id"}
            list={status}
            filterDatas={allFolders ? allFolders : []}
            dataHandler={setCurrentDatas}
            filterHandler={setFolders} /> : null}

        </div>
        <div className="relative w-full overflow-x-auto scrollbar-hide bg-white">
          {!allFolders ?
            <TableSkeleton head={tableHead} /> : currentDatas.length > 0 ? <table className="w-full relative">
              <thead className="bg-white/50">
                <tr className="border-b">
                  {tableHead.map((head, index) => (
                    <th
                      key={index}
                      className={`w-fit ${index === 0 ? "w-0" : "min-w-[150px]"
                        } text-[13px] py-[10px] font-medium  ${index > 0 && index < tableHead.length
                        }  text-[#000000]`}
                    >
                      <div className={`h-full font-poppins relative flex items-center text-start px-[20px] ${head === "Options" ? " justify-end" : " justify-start"}`}>
                        {head}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/80">
                {
                  folders?.map((row, index) => {
                    const statut = status.find((st) => st.id === row?.status_id)
                    return <tr key={index} className={`border-b`}>
                      <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]">
                        <div className={`flex w-fit justify-center py-[4px] px-[10px] font-medium rounded-lg ${row?.status_id === 2 ? "bg-orange-100 text-orange-600" : row?.status_id === 3 ? "bg-danger-200" : "bg-gray-100 text-gray-900"}`}>
                          {statut?.name}
                        </div>
                      </td>
                      <td className="text-[#636363] relative min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.file_number}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.client?.name}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.state}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row?.product}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.fabrication}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.format}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.color}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.support}
                      </td>
                      <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.commercial.name}
                      </td>
                      {/* <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {row.details}
                      </td> */}
                      {/* <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                        {""}
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
                                    onClick={() => { }}
                                    className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                  >
                                    {/* <DetailsIcon color={""} /> */}
                                    <span className="text-[14px] text-[#000] font-poppins text-grayscale-900 font-medium leading-[20px] ">
                                      Voir les détails
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenAssignToUserModal(true)
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
                  })
                }
              </tbody>
            </table> : <div className="w-full bg-white/80 flex justify-center items-center px-[20px] rounded-b-xl h-[60px]">
              Aucune donnée
            </div>
          }
        </div>
        {currentDatas.length > 0 ? <Pagination datas={currentDatas ? currentDatas : []} listHandler={setFolders} /> : null}
      </motion.div>

      <BaseModal open={openCreationModal} classname={""}>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-[calc(150vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[18px] font-medium font-poppins text-[#060606]">
                Nouveau Dossier
              </span>
              <button
                type="button"
                onClick={() => setCreationModal(false)}
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
                  options={departments?.map((department: Department) => ({
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
                  options={clients?.map((client: Client) => ({
                    value: client.id as unknown as string,
                    label: client.name,
                  })) as any}
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
                  options={users?.map((commercial: User) => ({
                    value: commercial.id as unknown as string,
                    label: commercial.name,
                  })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={commercial}
                  setSelectedUniqElementInDropdown={setCommercial}
                  borderColor="border-grayscale-200"
                />
                <BaseInput
                  label="Support"
                  id="support"
                  placeholder="Support"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("support")}
                />
                <BaseInput
                  label="Code"
                  id="code"
                  placeholder="Code"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("code")}
                />
                <BaseInput
                  label="Produit"
                  id="product"
                  placeholder="Produit"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("product")}
                />
                <BaseInput
                  label="Fabrication"
                  id="fabrication"
                  placeholder="Fabrication"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("fabrication")}
                />
                <BaseInput
                  label="Numero du fichier"
                  id="file_number"
                  placeholder="Numero du fichier"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("file_number")}
                />
                <BaseInput
                  label="Format"
                  id="format"
                  placeholder="Format"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("format")}
                />
                <BaseInput
                  label="Couleur"
                  id="color"
                  placeholder="Couleur"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("color")}
                />

                {/* <BaseInput
                  label="1/3"
                  id="folder"
                  placeholder="1/3"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("folder")}
                /> */}
              </div>
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center px-[20px] py-[10px] h-[80px] border-t">
              <button
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                {loading ? <>
                  <Spinner color={"#fff"} size={20} />  {"En cours"}</> : "Enregistrer"}
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
              <span className="text-[18px] font-medium font-poppins text-[#060606]">
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
                  options={departments?.map((department: Department) => ({
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
                  options={clients?.map((client: Client) => ({
                    value: client.id as unknown as string,
                    label: client.name,
                  })) as any}
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
                  options={users?.map((commercial: User) => ({
                    value: commercial.id as unknown as string,
                    label: commercial.name,
                  })) as any}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={commercial}
                  setSelectedUniqElementInDropdown={setCommercial}
                  borderColor="border-grayscale-200"
                />
                <BaseInput
                  label="Reference"
                  id="support"
                  placeholder="Reference"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("support")}
                />
                <BaseInput
                  label="Code"
                  id="code"
                  placeholder="Code"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("code")}
                />
                <BaseInput
                  label="Dimension Lx Lh"
                  id="product"
                  placeholder="Dimension Lx Lh"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("product")}
                />
                <BaseInput
                  label="Dimensions Carrée"
                  id="fabrication"
                  placeholder="Dimensions Carrée"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("fabrication")}
                />
                <BaseInput
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
                />
                <BaseInput
                  label="1/3"
                  id="folder"
                  placeholder="1/3"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("folder")}
                />
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
      {/* DELATION MODAL */}
      <BaseModal open={openDelationModal} classname={""}>
        <div className="w-[calc(80vh)] h-auto overflow-auto">
          <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
            <div className="flex flex-col">
              <span className="text-[18px] font-poppins text-[#060606]">
                Confirmer la suppression
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                Vous êtes sur point de supprimer <br /> une forme, cette action
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
              onClick={() => setDelationModal((tmp) => !tmp)}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                handleDeleteShape(currentEntry as unknown as number);
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
              <span className="text-[18px] font-poppins text-[#060606]">
                Historique
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                {"Vous consultez ici l'historique des actions menées sur cette forme."}
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
            {!folderInEntry?.logs ? <div className="w-full flex justify-center items-center p-[20px]">
              <span>Aucun log</span>
            </div> : <table className="w-full relative">
              <thead className="bg-white/50">
                <tr className="">
                  {["Titre", "Description", "Type", "Date de création", "Utilisateur"].map((head, index) => (
                    <th
                      key={index}
                      className={`  ${head === "options" ? "w-auto" : "min-w-[150px]"
                        } text-[13px] py-[10px] font-medium  ${index > 0 && index < tableHead.length
                        }  text-[#636363]`}
                    >
                      <div className="h-full font-poppins relative flex items-center text-start py-[10px] px-[20px] justify-start">
                        {head}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead> <tbody className="bg-white/80">
                {folderInEntry?.logs?.map((row, index) => (
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
                      {users?.find((user: User) => user.id === row.user_treating_id)?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}

          </div>
        </div>
      </BaseModal>

      {/* standBy MODAL */}
      <BaseModal open={openStandByModal} classname={""}>
        <Form form={standByform} onSubmit={onSubmitStandBy}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[18px] font-poppins text-[#060606]">
                  {folderInEntry?.status_id !== 2 ? "Mettre en standby" : "Enlever en standby"}
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  {`Vous êtes sur point ${folderInEntry?.status_id !== 2 ? " de mettre" : "d'enlever "} une forme en standby`}
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
                placeholder={` Dites pourquoi vous ${folderInEntry?.status_id !== 2 ? "mettez en standBy" : "enlevez en standby"} `}
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
                {loading ? <Spinner color={"#fff"} size={20} /> : folderInEntry?.status_id !== 2 ? "Mettre en standBy" : "Enlever en standby"}
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
                <span className="text-[18px] font-poppins text-[#060606]">
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
                options={users?.map((user: User) => ({
                  value: user.id as unknown as string,
                  label: user.name,
                })) as any}
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
                <span className="text-[18px] font-poppins text-[#060606]">
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
                {loading ? <Spinner color={"#fff"} size={20} /> : "Enregistrer cette observation"}
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
                <span className="text-[18px] font-poppins text-[#060606]">
                  Bloquer
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
                {loading ? <Spinner color={"#fff"} size={20} /> : "Enregistrer cette observation"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>
    </div>
  );
};
