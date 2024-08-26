"use client";
import { FC, useMemo, useState, useEffect } from "react";
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
import BaseInput from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import React from "react";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import {
  Client,
  Department,
  OffsetShape,
  useData,
  User,
} from "@/contexts/data.context";
import { createOffsetShape } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import { OffsetShapeEntry, updateOffsetShape, standbyShape, observationShape, assignToAnUserShape } from "@/services/shapes";
import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton, ButtonSkeleton } from "@/components/ui/loader/Skeleton";
import { useToast } from "@/contexts/toast.context";
import { motion } from "framer-motion";

export const ImprimerieOffset: FC<{}> = ({ }) => {
  const {
    users,
    clients,
    departments,
    offsetShapes,
    user,
    dispatchOffsetShapes,
  } = useData();
  const shapeSchema = z.object({
    client: z.number(),
    commercial: z.number(),
    department: z.number(),
    // rules: z.string(),
    part: z.string(),
    code: z.string(),
    dim_lx_lh: z.string(),
    dim_square: z.string(),
    dim_plate: z.string(),
    paper_type: z.string(),
    pose_number: z.string(),
    reference: z.string(),
  });
  const shapeStandBySchema = z.object({
    reason: z.string(),
  });
  const shapeObservationSchema = z.object({
    observation: z.string(),
  });
  const shapeAssignSchema = z.object({
    user_id: z.number(),
  });
  const form = useForm({ schema: shapeSchema });
  const standByform = useForm({ schema: shapeStandBySchema });
  const observationForm = useForm({ schema: shapeObservationSchema });
  const assignForm = useForm({ schema: shapeAssignSchema });
  const tableHead = [
    // "",
    "Code",
    "Client",
    "Reference",
    "Commercial",
    "Departement",
    "Dimension LxLxH",
    "Dimensions Carré",
    "Dimensions Plaque",
    "Type Papier",
    "N° des poses",
    "1/3",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
    "Options",
  ];
  const reset = () => {
    form.setValue("client", 0);
    form.setValue("commercial", 0);
    form.setValue("department", 0);
    form.setValue("code", "");
    form.setValue("dim_lx_lh", "");
    form.setValue("dim_square", "");
    form.setValue("dim_plate", "");
    form.setValue("paper_type", "");
    form.setValue("pose_number", "");
    form.setValue("reference", "");
    setCurrentEntry(undefined);
    setCommercial([]);
    setDepartment([]);
    setClient([]);
  };
  const { box, handleClick } = useActiveState();
  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const onSubmit = async (data: z.infer<typeof shapeSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      // rules,
      code,
      dim_lx_lh,
      dim_square,
      dim_plate,
      paper_type,
      pose_number,
      reference,
      part,
    } = data;
    reference = reference.trim();
    // rules = rules.trim();
    part = part.trim();
    code = code.trim();

    const { data: createdOffsetShape, success } = await createOffsetShape({
      client_id: client,
      department_id: department,
      commercial_id: commercial,
      code,
      dim_lx_lh,
      dim_square,
      dim_plate,
      paper_type,
      pose_number,
      reference,
      part,
      user_id: user?.id as unknown as number,
    });
    if (success) {
      reset();
      setCreationModal(false);
      createdOffsetShape.department = departments.filter(
        (dep) => dep.id === department && dep
      );
      createdOffsetShape.commercial = users?.find(
        (use) => use.id === commercial
      );
      createdOffsetShape.client = clients?.find((cli) => cli?.id === client);
      dispatchOffsetShapes((tmp) => {
        if (tmp) return [createdOffsetShape, ...tmp]
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
    console.log("createdOffsetShape", createdOffsetShape);
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
  const { showToast } = useToast();

  const shapeInEntry = useMemo(() => {
    const shape: OffsetShape | undefined = offsetShapes?.find(
      (shape: OffsetShape) => shape.id === currentEntry
    );
    if (!shape) return;

    const dep = {
      value: shape?.department.id,
      label: shape?.department.name,
    };

    const comm = {
      value: shape?.commercial.id,
      label: shape?.commercial.name,
    };

    const cli = {
      value: shape?.client?.id,
      label: shape?.client?.name,
    };

    if (dep) setDepartment([dep as any]);
    if (comm) setCommercial([comm as any]);
    if (cli) setClient([cli as any]);

    form.setValue("code", shape.code);
    form.setValue("dim_lx_lh", shape.dim_lx_lh);
    form.setValue("dim_square", shape.dim_square);
    form.setValue("dim_plate", shape.dim_plate);
    form.setValue("paper_type", shape.paper_type);
    form.setValue("pose_number", shape.pose_number);
    form.setValue("reference", shape.reference);
    form.setValue("part", shape.part);
    return shape;
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

  const onSubmitUpdate = async (data: z.infer<typeof shapeSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      // rules,
      code,
      dim_lx_lh,
      dim_square,
      dim_plate,
      paper_type,
      pose_number,
      reference,
      part,
    } = data;
    reference = reference.trim();
    // rules = rules.trim();
    part = part.trim();
    code = code.trim();
    const entry: OffsetShapeEntry = {
      client_id: client,
      department_id: department,
      commercial_id: commercial,
      dim_lx_lh,
      dim_square,
      dim_plate,
      paper_type,
      pose_number,
      part,
      code,
      reference,
    };
    if (!entry.client_id || JSON.stringify(entry.client_id) === JSON.stringify(shapeInEntry?.client.id)) delete entry.client_id;
    if (
      !entry.department_id ||
      JSON.stringify(entry.department_id) ===
      JSON.stringify(shapeInEntry?.department.id)
    ) delete entry.department_id;

    if (
      !entry.commercial_id ||
      JSON.stringify(entry.commercial_id) ===
      JSON.stringify(shapeInEntry?.commercial.id)
    ) delete entry.commercial_id;

    if (
      !entry.dim_lx_lh ||
      JSON.stringify(entry.dim_lx_lh) ===
      JSON.stringify(shapeInEntry?.dim_lx_lh)
    ) delete entry.dim_lx_lh;

    if (
      !entry.dim_square ||
      JSON.stringify(entry.dim_square) ===
      JSON.stringify(shapeInEntry?.dim_square)
    ) delete entry.dim_square;

    if (
      !entry.dim_plate ||
      JSON.stringify(entry.dim_plate) ===
      JSON.stringify(shapeInEntry?.dim_plate)
    ) delete entry.dim_plate;

    if (
      !entry.paper_type ||
      JSON.stringify(entry.paper_type) ===
      JSON.stringify(shapeInEntry?.paper_type)
    ) delete entry.paper_type;

    if (
      !entry.pose_number ||
      JSON.stringify(entry.pose_number) ===
      JSON.stringify(shapeInEntry?.pose_number)
    ) delete entry.pose_number;

    if (
      !entry.reference ||
      JSON.stringify(entry.reference) ===
      JSON.stringify(shapeInEntry?.reference)
    ) delete entry.reference;

    if (
      !entry.part ||
      JSON.stringify(entry.part) ===
      JSON.stringify(shapeInEntry?.part)
    ) delete entry.part;

    if (
      !entry.observation ||
      JSON.stringify(entry.observation) ===
      JSON.stringify(shapeInEntry?.observation)
    ) delete entry.observation;

    if (
      !entry.code ||
      JSON.stringify(entry.code) ===
      JSON.stringify(shapeInEntry?.code)
    ) delete entry.code;

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
  const onSubmitStandBy = async (data: z.infer<typeof shapeStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    const { data: standByShape, success } = await standbyShape(
      currentEntry as number,
      {
        type: "STANDBY",
        reason
      }
    );
    if (success) {
      console.log('standByShape', standByShape)
      standByform.setValue('reason', '');
      setOpenStandByModal(false);

      showToast({
        type: "success",
        message: "Mis en standBy avec succès",
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
    setLoading(false)
  }
  const onSubmitOservation = async (data: z.infer<typeof shapeObservationSchema>) => {
    let { observation } = data;
    setLoading(true);
    observation = observation.trim();
    const { data: observationData, success } = await observationShape(currentEntry as number,
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
    setLoading(false)
  }
  const onSubmitAssign = async (data: z.infer<typeof shapeAssignSchema>) => {
    setLoading(true);
    let { user_id } = data;
    const { data: assignShape, success } = await assignToAnUserShape(
      currentEntry as number,
      {
        type: "ASSIGNATION",
        user_id,
      }
    );
    if (success) {
      // console.log('assignShape', assignShape);
      // tmp => {
      //   return tmp?.map((shape) => {
      //     return ({ ...shape, logs: [] })
      //     // shape.id === assignShape.id ? ({
      //     //   ...shape,
      //     //   logs: [
      //     //     {
      //     //       "id": shape.logs[shape.logs.length - 1].id + 1,
      //     //       "shape_id": shape.id,
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
      //     //     ...shape.logs]
      //     // }) : shape
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
  }

  useEffect(() => {
    assignForm.setValue("user_id", assignUser[0]?.value as unknown as number);
  }, [assignUser]);

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          disabled={!offsetShapes}
          type="button"
          onClick={() => setCreationModal((tmp) => !tmp)}
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
        className="rounded-[16px] bg-white p-[12px] block mt-[1.6rem]"
      >
        <div className="w-full bg-white/80  rounded-t-xl h-[60px] flex items-center justify-center border-b"></div>
        <div className="relative w-full overflow-auto scrollbar-hide">
          {!offsetShapes ?
            <TableSkeleton head={tableHead} /> : <table className="w-full relative">
              <thead className="bg-white/50">
                <tr className="">
                  {tableHead.map((head, index) => (
                    <th
                      key={index}
                      className={` w-fit  ${index === 0 ? "w-0" : "min-w-[200px]"
                        } text-[15px] py-[10px] font-medium  ${index > 0 && index < tableHead.length
                        }  text-[#2f2f2f]`}
                    >
                      <div className={`h-full font-poppins relative flex items-center text-start px-[20px] ${head === "Options" ? " justify-end" : " justify-start"}`}>
                        {head}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/80">
                {offsetShapes?.map((row, index) => {
                  return <tr key={index} className="border-b">
                    {/* <td className="text-[#2f2f2f] relative p-[20px] text-start font-poppins text-[13px]">
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex">
                      <div className="w-[6px] bg-orange-400" />
                      <div className="w-[6px] bg-blue-400" />
                      <div className="w-[6px] bg-red-400" />
                      <div className="w-[6px] bg-red-400" />
                      <div className="w-[6px] bg-red-400" />
                      <div className="w-[6px] bg-red-400" />
                    </div>
                  </td> */}
                    <td className="text-[#2f2f2f] relative min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.code}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row?.client?.name}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.reference}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.commercial.name}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.department.name}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.dim_lx_lh}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.dim_square}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.dim_plate}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.paper_type}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.pose_number}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row.part}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
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
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
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
                    <td className="text-[#2f2f2f] w-auto p-[20px] text-start font-poppins text-[13px]">
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
                                  <OptionsIcon color={""} />
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
                                  <span className="text-[15px] text-[#2f2f2f] font-poppins font-medium leading-[20px]">
                                    Modifier les entrées
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { }}
                                  className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                >
                                  {/* <DetailsIcon color={""} /> */}
                                  <span className="text-[15px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
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
                                  <span className="text-[15px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
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
                                  <span className="text-[15px] text-[#2f2f2f] text-grayscale-900 font-medium font-poppins leading-[20px] ">
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
                                  <span className="text-[15px] text-[#2f2f2f] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                    Mettre en standby
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
                                  <span className="text-[15px] text-[#2f2f2f] text-grayscale-900 font-medium font-poppins leading-[20px] ">
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
                }

                )}
              </tbody>
            </table>
          }

        </div>
        <div className="w-full bg-white/80 rounded-b-xl h-[60px]"></div>
      </motion.div>

      <BaseModal open={openCreationModal} classname={""}>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-[calc(150vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[18px] font-medium font-poppins text-[#060606]">
                Nouvelle forme
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
                  label="Reference"
                  id="reference"
                  placeholder="Reference"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("reference")}
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
                  id="dim_lx_lh"
                  placeholder="Dimension Lx Lh"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("dim_lx_lh")}
                />
                <BaseInput
                  label="Dimensions Carrée"
                  id="dim_square"
                  placeholder="Dimensions Carrée"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("dim_square")}
                />
                <BaseInput
                  label="Dimensions plaque"
                  id="dim_plate"
                  placeholder="Dimensions plaque"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("dim_plate")}
                />
                <BaseInput
                  label="Type Papier"
                  id="paper_type"
                  placeholder="Type Papier"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("paper_type")}
                />
                <BaseInput
                  label="N° des poses"
                  id="pose_number"
                  placeholder="N° des poses"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("pose_number")}
                />

                <BaseInput
                  label="1/3"
                  id="part"
                  placeholder="1/3"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("part")}
                />
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
                  id="reference"
                  placeholder="Reference"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("reference")}
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
                  id="dim_lx_lh"
                  placeholder="Dimension Lx Lh"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("dim_lx_lh")}
                />
                <BaseInput
                  label="Dimensions Carrée"
                  id="dim_square"
                  placeholder="Dimensions Carrée"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("dim_square")}
                />
                <BaseInput
                  label="Dimensions plaque"
                  id="dim_plate"
                  placeholder="Dimensions plaque"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("dim_plate")}
                />
                <BaseInput
                  label="Type Papier"
                  id="paper_type"
                  placeholder="Type Papier"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("paper_type")}
                />
                <BaseInput
                  label="N° des poses"
                  id="pose_number"
                  placeholder="N° des poses"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("pose_number")}
                />
                <BaseInput
                  label="1/3"
                  id="part"
                  placeholder="1/3"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("part")}
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
            {!shapeInEntry?.logs ? <div className="w-full flex justify-center items-center p-[20px]">
              <span>Aucun log</span>
            </div> : <table className="w-full relative">
              <thead className="bg-white/50">
                <tr className="">
                  {["Titre", "Description", "Type", "Date de création", "Utilisateur"].map((head, index) => (
                    <th
                      key={index}
                      className={`  ${head === "options" ? "w-auto" : "min-w-[150px]"
                        } text-[13px] py-[10px] font-medium  ${index > 0 && index < tableHead.length
                        }  text-[#2f2f2f]`}
                    >
                      <div className="h-full font-poppins relative flex items-center text-start py-[10px] px-[20px] justify-start">
                        {head}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead> <tbody className="bg-white/80">
                {shapeInEntry?.logs?.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="text-[#2f2f2f] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
                      {row?.title}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
                      {row?.description}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
                      {row?.type}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] py-[10px] px-[20px] text-start font-poppins text-[13px]">
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
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
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
                  Mettre en standBy
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  Vous êtes sur point de mettre une forme en standBy
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
                placeholder="Dites pourquoi, vous mettez en standBy"
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
                {loading ? <Spinner color={"#fff"} size={20} /> : "Mettre en standBy"}
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
              <BaseInput
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
