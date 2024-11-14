"use client";
import { FC, useMemo, useState, useEffect, useCallback } from "react";
// import BaseDropdown from "@/components/ui/dropdown/BaseDropdown";
import BaseModal from "@/components/ui/modal/BaseModal";
import { CloseIcon, EditIcon, OptionsIcon, PlusIcon } from "@/components/svg";
import { BaseInput, BaseTextArea } from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import React from "react";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import {
  Client,
  Department,
  ShapeInterface,
  FolderInterface,
  useData,
  User,
} from "@/contexts/data.context";
// import { createOffsetShape, lockShape } from "@/services/shapes";
import { formatTime } from "@/lib/utils/timestamp";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";

import {
  FolderEntry,
  createFolder,
  getAllFolders,
  getOneFolder,
  closeFolder,
  updateFolder,
  deleteFolder,
  observationFolder,
  assignToAnUserFolder,
  resumeFolder,
  standbyFolder,
  lockShape,
  printingPlates,
  getAllPrintingPlates,
  deletePrintingPlates,
  markAsReceivedPrintingPlates,
  orderPrintingPlate,
  orderShape,
  receivedShape,
  receivedPrintingPlate,
} from "@/services/folder";

import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton } from "@/components/ui/loader/Skeleton";
import { useToast } from "@/contexts/toast.context";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/pagination";
import { Filter } from "@/components/ui/filter";
import { Export } from "@/components/ui/export";
import { useRouter } from "next/navigation";
import { createRoot } from "react-dom/client";
import useSWR from "swr";
import { useSideBar } from "@/contexts/sidebar.context";
import { Switch } from "@headlessui/react";

export const ImprimerieFlexo: FC<{}> = ({}) => {
  const {
    users,
    clients,
    departments,
    offsetShapes: allShapes,
    user,
    dispatchOffsetShapes,
    status,
    rules,
    onRefreshingShape,
    refreshShapeData,
    getAllShapes,
    checkIfCommercial,
  } = useData();

  const [loading, setLoading] = useState<boolean>(false);

  const { data, mutate, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/folders`,
    getAllFolders
  );

  const {
    data: dataPrintingPlates,
    mutate: mutatePrintingPlates,
    error: errorPrintingPlates,
    isLoading: isLoadingPrintingPlates,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/printing-plates`,
    getAllPrintingPlates
  );

  const allFolders = useMemo(
    () => data?.allFolders.filter((folder: any) => folder.department.id === 2),
    [data]
  );
  const allPrintingPlates = useMemo(
    () => dataPrintingPlates?.allPrintingPlates,
    [dataPrintingPlates]
  );

  const folderSchema = z.object({
    client: z.number(),
    commercial: z.number(),
    // department: z.number(),
    number: z.string(),
    format: z.string(),
    support: z.string(),
    color: z.string(),
    state: z.string(),
    shape: z.number(),
    details: z.string(),
    rule: z.number(),
    reference: z.string(),
    product: z.string(),
    printing_plate_id: z.number(),
  });
  const folderStandBySchema = z.object({
    reason: z.string(),
  });
  const folderObservationSchema = z.object({
    observation: z.string(),
  });
  const folderAssignSchema = z.object({
    user_id: z.number(),
    description: z.string(),
  });

  const printingPlateSchema = z.object({
    name: z.string(),
    ref: z.string(),
  });

  const actionSchema = z.object({});
  const actionForm = useForm({ schema: actionSchema });

  const printingPlateForm = useForm({ schema: printingPlateSchema });
  const form = useForm({ schema: folderSchema });
  const standByform = useForm({ schema: folderStandBySchema });
  const observationForm = useForm({ schema: folderObservationSchema });
  const assignForm = useForm({ schema: folderAssignSchema });

  const tableHead = [
    "Statut",
    "Statut de la forme",
    "Statut du cliché",
    "Forme commandé lé",
    "Forme reçu lé",
    "Cliché commandé lé",
    "Cliché reçu lé",
    "Forme",
    "Cliché",
    "Numero",
    "Client",
    "Reference",
    "Code",
    "Commercial",
    "Etat",
    "Departement",
    "Produit",
    "Format",
    // "Fabrication",
    "Couleur",
    "Support",
    "Détails",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
    "Options",
  ];

  const printingPlateTableHead = [
    "Code",
    "Reference",
    "Name",
    "Commandé",
    "Recu",
    "Recu le",
    "Date & Heure de commande",
    "Date & Heure de création",
    "Date & Heure de mise à jour",
    "Options",
  ];

  const reset = () => {
    form.setValue("client", 0);
    form.setValue("commercial", 0);
    // form.setValue("department", 0);
    form.setValue("number", "");
    form.setValue("format", "");
    form.setValue("support", "");
    form.setValue("color", "");
    form.setValue("state", "");
    form.setValue("details", "");
    form.setValue("product", "");
    form.setValue("rule", 0);
    setSelectedRule([]);
    setShapes([]);
    setState([]);
    assignForm.setValue("description", "");
    assignForm.setValue("user_id", 0);
    printingPlateForm.setValue("name", "");
    printingPlateForm.setValue("ref", "");
    setCurrentEntry(undefined);
    setCommercial([]);
    setDepartment([]);
    setClient([]);
    setSelectedPrintingPlate([]);
    setAssignUser([]);
  };

  const { box, handleClick } = useActiveState();
  const [folders, setFolders] = useState<FolderInterface[] | undefined>([]);
  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const [openEndModal, setEndModal] = useState<boolean>(false);
  const [openLockModal, setOpenLockModal] = useState<boolean>(false);
  const [openMarkShapeIsOrderedModal, setOpenMarkShapeIsOrderedModal] =
    useState<boolean>(false);
  const [openMarkShapeIsReceivedModal, setOpenMarkShapeIsReceivedModal] =
    useState<boolean>(false);

  const [
    openMarkIsPrintingPlateOrderedModal,
    setOpenMarkIsPrintingPlateOrderedModal,
  ] = useState<boolean>(false);

  const [
    openMarkIsPrintingPlateReceivedModal,
    setOpenMarkIsPrintingPlateReceivedModal,
  ] = useState<boolean>(false);

  const [printingPlateToOrdered, setPrintingPlateToOrdered] =
    useState<boolean>(false);
  const [shapeToOrdered, setShapeToOrdered] = useState<boolean>(false);

  const { roleAdmin } = useSideBar();
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

  const onSubmit = async (data: z.infer<typeof folderSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      // department,
      rule,
      number,
      format,
      support,
      color,
      state,
      reference,
      details,
      product,
      shape,
      printing_plate_id,
    } = data;

    const { data: createdFolder, success } = await createFolder({
      format,
      color,
      product,
      details,
      support,
      state,
      reference,
      client_id: client,
      department_id: 2,
      commercial_id: commercial,
      rule_id: rule,
      file_number: number,
      shape_id: shape,
      printing_plate_id,
      plate_to_order: printingPlateToOrdered,
      shape_to_order: shapeToOrdered,
    });

    if (success) {
      reset();
      setCreationModal(false);
      mutate();

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

  const onSubmitPrintingPlate = async (
    data: z.infer<typeof printingPlateSchema>
  ) => {
    let { name, ref } = data;
    const entry: {
      name: string;
      ref: string;
    } = {
      name,
      ref,
    };

    setLoading(true);

    const { success } = await printingPlates({ ...entry });

    if (success) {
      reset();
      mutatePrintingPlates();
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

  const handledeletePrintingPlate = async (id: number) => {
    setLoading(true);
    const { success } = await deletePrintingPlates(id);
    if (success) {
      mutatePrintingPlates();
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
    setPlateDelationModal(false);
    reset();
  };

  const onSubmitUpdate = async (data: z.infer<typeof folderSchema>) => {
    setLoading(true);
    let {
      client,
      commercial,
      // department,
      rule,
      number,
      format,
      support,
      color,
      state,
      reference,
      shape,
      details,
      product,
      printing_plate_id,
    } = data;

    const entry: FolderEntry = {
      reference,
      format,
      color,
      support,
      details,
      state,
      client_id: client,
      department_id: 2,
      commercial_id: commercial,
      rule_id: rule,
      product,
      file_number: number,
      shape_id: shape,
      printing_plate_id,
    };

    if (
      !entry.product ||
      JSON.stringify(entry.product) === JSON.stringify(folderInEntry?.product)
    )
      delete entry.client_id;
    if (
      !entry.rule_id ||
      JSON.stringify(entry.rule_id) === JSON.stringify(folderInEntry?.rule_id)
    )
      delete entry.client_id;
    if (
      !entry.client_id ||
      JSON.stringify(entry.client_id) ===
        JSON.stringify(folderInEntry?.client?.id)
    )
      delete entry.client_id;
    if (
      !entry.department_id ||
      JSON.stringify(entry.department_id) ===
        JSON.stringify(folderInEntry?.department.id)
    )
      delete entry.department_id;

    if (
      !entry.commercial_id ||
      JSON.stringify(entry?.commercial_id) ===
        JSON.stringify(folderInEntry?.commercial?.id)
    )
      delete entry.commercial_id;

    if (
      !entry.reference ||
      JSON.stringify(entry.reference) ===
        JSON.stringify(folderInEntry?.reference)
    )
      delete entry.reference;

    if (
      !entry.file_number ||
      JSON.stringify(entry.file_number) ===
        JSON.stringify(folderInEntry?.file_number)
    )
      delete entry.file_number;

    if (
      !entry.format ||
      JSON.stringify(entry.format) === JSON.stringify(folderInEntry?.format)
    )
      delete entry.format;

    if (
      !entry.color ||
      JSON.stringify(entry.color) === JSON.stringify(folderInEntry?.color)
    )
      delete entry.color;

    if (
      !entry.support ||
      JSON.stringify(entry.support) === JSON.stringify(folderInEntry?.support)
    )
      delete entry.support;

    if (
      !entry.state ||
      JSON.stringify(entry.state) === JSON.stringify(folderInEntry?.state)
    )
      delete entry.state;

    if (
      !entry.details ||
      JSON.stringify(entry.details) === JSON.stringify(folderInEntry?.details)
    )
      delete entry.details;

    const { data: updatedFolder, success } = await updateFolder(
      currentEntry as number,
      entry
    );

    if (success) {
      mutate();

      setOpenEditionModal(false);
      showToast({
        type: "success",
        message: "Modifier avec succès",
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    reset();
    setLoading(false);
  };
  interface ComboSelect {
    label: string;
    value: string;
  }
  const [commercial, setCommercial] = useState<ComboSelect[]>([]);
  const [assignUser, setAssignUser] = useState<ComboSelect[]>([]);

  const states = useMemo(
    () => [
      {
        label: "Nouveau visuel",
        value: "Nouveau visuel",
      },
      {
        label: "Retirage",
        value: "Retirage",
      },
    ],
    []
  );
  const [state, setState] = useState<ComboSelect[]>([]);
  const [client, setClient] = useState<ComboSelect[]>([]);
  const [department, setDepartment] = useState<ComboSelect[]>([]);
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [currentDatas, setCurrentDatas] = useState<any[]>(
    allFolders ? allFolders : []
  );
  const [selectedRule, setSelectedRule] = useState<ComboSelect[]>([]);
  const [shapes, setShapes] = useState<ComboSelect[]>([]);
  const [plateDelationModal, setPlateDelationModal] = useState<boolean>(false);
  const [plateReceivedModal, setPlateReceivedModal] = useState<boolean>(false);
  const [selectedPrintingPlate, setSelectedPrintingPlate] = useState<
    ComboSelect[]
  >([]);

  useEffect(() => {
    setCurrentDatas(allFolders ? allFolders : []);
  }, [allFolders]);

  const { showToast } = useToast();
  const folderInEntry = useMemo(() => {
    const folder: FolderInterface | undefined = folders?.find(
      (folder: FolderInterface) => folder.id === currentEntry
    );
    if (!folder) return;

    const dep = {
      value: folder?.department?.id,
      label: folder?.department?.name,
    };

    const comm = {
      value: folder?.commercial?.id,
      label: folder?.commercial?.name,
    };

    const cli = {
      value: folder?.client?.id,
      label: folder?.client?.name,
    };

    const state = {
      value: folder.state,
      label: folder.state,
    };

    const tmpshape = allShapes?.find((shape) => shape.id === folder?.shape_id);

    const shape = {
      value: tmpshape?.id,
      label: tmpshape?.code,
    };

    const rule = {
      value: folder?.rule_id,
      label: `Règle ${folder?.rule_id}`,
    };

    const tmpPrintingPlate = allPrintingPlates?.find(
      (printing: any) => printing.id === folder?.printing_plate_id
    );

    const printing_plate_id = {
      value: tmpPrintingPlate?.id,
      label: tmpPrintingPlate?.name,
    };

    if (dep?.value) setDepartment([dep as any]);
    if (comm?.value) setCommercial([comm as any]);
    if (cli?.value) setClient([cli as any]);
    if (rule?.value) setSelectedRule([rule as any]);
    if (state?.value) setState([state as any]);
    if (shape?.value) setShapes([shape as any]);

    if (printing_plate_id?.value)
      setSelectedPrintingPlate([printing_plate_id as any]);

    form.setValue("product", folder.product);
    form.setValue("format", folder.format);
    form.setValue("support", folder.support);
    form.setValue("color", folder.color);
    form.setValue("details", folder.details);
    form.setValue("state", folder.state);
    form.setValue("number", folder.file_number);
    form.setValue("reference", folder.reference);
    // form.setValue("paper_type", shape.paper_type);
    // form.setValue("pose_number", shape.pose_number);
    // form.setValue("reference", shape.reference);
    // form.setValue("part", shape.part);

    // setObservationList(shape?.observations?.map((observation) => ({ id: observation.id, text: observation.observation })))
    return folder;
  }, [currentEntry]);

  useEffect(() => {
    form.setValue("commercial", commercial[0]?.value as unknown as number);
  }, [commercial]);

  useEffect(() => {
    form.setValue("client", client[0]?.value as unknown as number);
  }, [client]);

  useEffect(() => {
    form.setValue("rule", selectedRule[0]?.value as unknown as number);
  }, [selectedRule]);

  useEffect(() => {
    form.setValue("state", state[0]?.value as unknown as string);
  }, [state]);

  useEffect(() => {
    form.setValue("shape", shapes[0]?.value as unknown as number);
  }, [shapes]);

  useEffect(() => {
    form.setValue(
      "printing_plate_id",
      selectedPrintingPlate[0]?.value as unknown as number
    );
  }, [selectedPrintingPlate]);
  const [openAssignToUserModal, setOpenAssignToUserModal] =
    useState<boolean>(false);
  // const [openLogsModal, setOpenLogsModal] = useState<boolean>(false);
  const handledeleteFolder = async (id: number) => {
    setLoading(true);
    const { success } = await deleteFolder(currentEntry as number);
    if (success) {
      let tmpDatas = allFolders.filter((t: any) => t.id !== currentEntry);
      mutate();
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
  // const [openObservationModal, setOpenObservationModal] =
  //   useState<boolean>(false);
  const onSubmitStandBy = async (data: z.infer<typeof folderStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    let standByShape: any;
    standByShape = await standbyFolder(currentEntry as number, {
      type: "STANDBY",
      reason,
      status_id: 2,
    });

    if (standByShape.success) {
      mutate();
      standByform.setValue("reason", "");
      showToast({
        type: "success",
        message: `Mis en standby avec succès`,
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setOpenStandByModal(false);
    setLoading(false);
    reset();
  };

  const onSubmitResume = async (data: z.infer<typeof folderStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();

    let standByShape: any;
    standByShape = await resumeFolder(currentEntry as number, {
      type: "RESUME-WORK",
      reason,
      status_id: 1,
    });

    if (standByShape.success) {
      mutate();
      standByform.setValue("reason", "");
      showToast({
        type: "success",
        message: `Enlevé en standby avec succès`,
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setOpenStandByModal(false);
    setLoading(false);
    reset();
  };

  const onSubmitMarkAsReceivedPrintingPlates = async () => {
    setLoading(true);
    const { success } = await markAsReceivedPrintingPlates(
      currentEntry as number
    );
    if (success) {
      showToast({
        type: "success",
        message: `Marquer comme recu avec succès`,
        position: "top-center",
      });
      mutatePrintingPlates();
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setLoading(false);
    setPlateReceivedModal(false);
    reset();
  };

  const onSubmitLock = async (data: z.infer<typeof folderStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    const status_id = folderInEntry?.status_id !== 3 ? 3 : 1;
    let blockShape: any;

    blockShape = await lockShape(currentEntry as number, {
      type: "BLOCK",
      reason,
      status_id: 3,
    });

    if (blockShape.success) {
      mutate();
      standByform.setValue("reason", "");
      setOpenStandByModal(false);
      showToast({
        type: "success",
        message: `Bloquée avec succès`,
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setOpenLockModal(false);
    setLoading(false);
    reset();
  };

  const onSubmitUnlock = async (data: z.infer<typeof folderStandBySchema>) => {
    setLoading(true);
    let { reason } = data;
    reason = reason.trim();
    let blockShape: any;

    blockShape = await resumeFolder(currentEntry as number, {
      type: "RESUME-WORK",
      reason,
      status_id: 1,
    });

    if (blockShape.success) {
      mutate();
      standByform.setValue("reason", "");
      setOpenStandByModal(false);
      showToast({
        type: "success",
        message: `Débloquée avec succès`,
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "L'opération a échoué",
        position: "top-center",
      });
    }
    setOpenLockModal(false);
    setLoading(false);
    reset();
  };
  // const onSubmitOservation = async (
  //   data: z.infer<typeof folderObservationSchema>
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

  // const onSubmitClose = async () => {
  //   setLoading(true);
  //   const { data: closeShapeData, success } = await endShape(
  //     folderInEntry?.id as unknown as number
  //   );
  //   if (success) {
  //     dispatchOffsetShapes((tmp: any) => {
  //       let tmpDatas;
  //       let tmpData;
  //       if (tmp) {
  //         tmpData = tmp.find((t: any) => t.id === folderInEntry?.id);
  //         tmpDatas = tmp.filter((t: any) => t.id !== folderInEntry?.id);
  //         return [{ ...tmpData, status_id: 4 }, ...tmpDatas];
  //       }
  //     });
  //     showToast({
  //       type: "success",
  //       message: "Terminé avec succès",
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
  // };
  const onSubmitAssign = async (data: z.infer<typeof folderAssignSchema>) => {
    setLoading(true);
    let { user_id } = data;
    const { data: assignFolder, success } = await assignToAnUserFolder(
      currentEntry as number,
      {
        type: "ASSIGNATION",
        user_assignated_id: user_id,
        task_description: data.description,
      }
    );
    if (success) {
      mutate();
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
  const Router = useRouter();
  const goToDetail = (id: any) => {
    Router.push(`/workspace/details/folders/${id}`);
  };
  const [sortedBy, setSortedBY] = useState<string>("");
  const sort = (key: string) => {
    setCurrentDatas((tmp) => {
      let sorted: any = [];
      setSortedBY(key);

      if (key === "client") {
        sorted = tmp?.sort((a, b) => {
          if (a?.client?.name.toUpperCase() > b?.client?.name?.toUpperCase()) {
            return sortedBy !== key ? 1 : -1;
          }
          if (a?.client?.name?.toUpperCase() < b?.client?.name?.toUpperCase()) {
            return sortedBy !== key ? -1 : 1;
          }
          return 0;
        });
      }

      if (key === "code") {
        sorted = tmp?.sort((a, b) => {
          if (a?.code?.toUpperCase() > b?.code?.toUpperCase()) {
            return 1;
          }
          if (a?.code?.toUpperCase() < b?.code?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "reference") {
        sorted = tmp?.sort((a, b) => {
          if (a?.reference?.toUpperCase() > b?.reference?.toUpperCase()) {
            return 1;
          }
          if (a?.reference?.toUpperCase() < b?.reference?.toUpperCase()) {
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

      if (key === "numero") {
        sorted = tmp?.sort((a, b) => {
          if (a?.file_number?.toUpperCase() > b?.file_number?.toUpperCase()) {
            return 1;
          }
          if (a?.file_number?.toUpperCase() < b?.file_number?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "etat") {
        sorted = tmp?.sort((a, b) => {
          if (a?.state?.toUpperCase() > b?.state?.toUpperCase()) {
            return 1;
          }
          if (a?.state?.toUpperCase() < b?.state?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "product") {
        sorted = tmp?.sort((a, b) => {
          if (a?.product?.toUpperCase() > b?.product?.toUpperCase()) {
            return 1;
          }
          if (a?.product?.toUpperCase() < b?.product?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "format") {
        sorted = tmp?.sort((a, b) => {
          if (a?.Format?.toUpperCase() > b?.Format?.toUpperCase()) {
            return 1;
          }
          if (a?.Format?.toUpperCase() < b?.Format?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "forme") {
        sorted = tmp?.sort((a, b) => {
          if (
            (allShapes
              ?.find((shape) => shape.id === a?.shape_id)
              ?.reference.toUpperCase() as unknown as string) >
            (allShapes
              ?.find((shape) => shape.id === b?.shape_id)
              ?.reference.toUpperCase() as unknown as string)
          ) {
            return 1;
          }
          if (
            (allShapes
              ?.find((shape) => shape.id === a?.shape_id)
              ?.reference.toUpperCase() as unknown as string) <
            (allShapes
              ?.find((shape) => shape.id === b?.shape_id)
              ?.reference.toUpperCase() as unknown as string)
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "cliché") {
        sorted = tmp?.sort((a, b) => {
          if (
            (allPrintingPlates
              ?.find((printing: any) => printing.id === a?.printing_plate_id)
              ?.reference.toUpperCase() as unknown as string) >
            (allPrintingPlates
              ?.find((printing: any) => printing.id === b?.printing_plate_id)
              ?.reference.toUpperCase() as unknown as string)
          ) {
            return 1;
          }
          if (
            (allPrintingPlates
              ?.find((printing: any) => printing.id === a?.printing_plate_id)
              ?.reference.toUpperCase() as unknown as string) <
            (allPrintingPlates
              ?.find((printing: any) => printing.id === b?.printing_plate_id)
              ?.reference.toUpperCase() as unknown as string)
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "departement") {
        sorted = tmp?.sort((a, b) => {
          if (
            a?.department?.name?.toUpperCase() >
            b?.department?.name?.toUpperCase()
          ) {
            return 1;
          }
          if (
            a?.department?.name?.toUpperCase() <
            b?.department?.name?.toUpperCase()
          ) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "couleur") {
        sorted = tmp?.sort((a, b) => {
          if (a?.color?.toUpperCase() > b?.color?.toUpperCase()) {
            return 1;
          }
          if (a?.color?.toUpperCase() < b?.color?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "support") {
        sorted = tmp?.sort((a, b) => {
          if (a?.support?.toUpperCase() > b?.support?.toUpperCase()) {
            return 1;
          }
          if (a?.support?.toUpperCase() < b?.support?.toUpperCase()) {
            return -1;
          }
          return 0;
        });
      }

      if (key === "détails") {
        sorted = tmp?.sort((a, b) => {
          if (a?.details?.toUpperCase() > b?.details?.toUpperCase()) {
            return 1;
          }
          if (a?.details?.toUpperCase() < b?.details?.toUpperCase()) {
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
    setCurrentDatas(allFolders ? [...allFolders] : []);
    setSortedBY("");
  };
  const [combineSearch, setCombineSearch] = useState<any[]>([]);
  let combo: any = [];
  const handleCombineSearch = () => {
    combineSearch?.map((item) => {
      if (item.id === "Numero" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder.file_number === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Client" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) =>
            folder?.client?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Code" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder?.code === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Reference" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder?.reference === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Etat" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder?.state === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Product" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder?.product === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Commercial" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) =>
            folder?.commercial?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Departement" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) =>
            folder?.department?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Format" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder?.format === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Forme" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) =>
            allShapes?.find((shape) => shape.id === folder?.shape_id)
              ?.reference === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Cliché" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) =>
            allPrintingPlates?.find(
              (printing: any) => printing.id === folder?.printing_plate_id
            )?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Couleur" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder?.color === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Support" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) => folder?.support === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Détails" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allFolders : combo)?.filter(
          (folder: any) =>
            folder?.details.trim() === item?.selectedValues[0]?.value.trim()
        );
      }
    });

    setCurrentDatas(combo);
  };
  useEffect(() => {
    if (combineSearch.some((cmb) => cmb.selectedValues.length > 0)) {
      handleCombineSearch();
    } else setCurrentDatas(allFolders as any);
  }, [combineSearch]);
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

      if (allFolders)
        allFolders.forEach((all: any) => {
          if (row === "Numero") {
            mySet.add(all?.file_number);
          }
          if (row === "Client" && all?.client?.name)
            mySet.add(all?.client?.name);
          if (row === "Product" && all?.product) mySet.add(all?.product);
          if (row === "Etat" && all?.state) mySet.add(all?.state);
          if (row === "Commercial" && all?.commercial?.name)
            mySet.add(all?.commercial?.name);
          if (row === "Reference" && all?.reference) mySet.add(all?.reference);
          if (row === "Code" && all?.code) mySet.add(all?.code);
          if (row === "Departement" && all?.department?.name)
            mySet.add(all?.department?.name);
          if (row === "Couleur" && all?.color) mySet.add(all?.color);

          if (row === "Forme" && all?.shape_id) {
            mySet.add(
              allShapes?.find((shape) => shape.id === all?.shape_id)?.reference
            );
          }

          if (row === "Cliché" && all?.printing_plate_id) {
            mySet.add(
              allPrintingPlates?.find(
                (printing: any) => printing.id === all?.printing_plate_id
              )?.name
            );
          }

          if (row === "Support" && all?.support) mySet.add(all?.support);
          if (row === "Détails" && all?.details) mySet.add(all?.details);
          if (row === "Format" && all?.format) mySet.add(all?.format);
          if (row === "N° des poses" && all?.pose_number)
            mySet.add(all?.pose_number);
          if (row === "1/3" && all?.part) mySet.add(all?.part);
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

  useEffect(() => {
    getAllShapes();
  }, []);

  const [isRefreshingFolder, setIsRefreshingFolder] = useState<boolean>(false);
  const [openRightMenu, setOpenRightMenu] = useState<boolean>(false);

  const makeOrderPrintingPlate = async (data: z.infer<typeof actionSchema>) => {
    setLoading(true);
    const { success } = await orderPrintingPlate(currentEntry as number);
    if (success) {
      showToast({
        type: "success",
        message: `Marqué comme commandé avec succès`,
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
    setOpenMarkIsPrintingPlateOrderedModal(false);
    reset();
  };

  const makeOrderShape = async (data: z.infer<typeof actionSchema>) => {
    setLoading(true);
    const { success } = await orderShape(currentEntry as number);

    if (success) {
      showToast({
        type: "success",
        message: `Marqué comme commandé avec succès`,
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
    setOpenMarkShapeIsOrderedModal(false);
    reset();
  };

  const makeReceivedShape = async (data: z.infer<typeof actionSchema>) => {
    setLoading(true);
    const { success } = await receivedShape(currentEntry as number);

    if (success) {
      showToast({
        type: "success",
        message: `Marqué comme commandé avec succès`,
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
    setOpenMarkShapeIsReceivedModal(false);
    reset();
  };

  const makeReceivedPrintingPlate = async (
    data: z.infer<typeof actionSchema>
  ) => {
    setLoading(true);
    const { success } = await receivedPrintingPlate(currentEntry as number);
    if (success) {
      showToast({
        type: "success",
        message: `Marqué comme commandé avec succès`,
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
    setOpenMarkIsPrintingPlateReceivedModal(false);
    reset();
  };

  return (
    <>
      <div
        className={`w-full overflow-hidden  h-full ${
          openRightMenu ? "flex gap-x-[10px]" : ""
        }`}
      >
        <div
          className={`overflow-auto ${
            openRightMenu ? "w-[calc(100%-80%)]" : "w-full"
          } h-full`}
        >
          {roleAdmin ? (
            <div className="w-full flex py-[10px] justify-end">
              <button
                disabled={!allFolders}
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
              {roleAdmin && !openRightMenu ? (
                <button
                  disabled={!allFolders}
                  type="button"
                  onClick={() => {
                    setOpenRightMenu((tmp) => !tmp);
                  }}
                  className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
                >
                  Clichés
                </button>
              ) : null}
            </div>
          ) : null}
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
                filterDatas={allFolders ? allFolders : []}
                dataHandler={setCurrentDatas}
                filterHandler={setFolders}
                onClick={async () => {
                  setIsRefreshingFolder(true);
                  const { allFolders } = await getAllFolders();
                  mutate(allFolders);
                  setIsRefreshingFolder(false);
                }}
              >
                <div className="w-[40px] h-[40px] flex items-center justify-center">
                  {isRefreshingFolder ? (
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
                list={status}
                filterDatas={allFolders ? allFolders : []}
                dataHandler={setCurrentDatas}
                filterHandler={setFolders}
              />
              {/* <Filter
            type="status"
            title={"Affichage par statut"}
            row={"Status"}
            index={"status_id"}
            list={status}
            filterDatas={allFolders ? allFolders : []}
            dataHandler={setCurrentDatas}
            filterHandler={setFolders}
          /> */}
              {/* <RenderDepartmentFilter /> */}
              <Filter
                type="search"
                title={"Recherche"}
                row={""}
                indexs={["code", "reference", "dim_lx_lh", "commercial.name"]}
                list={status}
                filterDatas={allFolders ? allFolders : []}
                dataHandler={setCurrentDatas}
                filterHandler={setFolders}
              />
              <Filter
                type="date"
                title={"Affichage par date"}
                row={"Status"}
                index={"status_id"}
                list={status}
                filterDatas={allFolders ? allFolders : []}
                dataHandler={setCurrentDatas}
                filterHandler={setFolders}
              />
              {/* {allFolders && allFolders?.length > 0 ? (
            <Export
              title="Exporter en csv"
              type="csv"
              entry={{
                headers: Object.keys(allFolders ? allFolders[0] : {})
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
                data: allFolders
                  ? allFolders?.map((shape) => ({
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
          ) : null} */}
            </div>
            <div className="relative w-full overflow-auto bg-white">
              {!allFolders ? (
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
                  <table className="w-full mb-[20rem] h-full relative">
                    <thead className="bg-white/50 transition">
                      <tr className="border-b bg-gray-50 cursor-pointer">
                        {tableHead?.map((head, index) => (
                          <th
                            key={index}
                            className={`relative w-fit ${
                              index === 0 ? "w-0" : "min-w-[300px] w-auto"
                            } text-[14px] py-[10px] font-medium  ${
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
                              <div
                                onClick={() => {
                                  if (
                                    [
                                      "Options",
                                      "Statut",
                                      "Date & Heure de création",
                                      "Date & Heure de mise à jour",
                                      "Forme commandé lé",
                                      "Cliché commandé lé",
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
                                    "Forme commandé lé",
                                    "Cliché commandé lé",
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
                                                  sortedBy ===
                                                  head.toLowerCase()
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
                                                  sortedBy ===
                                                  head.toLowerCase()
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
                                                  sortedBy ===
                                                  head.toLowerCase()
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
                                  "Forme commandé lé",
                                  "Cliché commandé lé",
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
                                        combineSearch.find(
                                          (cmb) => cmb.id === head
                                        )
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
                                "Forme commandé lé",
                                "Cliché commandé lé",
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
                                        //placeholder=""
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
                    <tbody className="bg-white/10 -z-[1]">
                      {[...(folders as any)]?.map((row: any, index: number) => {
                        const statut = status.find(
                          (st) => st.id === row?.status_id
                        );
                        return (
                          <tr
                            key={index}
                            onClick={() => goToDetail(row?.id)}
                            className={`cursor-pointer border-b transition-all relative duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              document.getElementById("dropdown")?.remove();
                              const dropdown = document.createElement("div");
                              dropdown.id = "dropdown";
                              dropdown.className =
                                "w-[200px] h-[200px] absolute";
                              const target = e.target as HTMLElement;
                              target.appendChild(dropdown);
                              const root = createRoot(dropdown);
                              setCurrentEntry(row?.id);
                              root.render(
                                <div className="bg-white w-[200px] z-[50] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
                                  <div className="flex flex-col items-center w-full">
                                    {roleAdmin ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenEditionModal(true);
                                        }}
                                        className="flex items-center justify-start w-full gap-[8px] py-[8px] px-[10px] rounded-t-[12px] cursor-pointer"
                                      >
                                        <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                                          Modifier les entrées
                                        </span>
                                      </button>
                                    ) : null}

                                    {/* <Export
                                  title="Télécharger le pdf"
                                  type="pdf"
                                  entry={{
                                    headers: [],
                                    data: folderInEntry,
                                  }}
                                /> */}

                                    <button
                                      type="button"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        goToDetail(row?.id);
                                      }}
                                      className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      {/* <DetailsIcon color={""} /> */}
                                      <span className="text-[14px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
                                        Voir les détails
                                      </span>
                                    </button>

                                    {roleAdmin ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenAssignToUserModal(true);
                                          }}
                                          className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                        >
                                          {/* <DetailsIcon color={""} /> */}
                                          <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                            Assigner à un utilisateur
                                          </span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMarkShapeIsOrderedModal(
                                              true
                                            );
                                          }}
                                          className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          {/* <DetailsIcon color={""} /> */}
                                          <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                            Forme commandé
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMarkIsPrintingPlateOrderedModal(
                                              true
                                            );
                                          }}
                                          className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          {/* <DetailsIcon color={""} /> */}
                                          <span className="text-[14px] text-left font-poppins text-grayscale-900 font-medium leading-[20px]">
                                            Cliché commandé
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMarkShapeIsReceivedModal(
                                              true
                                            );
                                          }}
                                          className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          {/* <DetailsIcon color={""} /> */}
                                          <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                            Forme reçu
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMarkIsPrintingPlateReceivedModal(
                                              true
                                            );
                                          }}
                                          className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          {/* <DetailsIcon color={""} /> */}
                                          <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                            Cliché reçu
                                          </span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenLockModal(true);
                                          }}
                                          className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                            {folderInEntry?.status_id === 3
                                              ? "Débloquer"
                                              : "Bloquer"}
                                          </span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenStandByModal(true);
                                          }}
                                          className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                            {folderInEntry?.status_id === 2
                                              ? "Enlever en standby"
                                              : "Mettre en standby"}
                                          </span>
                                        </button>
                                        {/* <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEndModal(true);
                                  }}
                                  className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                >
                                  <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                    Terminer
                                  </span>
                                </button> */}

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDelationModal(true);
                                          }}
                                          className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          <span className="text-[14px] text-left  text-red-500 font-medium font-poppins leading-[20px] ">
                                            Supprimer le dossier
                                          </span>
                                        </button>
                                      </>
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
                          >
                            <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]">
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
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[12px]"
                            >
                              <div
                                className={`flex w-fit justify-center py-[3px] px-[10px] font-medium rounded-full ${
                                  row?.shape_status === "shape_to_order"
                                    ? "bg-orange-200 text-orange-500"
                                    : row?.shape_status === "shape_received"
                                    ? "bg-green-200 text-green-500"
                                    : row?.shape_status === "shape_ordered"
                                    ? "bg-blue-200 text-blue-900"
                                    : "bg-gray-200 text-gray-900"
                                }`}
                              >
                                {row?.shape_status === "shape_to_order"
                                  ? "Forme à commander"
                                  : row?.shape_status === "shape_received"
                                  ? "Forme reçu"
                                  : row?.shape_status === "shape_ordered"
                                  ? "Forme commandé"
                                  : "Aucun"}
                              </div>
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[12px]"
                            >
                              <div
                                className={`flex w-fit justify-center py-[3px] px-[10px] font-medium rounded-full ${
                                  row?.plate_status === "plate_to_order"
                                    ? "bg-orange-200 text-orange-500"
                                    : row?.plate_status === "plate_received"
                                    ? "bg-green-200 text-green-500"
                                    : row?.plate_status === "plate_ordered"
                                    ? "bg-blue-200 text-blue-900"
                                    : "bg-gray-200 text-gray-900"
                                }`}
                              >
                                {row?.plate_status === "plate_to_order"
                                  ? "Cliché à commander"
                                  : row?.plate_status === "plate_received"
                                  ? "Cliché reçu"
                                  : row?.plate_status === "plate_ordered"
                                  ? "Cliché commandé"
                                  : "Aucun"}
                              </div>
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {formatTime(
                                new Date(row?.["shape_ordered_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}{" "}
                              {formatTime(
                                new Date(row?.["shape_ordered_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {formatTime(
                                new Date(row?.["shape_received_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}{" "}
                              {formatTime(
                                new Date(row?.["shape_received_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {formatTime(
                                new Date(row?.["plate_ordered_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}{" "}
                              {formatTime(
                                new Date(row?.["plate_ordered_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {formatTime(
                                new Date(row?.["plate_received_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}{" "}
                              {formatTime(
                                new Date(row?.["plate_received_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {
                                allShapes?.find(
                                  (shape) => shape.id === row?.shape_id
                                )?.reference
                              }
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {
                                allPrintingPlates?.find(
                                  (printing: any) =>
                                    printing.id === row?.printing_plate_id
                                )?.name
                              }
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] relative min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.file_number}
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.client?.name}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.reference}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.code}
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.commercial?.name}
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.state}
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.department?.name}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.product}
                            </td>

                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row.format}
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.color}
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {row?.support}
                            </td>
                            <td className="text-[#636363] min-w-[100px]  px-[20px] text-start font-poppins text-[14px]">
                              <div className="w-[200px] truncate">
                                {row?.details}
                              </div>
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {formatTime(
                                new Date(row?.["created_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}{" "}
                              {formatTime(
                                new Date(row?.["created_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>
                            <td
                              onClick={() => goToDetail(row?.id)}
                              className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                            >
                              {formatTime(
                                new Date(row?.["updated_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )}{" "}
                              {formatTime(
                                new Date(row?.["updated_at"]).getTime(),
                                "h:m",
                                "short"
                              )}
                            </td>
                            <td
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#636363] w-auto px-[20px] text-start font-poppins"
                            >
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
                                        {roleAdmin ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenEditionModal(true);
                                            }}
                                            className="flex items-center justify-start  w-full gap-[8px] py-[8px] px-[10px] rounded-t-[12px] cursor-pointer"
                                          >
                                            <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                                              Modifier les entrées
                                            </span>
                                          </button>
                                        ) : null}

                                        {/* <Export
                                      title="Télécharger le pdf"
                                      type="pdf"
                                      entry={{
                                        headers: [],
                                        data: folderInEntry,
                                      }}
                                    /> */}

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            goToDetail(row?.id);
                                          }}
                                          className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          {/* <DetailsIcon color={""} /> */}
                                          <span className="text-[14px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
                                            Voir les détails
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenAssignToUserModal(true);
                                          }}
                                          className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                        >
                                          {/* <DetailsIcon color={""} /> */}
                                          <span className="text-[14px]  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                            Assigner à un utilisateur
                                          </span>
                                        </button>

                                        {roleAdmin ? (
                                          <>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenAssignToUserModal(true);
                                              }}
                                              className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                            >
                                              {/* <DetailsIcon color={""} /> */}
                                              <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                                Assigner à un utilisateur
                                              </span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMarkShapeIsOrderedModal(
                                                  true
                                                );
                                              }}
                                              className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                            >
                                              {/* <DetailsIcon color={""} /> */}
                                              <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                                Forme commandé
                                              </span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMarkIsPrintingPlateOrderedModal(
                                                  true
                                                );
                                              }}
                                              className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                            >
                                              {/* <DetailsIcon color={""} /> */}
                                              <span className="text-[14px] text-left font-poppins text-grayscale-900 font-medium leading-[20px]">
                                                Cliché commandé
                                              </span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMarkShapeIsReceivedModal(
                                                  true
                                                );
                                              }}
                                              className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                            >
                                              {/* <DetailsIcon color={""} /> */}
                                              <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                                Forme reçu
                                              </span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMarkIsPrintingPlateReceivedModal(
                                                  true
                                                );
                                              }}
                                              className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                            >
                                              {/* <DetailsIcon color={""} /> */}
                                              <span className="text-[14px] text-left  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                                Cliché reçu
                                              </span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenLockModal(true);
                                              }}
                                              className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                            >
                                              <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                                {folderInEntry?.status_id === 3
                                                  ? "Débloquer"
                                                  : "Bloquer"}
                                              </span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenStandByModal(true);
                                              }}
                                              className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                            >
                                              <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                                {folderInEntry?.status_id === 2
                                                  ? "Enlever en standby"
                                                  : "Mettre en standby"}
                                              </span>
                                            </button>
                                            {/* <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEndModal(true);
                                  }}
                                  className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                >
                                  <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                    Terminer
                                  </span>
                                </button> */}

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDelationModal(true);
                                              }}
                                              className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                            >
                                              <span className="text-[14px] text-left  text-red-500 font-medium font-poppins leading-[20px] ">
                                                Supprimer le dossier
                                              </span>
                                            </button>
                                          </>
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
                  <div className="w-full bg-white/80 flex gap-x-[10px] justify-center items-center font-poppins font-medium leading-[20px] px-[20px] h-[60px]">
                    Aucune donnée
                    <Filter
                      type="button"
                      title={""}
                      row={""}
                      index={""}
                      list={[]}
                      filterDatas={allFolders ? allFolders : []}
                      dataHandler={setCurrentDatas}
                      filterHandler={setFolders}
                      onClick={() => {
                        setCombineSearch((tmp: any) => {
                          tmp.pop();
                          return [...tmp];
                        });
                      }}
                    >
                      <div className="w-[40px] h-[40px] flex items-center justify-center rounded-lg">
                        <CloseIcon />
                      </div>
                    </Filter>
                  </div>
                </motion.div>
              )}
            </div>
            {currentDatas?.length > 0 ? (
              <Pagination
                datas={currentDatas ? currentDatas : []}
                listHandler={setFolders}
              />
            ) : null}
          </motion.div>
        </div>
        {/* Cliché  */}
        <div
          className={`w-[80%] relative overflow-auto transition-[right] ${
            openRightMenu ? "right-0" : "right-[-100%]"
          } h-full bg-white border-l`}
        >
          <div className="w-full h-[80px] border-b p-[20px] flex items-center justify-between">
            <h1 className="font-medium text-[20px] font-poppins">Clichés</h1>
            <button
              type="button"
              onClick={() => {
                setOpenRightMenu((tmp) => !tmp);
              }}
              className="w-[30px] h-[30px] flex items-center justify-center border rounded-lg"
            >
              <CloseIcon size={14} color="black" />
            </button>
          </div>
          <div className="p-[20px]">
            <Form form={printingPlateForm} onSubmit={onSubmitPrintingPlate}>
              <h1 className="font-medium text-[18px] font-poppins mb-[10px]">
                Nouveau cliché
              </h1>
              <div className="flex gap-x-[10px] items-center">
                <div className="flex-1">
                  <BaseInput
                    label="Nom"
                    id="product"
                    type="text"
                    {...printingPlateForm.register("name")}
                  />
                </div>

                <div className="flex-1">
                  <BaseInput
                    label="Reference"
                    id="doc nnumber"
                    type="text"
                    {...printingPlateForm.register("ref")}
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
                    {printingPlateTableHead?.map((head, index) => (
                      <th
                        key={index}
                        className={`relative min-w-[200px] w-auto text-[14px] py-[10px] font-medium  ${
                          index > 0 && index < printingPlateTableHead.length
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
                              className={`w-fit h-[40px] flex items-center  ${
                                head === "Options"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {head}
                            </div>

                            {/* <div>
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
                            </div> */}
                          </div>
                          {/* <div>
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
                          </div> */}
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
                                <Form form={form} onSubmit={onSubmit}>
                                  <ComboboxMultiSelect
                                    //placeholder=""
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
                <tbody className="bg-white/10 -z-[1]">
                  {allPrintingPlates?.map((row: any, index: number) => {
                    const statut = status.find(
                      (st) => st.id === row?.status_id
                    );
                    return (
                      <tr
                        key={index}
                        // onClick={() => goToDetail(row?.id)}
                        className={`cursor-pointer border-b transition-all relative duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          document.getElementById("dropdown")?.remove();
                          const dropdown = document.createElement("div");
                          dropdown.id = "dropdown";
                          dropdown.className = "w-[200px] h-[200px] absolute";
                          const target = e.target as HTMLElement;
                          target.appendChild(dropdown);
                          const root = createRoot(dropdown);
                          setCurrentEntry(row?.id);
                          root.render(
                            <div className="bg-white w-[200px] z-[50] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
                              <div className="flex flex-col items-center w-full">
                                {/* <Export
                                  title="Télécharger le pdf"
                                  type="pdf"
                                  entry={{
                                    headers: [],
                                    data: folderInEntry,
                                  }}
                                /> */}

                                {roleAdmin ? (
                                  <>
                                    {/* <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPlateReceivedModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        Marquer comme recu
                                      </span>
                                    </button> */}

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPlateDelationModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <span className="text-[14px] text-red-500 font-medium font-poppins leading-[20px] ">
                                        Supprimer le cliché
                                      </span>
                                    </button>
                                  </>
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
                      >
                        {/* <td className="text-[#636363] relative min-w-[150px] w-auto px-[20px] text-start font-poppins text-[12px]">
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
                        </td> */}
                        <td className="text-[#636363] relative min-w-[100px]  px-[20px] text-start font-poppins text-[14px]">
                          {row?.code}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {row?.ref}
                        </td>

                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {row?.name}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {row?.is_ordered === 1 ? "Commandé" : "Non commandé"}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {row?.is_received === 1 ? "Recu" : "Non recu"}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {row?.received_at
                            ? formatTime(
                                new Date(row?.["ordered_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )
                            : null}
                        </td>

                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {row?.received_at
                            ? formatTime(
                                new Date(row?.["received_at"]).getTime(),
                                "d:mo:y",
                                "short"
                              )
                            : null}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {formatTime(
                            new Date(row?.["created_at"]).getTime(),
                            "d:mo:y",
                            "short"
                          )}{" "}
                          {formatTime(
                            new Date(row?.["created_at"]).getTime(),
                            "h:m",
                            "short"
                          )}
                        </td>
                        <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]">
                          {formatTime(
                            new Date(row?.["updated_at"]).getTime(),
                            "d:mo:y",
                            "short"
                          )}{" "}
                          {formatTime(
                            new Date(row?.["updated_at"]).getTime(),
                            "h:m",
                            "short"
                          )}
                        </td>
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#636363] w-auto px-[20px] text-start font-poppins"
                        >
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
                                    {/* <Export
                                      title="Télécharger le pdf"
                                      type="pdf"
                                      entry={{
                                        headers: [],
                                        data: folderInEntry,
                                      }}
                                    /> */}

                                    {roleAdmin ? (
                                      <>
                                        {/* <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPlateReceivedModal(true);
                                          }}
                                          className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                            Marquer comme recu
                                          </span>
                                        </button> */}

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPlateDelationModal(true);
                                          }}
                                          className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                        >
                                          <span className="text-[14px] text-red-500 font-medium font-poppins leading-[20px] ">
                                            Supprimer le cliché
                                          </span>
                                        </button>
                                      </>
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
          </div>
        </div>
      </div>

      <BaseModal open={openCreationModal} classname={""}>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-[calc(150vh)] h-[98vh]">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[20px] font-medium font-poppins text-[#060606]">
                Nouveau dossier
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
            <div className="flex flex-col justify-start w-full h-[calc(100%-130px)] overflow-scroll relative py-[10px] px-[20px]">
              <div className="w-full grid gap-[20px] grid-cols-3">
                {/* <ComboboxMultiSelect
                  label={"Département"}
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
                    // ?.filter((dep) => [1, 2].includes(dep.id))
                    ?.map((department: Department) => ({
                      value: department.id as unknown as string,
                      label: department.name,
                    }))}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={department}
                  setSelectedUniqElementInDropdown={setDepartment}
                  borderColor="border-grayscale-200"
                /> */}
                <ComboboxMultiSelect
                  label={"Client"}
                  // placeholder="Selectionnez un utilisateur"
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
                  // placeholder="Selectionnez un utilisateur"
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
                    users
                      ?.filter((user: User) => checkIfCommercial(user) && user)
                      ?.map((commercial: User) => ({
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

                <div className="flex flex-col gap-y-[10px]">
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
                    options={
                      allShapes?.map((shape: ShapeInterface) => ({
                        value: shape.id as unknown as string,
                        label: `${shape.code}`,
                      })) as []
                    }
                    error={undefined}
                    isUniq={true}
                    selectedElementInDropdown={shapes}
                    setSelectedUniqElementInDropdown={setShapes}
                    borderColor="border-grayscale-200"
                  />

                  <div className="flex justify-between font-poppins font-medium items-center">
                    <span className="text-[13px]">A commander</span>
                    <Switch
                      checked={shapeToOrdered}
                      onChange={setShapeToOrdered}
                      className={`${
                        shapeToOrdered ? "bg-blue-600" : "bg-gray-200"
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className="sr-only">Enable notifications</span>
                      <span
                        className={`${
                          shapeToOrdered
                            ? "translate-x-[1.30rem]"
                            : "translate-x-1"
                        } inline-block h-5 w-5 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </div>
                </div>

                <ComboboxMultiSelect
                  label={"Règle"}
                  // placeholder="Sélectionnez la règle a appliquer"
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
                <div className="flex flex-col gap-y-[10px]">
                  <ComboboxMultiSelect
                    label={"Cliché"}
                    // placeholder="Sélectionnez la règle a appliquer"
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
                    id={`cliche`}
                    options={allPrintingPlates?.map((printingPlate: any) => ({
                      value: printingPlate.id as unknown as string,
                      label: printingPlate.name as unknown as string,
                    }))}
                    error={undefined}
                    isUniq={true}
                    selectedElementInDropdown={selectedPrintingPlate}
                    setSelectedUniqElementInDropdown={setSelectedPrintingPlate}
                    borderColor="border-grayscale-200"
                  />
                  <div className="flex justify-between font-poppins font-medium items-center">
                    <span className="text-[13px]">A commander</span>
                    <Switch
                      checked={printingPlateToOrdered}
                      onChange={setPrintingPlateToOrdered}
                      className={`${
                        printingPlateToOrdered ? "bg-blue-600" : "bg-gray-200"
                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className="sr-only">Enable notifications</span>
                      <span
                        className={`${
                          printingPlateToOrdered
                            ? "translate-x-[1.30rem]"
                            : "translate-x-1"
                        } inline-block h-5 w-5 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </div>
                </div>

                <BaseInput
                  label="Produit"
                  id="product"
                  type="text"
                  {...form.register("product")}
                />

                <BaseInput
                  label="Numero de dossier"
                  id="doc nnumber"
                  type="text"
                  {...form.register("number")}
                />

                <BaseInput
                  label="Format"
                  id="format"
                  type="text"
                  {...form.register("format")}
                />

                <BaseInput
                  label="Reference"
                  id="reference"
                  type="text"
                  {...form.register("reference")}
                />
                <BaseInput
                  label="Support"
                  id="support"
                  type="text"
                  {...form.register("support")}
                />

                <BaseInput
                  label="Couleur"
                  id="color"
                  type="text"
                  {...form.register("color")}
                />

                <ComboboxMultiSelect
                  label={"Eat"}
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
                  id={`sate`}
                  options={states}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={state}
                  setSelectedUniqElementInDropdown={setState}
                  borderColor="border-grayscale-200"
                />
                <br />
              </div>
              <div className="flex gap-x-[10px] items-center">
                <BaseTextArea
                  label="Details"
                  id="details"
                  type="text"
                  {...form.register("details")}
                  // value={observation.text}
                />
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
          <div className="w-[calc(150vh)] h-[98vh]">
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
            <div className="flex flex-col justify-start w-full h-[calc(100%-130px)] overflow-scroll relative py-[10px] px-[20px]">
              <div className="w-full grid gap-[20px] grid-cols-3">
                {/* <ComboboxMultiSelect
                  label={"Département"}
                  // placeholder="Selectionnez un département"
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
                    // ?.filter((dep) => [1, 2].includes(dep.id))
                    ?.map((department: Department) => ({
                      value: department.id as unknown as string,
                      label: department.name,
                    }))}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={department}
                  setSelectedUniqElementInDropdown={setDepartment}
                  borderColor="border-grayscale-200"
                /> */}
                <ComboboxMultiSelect
                  label={"Client"}
                  // placeholder="Selectionnez un utilisateur"
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
                  // placeholder="Selectionnez un utilisateur"
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
                    users
                      ?.filter((user: User) => checkIfCommercial(user) && user)
                      ?.map((commercial: User) => ({
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
                  label={"Forme"}
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
                  options={
                    allShapes?.map((shape: ShapeInterface) => ({
                      value: shape.id as unknown as string,
                      label: `${shape.code}`,
                    })) as []
                  }
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={shapes}
                  setSelectedUniqElementInDropdown={setShapes}
                  borderColor="border-grayscale-200"
                />

                <ComboboxMultiSelect
                  label={"Cliché"}
                  // placeholder="Sélectionnez la règle a appliquer"
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
                  id={`cliche`}
                  options={allPrintingPlates?.map((printingPlate: any) => ({
                    value: printingPlate.id as unknown as string,
                    label: printingPlate.name as unknown as string,
                  }))}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={selectedPrintingPlate}
                  setSelectedUniqElementInDropdown={setSelectedPrintingPlate}
                  borderColor="border-grayscale-200"
                />

                <ComboboxMultiSelect
                  label={"Règle"}
                  // placeholder="Sélectionnez la règle a appliquer"
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

                <BaseInput
                  label="Numero de dossier"
                  id="doc nnumber"
                  // placeholder="Numero de dossier"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("number")}
                />

                <BaseInput
                  label="Produit"
                  id="product"
                  type="text"
                  {...form.register("product")}
                />

                <BaseInput
                  label="Format"
                  id="format"
                  // placeholder="Format"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("format")}
                />
                <BaseInput
                  label="Support"
                  id="support"
                  // placeholder="Support"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("support")}
                />

                <BaseInput
                  label="Couleur"
                  id="color"
                  // placeholder="Couleur"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("color")}
                />

                <ComboboxMultiSelect
                  label={"Eat"}
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
                  id={`sate`}
                  options={states}
                  error={undefined}
                  isUniq={true}
                  selectedElementInDropdown={state}
                  setSelectedUniqElementInDropdown={setState}
                  borderColor="border-grayscale-200"
                />
                <BaseInput
                  label="Reference"
                  id="reference"
                  // placeholder="Reference"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("reference")}
                />
                <br />
              </div>
              <div className="flex gap-x-[10px] items-center">
                <BaseTextArea
                  label="Details"
                  id="details"
                  // placeholder="Details"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("details")}
                  // value={observation.text}
                />
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

      <BaseModal open={openLockModal} classname={""}>
        <Form
          form={standByform}
          onSubmit={
            folderInEntry?.status_id !== 3 ? onSubmitLock : onSubmitUnlock
          }
        >
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  {folderInEntry?.status_id !== 3 ? "Bloquer" : "Débloquer"}
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  {`Vous êtes sur point de ${
                    folderInEntry?.status_id !== 3 ? "bloquer" : "débloquer"
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
                  folderInEntry?.status_id !== 3 ? "bloquer" : "débloquer"
                }  cette forme`}
                type="text"
                {...standByform.register("reason")}
              />
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
              >
                {loading ? (
                  <Spinner color={"#fff"} size={20} />
                ) : (
                  `${folderInEntry?.status_id !== 3 ? "Bloquer" : "Débloquer"}`
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

            <div className="p-[20px]">
              <BaseTextArea
                label="Description"
                id="description"
                placeholder="Décrivez cette tâche"
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
      {/*  */}

      <BaseModal open={openDelationModal} classname={""}>
        <div className="w-[calc(80vh)] h-auto overflow-auto">
          <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
            <div className="flex flex-col">
              <span className="text-[20px] font-poppins text-[#060606]">
                Confirmer la suppression
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                Vous êtes sur point de supprimer <br /> un dossier, cette action
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
                handledeleteFolder(currentEntry as unknown as number);
              }}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
            >
              {loading ? <Spinner color={"#fff"} size={20} /> : "Supprimer"}
            </button>
          </div>
        </div>
      </BaseModal>

      {/* standBy MODAL */}
      <BaseModal open={openStandByModal} classname={""}>
        <Form
          form={standByform}
          onSubmit={
            folderInEntry?.status_id !== 2 ? onSubmitStandBy : onSubmitResume
          }
        >
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  {folderInEntry?.status_id !== 2
                    ? "Mettre en standby"
                    : "Enlever en standby"}
                </span>
                <span className="text-[14px] font-poppins text-primary-black-leg-600">
                  {`Vous êtes sur point ${
                    folderInEntry?.status_id !== 2 ? " de mettre" : "d'enlever "
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
                placeholder={`Dites pourquoi vous ${
                  folderInEntry?.status_id !== 2
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
                ) : folderInEntry?.status_id !== 2 ? (
                  "Mettre en standBy"
                ) : (
                  "Enlever en standby"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      {/* MARQUÉ LA FORME COMMANDÉ */}
      <BaseModal open={openMarkShapeIsOrderedModal} classname={""}>
        <Form form={actionForm} onSubmit={makeOrderShape}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Marquer la forme comme commandé
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenMarkShapeIsOrderedModal(false)}
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
                {loading ? <Spinner color={"#fff"} size={20} /> : "Confirmer"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      {/* MARQUÉ LE CLICHÉ COMMANDÉ */}
      <BaseModal open={openMarkIsPrintingPlateOrderedModal} classname={""}>
        <Form form={actionForm} onSubmit={makeOrderPrintingPlate}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Marquer le cliché comme commandé
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenMarkIsPrintingPlateOrderedModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90 `}
              >
                {loading ? <Spinner color={"#fff"} size={20} /> : "Confirmer"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      {/* MARQUÉ LA FORME COMME REÇU */}
      <BaseModal open={openMarkShapeIsReceivedModal} classname={""}>
        <Form form={actionForm} onSubmit={makeReceivedShape}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Marquer la forme comme recu
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenMarkShapeIsReceivedModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90 `}
              >
                {loading ? <Spinner color={"#fff"} size={20} /> : "Confirmer"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      {/* MARQUÉ LE CLICHÉ COMME REÇU */}
      <BaseModal open={openMarkIsPrintingPlateReceivedModal} classname={""}>
        <Form form={actionForm} onSubmit={makeReceivedPrintingPlate}>
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Marquer le cliché comme recu
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setOpenMarkIsPrintingPlateReceivedModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              <button
                type="submit"
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90 `}
              >
                {loading ? <Spinner color={"#fff"} size={20} /> : "Confirmer"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      {/* Clichés Modal */}

      <BaseModal open={plateDelationModal} classname={""}>
        <div className="w-[calc(80vh)] h-auto overflow-auto">
          <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
            <div className="flex flex-col">
              <span className="text-[20px] font-poppins text-[#060606]">
                Confirmer la suppression
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                Vous êtes sur point de supprimer <br /> un cliché, cette action
                est definitive !
              </span>
            </div>
            <button
              disabled={loading}
              type="button"
              onClick={() => setPlateDelationModal(false)}
              className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
            <button
              type="button"
              onClick={() => {
                handledeletePrintingPlate(currentEntry as unknown as number);
              }}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
            >
              {loading ? <Spinner color={"#fff"} size={20} /> : "Supprimer"}
            </button>
          </div>
        </div>
      </BaseModal>

      <BaseModal open={plateReceivedModal} classname={""}>
        <Form
          form={standByform}
          onSubmit={onSubmitMarkAsReceivedPrintingPlates}
        >
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Marquer comme recu
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setPlateReceivedModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            {/* <div className="p-[20px]">
              <BaseInput
                label="Raison"
                id="reason"
                placeholder={` Dites pourquoi vous ${
                  folderInEntry?.status_id !== 2
                    ? "mettez en standBy"
                    : "enlevez en standby"
                } `}
                // leftIcon={<RulerIcon color={""} size={20} />}
                type="text"
                {...standByform.register("reason")}
              />
            </div> */}
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              {/* <button
                type="button"
                onClick={() => setOpenStandByModal((tmp) => !tmp)}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                Annuler
              </button> */}
              <button
                type="button"
                onClick={() => onSubmitMarkAsReceivedPrintingPlates()}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
              >
                {loading ? (
                  <Spinner color={"#fff"} size={20} />
                ) : (
                  "Marquer comme recu"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>

      <BaseModal open={plateReceivedModal} classname={""}>
        <Form
          form={standByform}
          onSubmit={onSubmitMarkAsReceivedPrintingPlates}
        >
          <div className="w-[calc(80vh)] h-auto overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
              <div className="flex flex-col">
                <span className="text-[20px] font-poppins text-[#060606]">
                  Commandé
                </span>
              </div>
              <button
                disabled={loading}
                type="button"
                onClick={() => setPlateReceivedModal(false)}
                className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            {/* <div className="p-[20px]">
              <BaseInput
                label="Raison"
                id="reason"
                placeholder={` Dites pourquoi vous ${
                  folderInEntry?.status_id !== 2
                    ? "mettez en standBy"
                    : "enlevez en standby"
                } `}
                // leftIcon={<RulerIcon color={""} size={20} />}
                type="text"
                {...standByform.register("reason")}
              />
            </div> */}
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
              {/* <button
                type="button"
                onClick={() => setOpenStandByModal((tmp) => !tmp)}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                Annuler
              </button> */}
              <button
                type="button"
                onClick={() => onSubmitMarkAsReceivedPrintingPlates()}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
              >
                {loading ? (
                  <Spinner color={"#fff"} size={20} />
                ) : (
                  "Marquer comme recu"
                )}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>
    </>
  );
};
