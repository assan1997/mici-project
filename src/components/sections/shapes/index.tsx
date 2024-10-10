"use client";
import { FC, useMemo, useState, useEffect, useCallback } from "react";
// import BaseDropdown from "@/components/ui/dropdown/BaseDropdown";
import BaseModal from "@/components/ui/modal/BaseModal";
import { CloseIcon, EditIcon, OptionsIcon } from "@/components/svg";
import { BaseInput, BaseTextArea } from "@/components/ui/forms/BaseInput";
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
import { createOffsetShape, lockShape, resumeShape } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import {
  OffsetShapeEntry,
  updateOffsetShape,
  standbyOffsetShape,
  observationOffsetShape,
  assignToAnUserOffsetShape,
  endShape,
} from "@/services/shapes";
import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton } from "@/components/ui/loader/Skeleton";
import { useToast } from "@/contexts/toast.context";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";
import { Filter } from "@/components/ui/filter";
import { Export } from "@/components/ui/export";
import { useRouter } from "next/navigation";
import { deleteShape } from "@/services/shapes";
import { SearchMdIcon } from "@/components/svg/search-md";

export const Shape: FC<{}> = ({}) => {
  const {
    users,
    clients,
    departments,
    offsetShapes: allOffsetShapes,
    user,
    dispatchOffsetShapes,
    status,
    rules,
    onRefreshingShape,
    refreshShapeData,
  } = useData();
  const shapeSchema = z.object({
    client: z.number(),
    commercial: z.number(),
    department: z.number(),
    part: z.string(),
    code: z.string(),
    dim_lx_lh: z.string(),
    dim_square: z.string(),
    dim_plate: z.string(),
    paper_type: z.string(),
    pose_number: z.string(),
    reference: z.string(),
    rule: z.number(),
  });
  const shapeStandBySchema = z.object({
    reason: z.string(),
  });
  const shapeObservationSchema = z.object({
    observation: z.string(),
  });
  const shapeAssignSchema = z.object({
    user_id: z.number(),
    description: z.string(),
  });
  
  const form = useForm({ schema: shapeSchema });
  const standByform = useForm({ schema: shapeStandBySchema });
  const observationForm = useForm({ schema: shapeObservationSchema });
  const assignForm = useForm({ schema: shapeAssignSchema });

  const tableHead = [
    "Statut",
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
  const [offsetShapes, setOffsetShapes] = useState<OffsetShape[] | undefined>(
    []
  );

  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const [openEndModal, setEndModal] = useState<boolean>(false);
  const [openLockModal, setOpenLockModal] = useState<boolean>(false);
  const [observationList, setObservationList] = useState<
    {
      id: number;
      text: string;
    }[]
  >([
    {
      id: 0,
      text: "",
    },
  ]);

  const onSubmit = async (data: z.infer<typeof shapeSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      rule,
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
      rule_id: rule,
      user_id: user?.id as unknown as number,
      observations: observationList?.map((obs) => obs.text),
    });
    if (success) {
      reset();
      setCreationModal(false);
      createdOffsetShape.dim_plate = dim_plate;
      createdOffsetShape.department = departments.find(
        (dep) => dep.id === department && dep
      );
      createdOffsetShape.commercial = users?.find(
        (use) => use.id === commercial
      );
      createdOffsetShape.client = clients?.find((cli) => cli?.id === client);
      dispatchOffsetShapes((tmp) => {
        if (tmp) return [createdOffsetShape, ...tmp];
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
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentDatas, setCurrentDatas] = useState<any[]>(
    allOffsetShapes ? allOffsetShapes : []
  );
  const [selectedRule, setSelectedRule] = useState<ComboSelect[]>([]);

  useEffect(() => {
    setCurrentDatas(allOffsetShapes ? allOffsetShapes : []);
  }, [allOffsetShapes]);

  const { showToast } = useToast();
  const shapeInEntry = useMemo(() => {
    const shape: OffsetShape | undefined = offsetShapes?.find(
      (shape: OffsetShape) => shape.id === currentEntry
    );
    if (!shape) return;

    const dep = {
      value: shape?.department?.id,
      label: shape?.department?.name,
    };

    const comm = {
      value: shape?.commercial?.id,
      label: shape?.commercial?.name,
    };

    const cli = {
      value: shape?.client?.id,
      label: shape?.client?.name,
    };

    const rule = {
      value: shape?.rule_id,
      label: `Règle ${shape?.rule_id}`,
    };

    if (dep?.value) setDepartment([dep as any]);
    if (comm?.value) setCommercial([comm as any]);
    if (cli?.value) setClient([cli as any]);
    if (rule?.value) setSelectedRule([rule as any]);

    form.setValue("code", shape.code);
    form.setValue("dim_lx_lh", shape.dim_lx_lh);
    form.setValue("dim_square", shape.dim_square);
    form.setValue("dim_plate", shape.dim_plate);
    form.setValue("paper_type", shape.paper_type);
    form.setValue("pose_number", shape.pose_number);
    form.setValue("reference", shape.reference);
    form.setValue("part", shape.part);

    // setObservationList(shape?.observations?.map((observation) => ({ id: observation.id, text: observation.observation })))
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

  useEffect(() => {
    form.setValue("rule", selectedRule[0]?.value as unknown as number);
  }, [selectedRule]);

  const onSubmitUpdate = async (data: z.infer<typeof shapeSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      department,
      code,
      dim_lx_lh,
      dim_square,
      dim_plate,
      paper_type,
      pose_number,
      reference,
      part,
      rule,
    } = data;
    reference = reference.trim();
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
      rule_id: rule,
      observations: observationList?.map((obs) => obs.text),
    };

    if (
      !entry.rule_id ||
      JSON.stringify(entry.rule_id) === JSON.stringify(shapeInEntry?.rule_id)
    )
      delete entry.client_id;
    if (
      !entry.client_id ||
      JSON.stringify(entry.client_id) ===
        JSON.stringify(shapeInEntry?.client?.id)
    )
      delete entry.client_id;
    if (
      !entry.department_id ||
      JSON.stringify(entry.department_id) ===
        JSON.stringify(shapeInEntry?.department.id)
    )
      delete entry.department_id;

    if (
      !entry.commercial_id ||
      JSON.stringify(entry?.commercial_id) ===
        JSON.stringify(shapeInEntry?.commercial?.id)
    )
      delete entry.commercial_id;

    if (
      !entry.dim_lx_lh ||
      JSON.stringify(entry.dim_lx_lh) ===
        JSON.stringify(shapeInEntry?.dim_lx_lh)
    )
      delete entry.dim_lx_lh;

    if (
      !entry.dim_square ||
      JSON.stringify(entry.dim_square) ===
        JSON.stringify(shapeInEntry?.dim_square)
    )
      delete entry.dim_square;

    if (
      !entry.dim_plate ||
      JSON.stringify(entry.dim_plate) ===
        JSON.stringify(shapeInEntry?.dim_plate)
    )
      delete entry.dim_plate;

    if (
      !entry.paper_type ||
      JSON.stringify(entry.paper_type) ===
        JSON.stringify(shapeInEntry?.paper_type)
    )
      delete entry.paper_type;

    if (
      !entry.pose_number ||
      JSON.stringify(entry.pose_number) ===
        JSON.stringify(shapeInEntry?.pose_number)
    )
      delete entry.pose_number;

    if (
      !entry.reference ||
      JSON.stringify(entry.reference) ===
        JSON.stringify(shapeInEntry?.reference)
    )
      delete entry.reference;

    if (
      !entry.part ||
      JSON.stringify(entry.part) === JSON.stringify(shapeInEntry?.part)
    )
      delete entry.part;

    if (
      !entry.code ||
      JSON.stringify(entry.code) === JSON.stringify(shapeInEntry?.code)
    )
      delete entry.code;

    const { data: updatedShape, success } = await updateOffsetShape(
      currentEntry as number,
      entry
    );

    if (success) {
      updatedShape.department = departments.find(
        (dep) => dep.id === department && dep
      );
      updatedShape.commercial = users?.find((use) => use.id === commercial);
      updatedShape.client = clients?.find((cli) => cli.id === client);
      dispatchOffsetShapes((tmp) => {
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
      console.log("error");
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
  const handleDeleteShape = async (id: number) => {
    setLoading(true);
    const { data: deletedShape, success } = await deleteShape(
      currentEntry as number
    );
    if (success) {
      dispatchOffsetShapes((tmp: any) => {
        let tmpDatas;
        if (tmp) {
          tmpDatas = tmp.filter((t: any) => t.id !== currentEntry);
          return [...tmpDatas];
        }
      });
      setDelationModal(false);
      showToast({
        type: "success",
        message: `Supprimé avec succès`,
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
  const [openStandByModal, setOpenStandByModal] = useState<boolean>(false);
  const [openObservationModal, setOpenObservationModal] =
    useState<boolean>(false);

  const onSubmitStandBy = async (data: z.infer<typeof shapeStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    const status_id = shapeInEntry?.status_id !== 2 ? 2 : 1;
    let standByShape: any;
    if (status_id === 2) {
      standByShape = await resumeShape(currentEntry as number, {
        type: "RESUME-WORK",
        reason,
        status_id,
      });
    } else {
      standByShape = await standbyOffsetShape(currentEntry as number, {
        type: "STANDBY",
        reason,
        status_id,
      });
    }
    if (standByShape.success) {
      standByShape.data.status_id = status_id;
      dispatchOffsetShapes((tmp: any) => {
        let tmpDatas;
        let tmpData;
        if (tmp) {
          tmpData = tmp.find((t: any) => t.id === standByShape.data.id);
          tmpDatas = tmp.filter((t: any) => t.id !== standByShape.data.id);
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

  const onSubmitLock = async (data: z.infer<typeof shapeStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    const status_id = shapeInEntry?.status_id !== 3 ? 3 : 1;
    let blockShape: any;

    if (status_id === 3) {
      blockShape = await resumeShape(currentEntry as number, {
        type: "RESUME-WORK",
        reason,
        status_id,
      });
    } else {
      blockShape = await lockShape(currentEntry as number, {
        type: "BLOCK",
        reason,
        status_id,
      });
    }

    if (blockShape.success) {
      dispatchOffsetShapes((tmp: any) => {
        let tmpDatas;
        let tmpData;
        if (tmp) {
          tmpData = tmp.find((t: any) => t.id === blockShape.data.id);
          tmpDatas = tmp.filter((t: any) => t.id !== blockShape.data.id);
          return [{ ...tmpData, status_id }, ...tmpDatas];
        }
      });
      standByform.setValue("reason", "");
      setOpenStandByModal(false);
      showToast({
        type: "success",
        message: `${status_id === 3 ? "Débloquée " : "Bloquée "} avec succès`,
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
    data: z.infer<typeof shapeObservationSchema>
  ) => {
    let { observation } = data;
    setLoading(true);
    observation = observation.trim();
    const { data: observationData, success } = await observationOffsetShape(
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
  const onSubmitAssign = async (data: z.infer<typeof shapeAssignSchema>) => {
    setLoading(true);
    let { user_id } = data;
    const { data: assignShape, success } = await assignToAnUserOffsetShape(
      currentEntry as number,
      {
        type: "ASSIGNATION",
        user_assignated_id: user_id,
        task_description: data.description,
      }
    );
    if (success) {
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
  const onSubmitClose = async () => {
    setLoading(true);
    const { data: closeShapeData, success } = await endShape(
      shapeInEntry?.id as unknown as number
    );
    if (success) {
      dispatchOffsetShapes((tmp: any) => {
        let tmpDatas;
        let tmpData;
        if (tmp) {
          tmpData = tmp.find((t: any) => t.id === shapeInEntry?.id);
          tmpDatas = tmp.filter((t: any) => t.id !== shapeInEntry?.id);
          return [{ ...tmpData, status_id: 4 }, ...tmpDatas];
        }
      });
      showToast({
        type: "success",
        message: "Terminé avec succès",
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
  useEffect(() => {
    assignForm.setValue("user_id", assignUser[0]?.value as unknown as number);
  }, [assignUser]);

  const Router = useRouter();
  const goToDetail = (id: any) => {
    Router.push(`/workspace/details/shapes/${id}`);
  };
  const [sortedBy, setSortedBY] = useState<string>("");

  const sort = (key: string) => {
    setCurrentDatas((tmp) => {
      let sorted: any = [];

      setSortedBY(key);

      if (key === "client") {
        sorted = tmp?.sort((a, b) => {
          if (a.client.name.toUpperCase() > b.client.name.toUpperCase()) {
            return sortedBy !== key ? 1 : -1;
          }
          if (a.client.name.toUpperCase() < b.client.name.toUpperCase()) {
            return sortedBy !== key ? -1 : 1;
          }
          return 0;
        });
      }

      if (key === "commercial") {
        sorted = tmp?.sort((a, b) => {
          if (
            a.commercial.name.toUpperCase() > b.commercial.name.toUpperCase()
          ) {
            return 1;
          }
          if (
            a.commercial.name.toUpperCase() < b.commercial.name.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "code") {
        sorted = tmp?.sort((a, b) => {
          if (a.code.toUpperCase() > b.code.toUpperCase()) {
            return 1;
          }
          if (a.code.toUpperCase() < b.code.toUpperCase()) {
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

      if (key === "departement") {
        sorted = tmp?.sort((a, b) => {
          if (
            a.department.name.toUpperCase() > b.department.name.toUpperCase()
          ) {
            return 1;
          }
          if (
            a.department.name.toUpperCase() < b.department.name.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "dimension lxlxh") {
        sorted = tmp?.sort((a, b) => {
          if (a.dim_lx_lh.toUpperCase() > b.dim_lx_lh.toUpperCase()) {
            return 1;
          }
          if (a.dim_lx_lh.toUpperCase() < b.dim_lx_lh.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "dimensions carré") {
        sorted = tmp?.sort((a, b) => {
          if (a.dim_square.toUpperCase() > b.dim_square.toUpperCase()) {
            return 1;
          }
          if (a.dim_square.toUpperCase() < b.dim_square.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "dimensions plaque") {
        sorted = tmp?.sort((a, b) => {
          if (a?.dim_plate?.toUpperCase() > b?.dim_plate?.toUpperCase()) {
            return 1;
          }
          if (a?.dim_plate?.toUpperCase() < b?.dim_plate?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "type papier") {
        sorted = tmp?.sort((a, b) => {
          if (a.paper_type?.toUpperCase() > b.paper_type?.toUpperCase()) {
            return 1;
          }
          if (a.paper_type?.toUpperCase() < b.paper_type?.toUpperCase()) {
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
          if (a.part?.toUpperCase() > b.part?.toUpperCase()) {
            return 1;
          }
          if (a.part?.toUpperCase() < b.part?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      return [...(sorted as unknown as any)];
    });
  };

  const resetSortedBy = () => {
    setCurrentDatas(allOffsetShapes ? [...allOffsetShapes] : []);
    setSortedBY("");
  };

  const [combineSearch, setCombineSearch] = useState<any[]>([]);
  let combo: any = [];

  const handleCombineSearch = () => {
    combineSearch?.map((item) => {
      if (item.id === "Code" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape.code === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Client" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.client?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Reference" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.reference === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Commercial" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) =>
            shape?.commercial.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Departement" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) =>
            shape?.department.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions LxLxH" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.dim_lx_lh === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions Carré" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.dim_square === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions Plaque" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.dim_plate === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Type Papier" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.paper_type === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "N° des poses" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.pose_number === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "1/3" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allOffsetShapes : combo)?.filter(
          (shape: any) => shape?.part === item?.selectedValues[0]?.value
        );
      }
    });

    setCurrentDatas(combo);
    console.log("combo", combo);
  };

  useEffect(() => {
    if (combineSearch.some((cmb) => cmb.selectedValues.length > 0)) {
      handleCombineSearch();
    } else setCurrentDatas(allOffsetShapes as any);
  }, [combineSearch]);

  const RenderDepartmentFilter = useCallback(
    () => (
      <Filter
        type="status"
        title={"Affichage par département"}
        indexs={["department", "id"]}
        level={1}
        row={"Departement"}
        index={"status_id"}
        list={departments
          .filter((dep) => [1, 2].includes(dep.id))
          ?.map((dep) => ({
            id: dep.id,
            name: dep.name,
          }))}
        filterDatas={allOffsetShapes ? allOffsetShapes : []}
        dataHandler={setCurrentDatas}
        filterHandler={setOffsetShapes}
      />
    ),
    [departments, allOffsetShapes]
  );

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

      if (allOffsetShapes)
        allOffsetShapes.forEach((all) => {
          if (row === "Code") {
            mySet.add(all.code);
          }
          if (row === "Client") mySet.add(all.client.name);
          if (row === "Reference") mySet.add(all.reference);
          if (row === "Commercial") mySet.add(all.commercial.name);
          if (row === "Departement") mySet.add(all.department.name);
          if (row === "Dimension LxLxH") mySet.add(all.dim_lx_lh);
          if (row === "Dimensions Carré") mySet.add(all.dim_square);
          if (row === "Dimensions Plaque") mySet.add(all.dim_plate);
          if (row === "Type Papier") mySet.add(all.paper_type);
          if (row === "N° des poses") mySet.add(all.pose_number);
          if (row === "1/3") mySet.add(all.part);
        });

      obj.fields = Array.from(mySet) as any;
      tmp.push(obj);
      return [...tmp];
    });
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

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          disabled={!offsetShapes}
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
        <div className="relative w-full bg-white/10 z-50 gap-x-[4px] flex items-center h-[60px] justify-start border-b">
          <Filter
            type="button"
            title={""}
            row={""}
            index={""}
            list={[]}
            filterDatas={allOffsetShapes ? allOffsetShapes : []}
            dataHandler={setCurrentDatas}
            filterHandler={setOffsetShapes}
            onClick={() => {
              refreshShapeData();
            }}
          >
            {onRefreshingShape ? (
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
            type="status"
            title={"Affichage par statut"}
            row={"Status"}
            index={"status_id"}
            list={status}
            filterDatas={allOffsetShapes ? allOffsetShapes : []}
            dataHandler={setCurrentDatas}
            filterHandler={setOffsetShapes}
          />
          {/* <Filter
            type="status"
            title={"Affichage par statut"}
            row={"Status"}
            index={"status_id"}
            list={status}
            filterDatas={allOffsetShapes ? allOffsetShapes : []}
            dataHandler={setCurrentDatas}
            filterHandler={setOffsetShapes}
          /> */}
          <RenderDepartmentFilter />
          <Filter
            type="search"
            title={"Recherche"}
            row={""}
            indexs={["code", "reference", "dim_lx_lh", "commercial.name"]}
            list={status}
            filterDatas={allOffsetShapes ? allOffsetShapes : []}
            dataHandler={setCurrentDatas}
            filterHandler={setOffsetShapes}
          />
          <Filter
            type="date"
            title={"Affichage par date"}
            row={"Status"}
            index={"status_id"}
            list={status}
            filterDatas={allOffsetShapes ? allOffsetShapes : []}
            dataHandler={setCurrentDatas}
            filterHandler={setOffsetShapes}
          />
          {allOffsetShapes && allOffsetShapes?.length > 0 ? (
            <Export
              title="Exporter en csv"
              type="csv"
              entry={{
                headers: Object.keys(allOffsetShapes ? allOffsetShapes[0] : {})
                  .flatMap((shapeKey) => shapeKey)
                  .filter((shapeKey) => {
                    if (
                      ![
                        "logs",
                        "id",
                        "client_id",
                        "commercial_id",
                        "status_id",
                        "department_id",
                        "loggers",
                        "assignments",
                        "observations",
                        "performances",
                        "rule",
                      ].includes(shapeKey)
                    )
                      return shapeKey;
                  })
                  .flatMap((shapeKey) => ({
                    label: shapeKey.toUpperCase().replaceAll("_", " "),
                    key: shapeKey.toLocaleLowerCase(),
                  })),
                data: allOffsetShapes
                  ? allOffsetShapes?.map((shape) => ({
                      ...shape,
                      department: shape?.department?.name,
                      client: shape?.client?.name,
                      commercial: shape?.commercial?.name,
                      created_at: ` ${formatTime(
                        new Date(shape?.["created_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )} : ${formatTime(
                        new Date(shape?.["created_at"]).getTime(),
                        "h:m",
                        "short"
                      )}`,
                      updated_at: ` ${formatTime(
                        new Date(shape?.["updated_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )} : ${formatTime(
                        new Date(shape?.["updated_at"]).getTime(),
                        "h:m",
                        "short"
                      )}`,
                    }))
                  : [],
              }}
            />
          ) : null}
          {/* <Export
            title="Télécharger le pdf"
            type="pdf"
            entry={{ headers: [], data: [] }}
          /> */}
        </div>
        <div className="relative w-full overflow-auto scrollbar-hide bg-white">
          {!allOffsetShapes ? (
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
              <table className="w-full mb-[15rem] relative">
                <thead className="bg-white/50 transition">
                  <tr className="border-b bg-gray-50 cursor-pointer">
                    {tableHead?.map((head, index) => (
                      <th
                        key={index}
                        className={`w-fit ${
                          index === 0 ? "w-0" : "min-w-[300px]"
                        } text-[13px] py-[10px] font-medium  ${
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
                            className={`w-full flex gap-x-[10px] ${
                              head === "Options"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div className="w-fit h-[40px] flex items-center">
                              {head}
                            </div>
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
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        {/* <SearchMdIcon /> */}
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
                              <Form form={form} onSubmit={onSubmit}>
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
                                    combineSearch.find((opt) => opt.id === head)
                                      ?.selectedValues
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
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white/10">
                  {offsetShapes?.map((row, index) => {
                    const statut = status.find(
                      (st) => st.id === row?.status_id
                    );
                    return (
                      <tr
                        key={index}
                        className={`cursor-pointer border-b transition-all duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                      >
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]"
                        >
                          <div
                            className={`flex w-fit justify-center py-[3px] px-[10px] font-medium rounded-full ${
                              row?.status_id === 2
                                ? "bg-orange-200 text-orange-500"
                                : row?.status_id === 3
                                ? "bg-danger-200 text-danger-500"
                                : row?.status_id === 4
                                ? "bg-green-200 text-green-500"
                                : "bg-blue-200 text-blue-900"
                            }`}
                          >
                            {statut?.name}
                          </div>
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.code}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.client?.name}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.reference}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.commercial?.name}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row.department?.name}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.dim_lx_lh}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.dim_square}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.dim_plate}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.paper_type}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                        >
                          {row?.pose_number}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                          {row?.part}
                        </td>
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
                                        goToDetail(row?.id);
                                      }}
                                      className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                    >
                                      {/* <DetailsIcon color={""} /> */}
                                      <span className="text-[14px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
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
                                      <span className="text-[14px]  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                        Assigner à un utilisateur
                                      </span>
                                    </button>
                                    {/* <button
                                      type="button"
                                      onClick={() => {
                                        setOpenLogsModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <LogIcon color={""} />
                                      <span className="text-[14px]  text-grayscale-900 font-medium font-poppins leading-[20px]">
                                        Voir les logs
                                      </span>
                                    </button> */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenLockModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      {/* <DeleteShapeIcon color={""} /> */}
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        {row.status_id === 3
                                          ? "Débloquer"
                                          : "Bloquer"}
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
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        {row.status_id === 2
                                          ? "Enlever en standby"
                                          : "Mettre en standby"}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEndModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      {/* <DeleteShapeIcon color={""} /> */}
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        Terminer
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

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDelationModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      {/* <DeleteShapeIcon color={""} /> */}
                                      <span className="text-[14px] text-red-500 font-medium font-poppins leading-[20px] ">
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
              <div className="w-full bg-white/80 flex gap-x-[10px] justify-center items-center font-poppins font-medium leading-[20px] px-[20px] h-[60px]">
                Aucune donnée
                <Filter
                  type="button"
                  title={""}
                  row={""}
                  index={""}
                  list={[]}
                  filterDatas={allOffsetShapes ? allOffsetShapes : []}
                  dataHandler={setCurrentDatas}
                  filterHandler={setOffsetShapes}
                  onClick={() => {
                    setCombineSearch((tmp: any) => {
                      tmp.pop();
                      return [...tmp];
                    });
                  }}
                >
                  <CloseIcon />
                </Filter>
              </div>
            </motion.div>
          )}
        </div>
        {currentDatas?.length > 0 ? (
          <Pagination
            datas={currentDatas ? currentDatas : []}
            listHandler={setOffsetShapes}
          />
        ) : null}
      </motion.div>
      <BaseModal open={openCreationModal} classname={""}>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-[calc(150vh)] h-[98vh]">
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
            <div className="flex flex-col justify-start w-full h-[calc(100%-130px)] overflow-scroll relative py-[10px] px-[20px]">
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
                <ComboboxMultiSelect
                  label={"Règle"}
                  placeholder="Sélectionnez la règle a appliquer"
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
                  id={`rule`}
                  options={rules?.map((rule) => ({
                    value: rule as unknown as string,
                    label: `Règle ${rule}` as unknown as string,
                  }))}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={selectedRule}
                  setSelectedUniqElementInDropdown={setSelectedRule}
                  borderColor="border-grayscale-200"
                />
                <br />
              </div>
              {observationList?.map(
                (
                  observation: {
                    id: number;
                    text: string;
                  },
                  index: number
                ) => (
                  <motion.div
                    key={index}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 1,
                      ease: [0.36, 0.01, 0, 0.99],
                      delay: 0.2,
                    }}
                  >
                    <div className="flex gap-x-[10px] items-center">
                      <BaseTextArea
                        label="Nouvelle observation"
                        id="observation"
                        placeholder="Observation"
                        // leftIcon={<RulerIcon color={""} size={20} />}
                        type="text"
                        onChange={(e) => {
                          setObservationList((tmp) =>
                            tmp?.map((obs) =>
                              obs.id === observation.id
                                ? { ...obs, text: e.target.value }
                                : obs
                            )
                          );
                        }}
                        value={observation.text}
                      />
                      <div className="flex gap-x-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            setObservationList((tmp) => [
                              ...tmp,
                              {
                                id:
                                  observationList[observationList.length - 1]
                                    .id + 1,
                                text: "",
                              },
                            ]);
                          }}
                          className={`mt-5 w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
                        >
                          +
                        </button>
                        {index !== 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setObservationList((tmp) =>
                                tmp.filter(
                                  (obs) => obs.id !== observation.id && obs
                                )
                              );
                            }}
                            className={`mt-5 w-fit h-[48px] text-gray-900 transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#dbdbdb8e] hover:bg-[#dbdbdb]/90`}
                          >
                            -
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
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
          <div className="w-[calc(150vh)] h-[98vh]">
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
            <div className="flex flex-col justify-start w-full h-[calc(100%-130px)] overflow-auto relative py-[10px] px-[20px]">
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

                <ComboboxMultiSelect
                  label={"Règle"}
                  placeholder="Sélectionnez la règle a appliquer"
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
                  id={`rule`}
                  options={rules?.map((rule) => ({
                    value: rule as unknown as string,
                    label: `Règle ${rule}` as unknown as string,
                  }))}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={selectedRule}
                  setSelectedUniqElementInDropdown={setSelectedRule}
                  borderColor="border-grayscale-200"
                />
              </div>

              {observationList?.map(
                (
                  observation: {
                    id: number;
                    text: string;
                  },
                  index: number
                ) => (
                  <motion.div
                    key={index}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 1,
                      ease: [0.36, 0.01, 0, 0.99],
                      delay: 0.2,
                    }}
                  >
                    <div className="flex gap-x-[10px] items-center">
                      <BaseTextArea
                        label="Nouvelle observation"
                        id="observation"
                        placeholder="Observation"
                        // leftIcon={<RulerIcon color={""} size={20} />}
                        type="text"
                        onChange={(e) => {
                          setObservationList((tmp) =>
                            tmp?.map((obs) =>
                              obs.id === observation.id
                                ? { ...obs, text: e.target.value }
                                : obs
                            )
                          );
                        }}
                        value={observation.text}
                      />
                      <div className="flex gap-x-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            setObservationList((tmp) => [
                              ...tmp,
                              {
                                id:
                                  observationList[observationList.length - 1]
                                    .id + 1,
                                text: "",
                              },
                            ]);
                          }}
                          className={`mt-5 w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
                        >
                          +
                        </button>
                        {index !== 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setObservationList((tmp) =>
                                tmp.filter(
                                  (obs) => obs.id !== observation.id && obs
                                )
                              );
                            }}
                            className={`mt-5 w-fit h-[48px] text-gray-900 transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#dbdbdb8e] hover:bg-[#dbdbdb]/90`}
                          >
                            -
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
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
      {/* DELATION MODAL */}
      <BaseModal open={openEndModal} classname={""}>
        <div className="w-[calc(80vh)] h-auto overflow-auto">
          <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
            <div className="flex flex-col">
              <span className="text-[18px] font-poppins text-[#060606]">
                Terminer la forme
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                Vous êtes sur point de terminer <br /> cette forme .
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
          <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
            <button
              type="button"
              onClick={onSubmitClose}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
            >
              {loading ? <Spinner color={"#fff"} size={20} /> : "Terminer"}
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
            {!shapeInEntry?.logs ? (
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
                  {shapeInEntry?.logs?.map((row, index) => (
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
                <span className="text-[18px] font-poppins text-[#060606]">
                  {shapeInEntry?.status_id !== 2
                    ? "Mettre en standby"
                    : "Enlever en standby"}
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  {`Vous êtes sur point ${
                    shapeInEntry?.status_id !== 2 ? " de mettre" : "d'enlever "
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
                  shapeInEntry?.status_id !== 2
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
                ) : shapeInEntry?.status_id !== 2 ? (
                  "Mettre en standBy"
                ) : (
                  "Enlever en standby"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      <BaseModal open={openLockModal} classname={""}>
        <Form form={standByform} onSubmit={onSubmitLock}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[18px] font-poppins text-[#060606]">
                  {shapeInEntry?.status_id !== 3 ? "Bloquer" : "Débloquer"}
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  {`Vous êtes sur point de ${
                    shapeInEntry?.status_id !== 3 ? "bloquer" : "débloquer"
                  } une forme `}
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenLockModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-[20px]">
              <BaseInput
                label="Raison"
                id="reason"
                placeholder={`Dites pourquoi vous  ${
                  shapeInEntry?.status_id !== 3 ? "bloquer" : "débloquer"
                }  cette forme`}
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
                ) : (
                  `${shapeInEntry?.status_id !== 3 ? "Bloquer" : "Débloquer"}`
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

            <div className="p-[20px]">
              <BaseTextArea
                label="Description"
                id="description"
                placeholder="Décrivez cette tâche"
                // leftIcon={<RulerIcon color={""} size={20} />}
                type="text"
                {...assignForm.register("description")}
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
                <span className="text-[18px] font-poppins text-[#060606]">
                  Obervation
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
