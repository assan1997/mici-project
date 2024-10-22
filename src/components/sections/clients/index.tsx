"use client";
import {
  FC,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
} from "@/components/svg";
import { BaseInput, BaseTextArea } from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import {
  Client,
  Department,
  Section,
  useData,
  User,
} from "@/contexts/data.context";
import Image from "next/image";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import { createClient, deleteClient, updateClient } from "@/services/clients";
import { useToast } from "@/contexts/toast.context";
import { ClientEntry } from "@/services/clients";
import { formatTime } from "@/lib/utils/timestamp";
import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton } from "@/components/ui/loader/Skeleton";
import { motion } from "framer-motion";
import { Filter } from "@/components/ui/filter";
import { Pagination } from "@/components/ui/pagination";

import { useRouter } from "next/navigation";
import { createRoot } from "react-dom/client";
export const Clients: FC<{}> = ({}) => {
  const {
    users,
    clients: allClients,
    departments: allDepartments,
    dispatchClients,
    onRefreshingData,
    refreshClientsData,
    status,
    getClients,
  } = useData();

  useEffect(() => {
    getClients();
  }, []);

  const clientSchema = z.object({
    name: z.string(),
    departments: z.array(z.number()),
    user: z.number(),
  });

  const editClientSchema = z.object({
    name: z.string(),
    departments: z.array(z.number()),
    user: z.number(),
  });
  const form = useForm({ schema: clientSchema });
  const editForm = useForm({ schema: editClientSchema });

  const tableHead = [
    "Client",
    "Commercial",
    "Départements",
    "Date & heure de création",
    "Date & heure de mise à jour",
    "Options",
  ];
  interface ComboSelect {
    label: string;
    value: string;
  }

  const [commercial, setCommercial] = useState<ComboSelect[]>([]);
  const [departments, setDepartments] = useState<ComboSelect[]>([]);
  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [clients, setClients] = useState<any[]>();
  const [currentDatas, setCurrentDatas] = useState<any[]>();

  useEffect(() => {
    setCurrentDatas(allClients);
  }, [allClients]);

  const { showToast } = useToast();
  const reset = () => {
    form.setValue("name", "");
    form.setValue("user", 0);
    setCurrentEntry(undefined);
    setCommercial([]);
    setDepartments([]);
  };
  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    setLoading(true);
    let { name, departments, user } = data;
    name = name.trim();
    let user_id = user;
    let department_ids = departments;
    const { data: createdClient, success } = await createClient({
      name,
      department_ids,
      user_id,
    });
    if (success) {
      showToast({
        message: "Crée avec succès",
        type: "success",
        position: "top-center",
      });
      dispatchClients((tmp) => {
        createdClient.departments = allDepartments.filter(
          (dep) => departments.includes(dep.id) && dep
        );

        createdClient.sections = allDepartments.filter(
          (dep) => departments.includes(dep.id) && dep
        );
        createdClient.user = users?.find((use) => use.id === user);
        return [{ ...createdClient }, ...(tmp as [])];
      });
      reset();
      setCreationModal(false);
      setLoading(false);
    } else {
      showToast({
        message: "L'opération à e",
        type: "danger",
        position: "top-center",
      });
      setLoading(false);
      //console.log("error");
    }
  };

  const onSubmitUpdate = async (data: z.infer<typeof editClientSchema>) => {
    setLoading(true);
    let { name, departments } = data;
    name = name.trim();
    let user_id = commercial[0].value as unknown as number;
    const entry: ClientEntry = {
      name,
      user_id,
      department_ids: departments,
    };
    if (JSON.stringify(entry.name) === JSON.stringify(clientInEntry?.name))
      delete entry.name;
    if (
      !entry.user_id ||
      JSON.stringify(entry.user_id) === JSON.stringify(clientInEntry?.user?.id)
    )
      delete entry.user_id;
    if (
      !entry.department_ids ||
      JSON.stringify(entry.department_ids) ===
        JSON.stringify(clientInEntry?.departments?.map((dep) => dep.id))
    )
      delete entry.department_ids;
    const { data: updatedClient, success } = await updateClient(
      currentEntry as number,
      entry
    );

    if (success) {
      showToast({
        message: "Modifié avec succès",
        type: "success",
        position: "top-center",
      });

      dispatchClients((clients): Client[] => {
        updatedClient.departments = allDepartments.filter(
          (dep) => departments.includes(dep.id) && dep
        );
        updatedClient.user = users?.find((user) => user.id === user_id);
        return [
          ...(clients?.map((commercial: Client) =>
            commercial.id === currentEntry
              ? { ...updatedClient }
              : { ...commercial }
          ) as any),
        ];
      });
      setOpenEditionModal(false);
      setLoading(false);
    } else {
      showToast({
        message: "L'opération à échouée",
        type: "danger",
        position: "top-center",
      });
      setLoading(false);
      //console.log("error");
    }
  };
  const { box, handleClick } = useActiveState();

  const clientInEntry = useMemo(() => {
    const commercial: Client | undefined = clients?.find(
      (commercial: Client) => commercial.id === currentEntry
    );
    return commercial;
  }, [currentEntry]);

  useEffect(() => {
    const commercial: Client | undefined = clients?.find(
      (commercial: Client) => commercial.id === currentEntry
    );
    if (commercial) {
      editForm.setValue("name", commercial?.name as string);
      const dep = commercial?.departments?.map((department: Department) => ({
        value: department.id,
        label: department.name,
      }));
      if (dep) setDepartments(dep as any);
      if (commercial.user) {
        const com = {
          value: commercial.user.id,
          label: commercial.user.name,
        };
        if (com) setCommercial([com as any]);
      }
    }
  }, [currentEntry]);

  useEffect(() => {
    editForm.setValue(
      "departments",
      departments?.map((department) => department.value as unknown as number)
    );
    form.setValue(
      "departments",
      departments?.map((department) => department.value as unknown as number)
    );
  }, [departments]);

  useEffect(() => {
    editForm.setValue("user", commercial[0]?.value as unknown as number);
    form.setValue("user", commercial[0]?.value as unknown as number);
  }, [commercial]);

  const handleDeleteClient = async (id: number) => {
    setLoading(true);
    try {
      const { success } = await deleteClient(id);
      if (!success) return;
      dispatchClients((clients: Client[] | undefined) => {
        return [
          ...(clients?.filter(
            (commercial: Client) => commercial.id !== id && commercial
          ) as []),
        ];
      });
      setDelationModal(false);
    } catch (error) {}
    setLoading(false);
  };

  const [sortedBy, setSortedBY] = useState<string>("");
  const [combineSearch, setCombineSearch] = useState<any[]>([]);
  let combo: any = [];

  const handleCombineSearch = () => {
    combineSearch?.map((item) => {
      if (item.id === "Code" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape.code === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Client" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) =>
            shape?.commercial?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Reference" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape?.reference === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Commercial" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) =>
            shape?.commercial?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Departement" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) =>
            shape?.department?.name === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions LxLxH" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape?.dim_lx_lh === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions Carré" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape?.dim_square === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Dimensions Plaque" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape?.dim_plate === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "Type Papier" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape?.paper_type === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "N° des poses" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape?.pose_number === item?.selectedValues[0]?.value
        );
      }

      if (item.id === "1/3" && item?.selectedValues.length > 0) {
        combo = (combo.length === 0 ? allClients : combo)?.filter(
          (shape: any) => shape?.part === item?.selectedValues[0]?.value
        );
      }
    });

    setCurrentDatas(combo);
  };

  useEffect(() => {
    if (combineSearch.some((cmb) => cmb.selectedValues.length > 0)) {
      handleCombineSearch();
    } else setCurrentDatas(allClients as any);
  }, [combineSearch]);

  const Router = useRouter();

  const goToDetail = (id: any) => {
    Router.push(`/workspace/details/clients/${id}`);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          disabled={!allClients}
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
            filterDatas={allClients ? allClients : []}
            dataHandler={setCurrentDatas}
            filterHandler={setClients}
            onClick={() => {
              refreshClientsData();
            }}
          >
            {onRefreshingData ? (
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </Filter>

          <Filter
            type="search"
            title={"Recherche"}
            row={""}
            indexs={["code", "reference", "dim_lx_lh", "commercial.name"]}
            list={status}
            filterDatas={allClients ? allClients : []}
            dataHandler={setCurrentDatas}
            filterHandler={setClients}
          />
        </div>
        <div className="relative w-full overflow-auto bg-white">
          {!allClients ? (
            <TableSkeleton head={tableHead} />
          ) : currentDatas && currentDatas?.length > 0 ? (
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
                        className={`w-fit ${
                          index === 0 ? "w-0" : "min-w-[100px]"
                        } text-[14px] py-[10px] font-medium  ${
                          index > 0 && index < tableHead.length
                        }  text-[#000000]`}
                      >
                        <div
                          className={`h-full font-poppins relative flex items-center text-start gap-x-[10px] px-[20px] ${
                            head === "Options" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {head}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white/10">
                  {clients?.map((row, index) => {
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
                          const root = createRoot(dropdown);
                          setCurrentEntry(row?.id);
                          root.render(
                            <div className="bg-white w-[200px] shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
                              <div className="flex flex-col items-center w-full">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenEditionModal(true);
                                  }}
                                  className="flex items-center justify-start w-full gap-[8px] py-[8px] px-[10px] rounded-t-[12px] cursor-pointer"
                                >
                                  {/* <UpdateIcon color={""} /> */}
                                  <span className="text-[14px] text-[#000] font-poppins font-medium leading-[20px]">
                                    Modifier les entrées
                                  </span>
                                </button>

                                {/* <Export
                                                          title="Télécharger le pdf"
                                                          type="pdf"
                                                          entry={{
                                                            headers: [],
                                                            data: row,
                                                          }}
                                                        /> */}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    goToDetail(row?.id);
                                  }}
                                  className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                >
                                  {/* <DetailsIcon color={""} /> */}
                                  <span className="text-[14px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
                                    Voir les détails
                                  </span>
                                </button>
                                {/* <button
                                                          type="button"
                                                          onClick={() => {
                                                            setOpenLockModal(true);
                                                          }}
                                                          className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                                        >
                                                          <DeleteShapeIcon color={""} />
                                                          <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                                            {row.status_id === 3
                                                              ? "Débloquer"
                                                              : "Bloquer"}
                                                          </span>
                                                        </button> */}

                                {/* <button
                                                          type="button"
                                                          onClick={() => {
                                                            setOpenStandByModal(true);
                                                          }}
                                                          className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                                        >
                                                          <DeleteShapeIcon color={""} />
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
                                                          <DeleteShapeIcon color={""} />
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
                                  <span className="text-[14px] text-red-500 font-medium font-poppins leading-[20px] ">
                                    Supprimer
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
                        className={`cursor-pointer border-b transition-all duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                      >
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] relative min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                        >
                          {row?.name}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
                        >
                          {row?.user?.name}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] w-[300px] px-[20px] text-start font-poppins text-[14px]"
                        >
                          {row?.departments?.map((department: any) => (
                            <Fragment key={department?.id}>
                              <span className="inline-block my-[4px]">
                                {department?.name}
                              </span>
                              <br />
                            </Fragment>
                          ))}
                        </td>
                        <td
                          onClick={() => goToDetail(row?.id)}
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
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
                          className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[14px]"
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

                                    {/* <Export
                                      title="Télécharger le pdf"
                                      type="pdf"
                                      entry={{
                                        headers: [],
                                        data: row,
                                      }}
                                    /> */}

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
                                    {/* <button
                                      type="button"
                                      onClick={() => {
                                        setOpenLockModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <DeleteShapeIcon color={""} />
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        {row.status_id === 3
                                          ? "Débloquer"
                                          : "Bloquer"}
                                      </span>
                                    </button> */}

                                    {/* <button
                                      type="button"
                                      onClick={() => {
                                        setOpenStandByModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <DeleteShapeIcon color={""} />
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
                                      <DeleteShapeIcon color={""} />
                                      <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                        Terminer
                                      </span>
                                    </button> */}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDelationModal(true);
                                      }}
                                      className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                    >
                                      <span className="text-[14px] text-red-500 font-medium font-poppins leading-[20px] ">
                                        Supprimer
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
                  filterDatas={allClients ? allClients : []}
                  dataHandler={setCurrentDatas}
                  filterHandler={setClients}
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
        {currentDatas && currentDatas?.length > 0 ? (
          <Pagination
            datas={currentDatas ? currentDatas : []}
            listHandler={setClients}
          />
        ) : null}
      </motion.div>
      <BaseModal open={openCreationModal} classname={""}>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-[calc(150vh)] h-[98vh]">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[18px] font-medium font-poppins text-[#060606]">
                Nouveau client
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
                <BaseInput
                  label="Nom du commercial"
                  id="name"
                  placeholder="Entrer un nom de client"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("name")}
                />
                <ComboboxMultiSelect
                  label={"Départements"}
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
                  id={`departements`}
                  options={allDepartments?.map((department: Department) => ({
                    value: department.id as unknown as string,
                    label: department.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={departments}
                  setSelectedElementInDropdown={setDepartments}
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
                <br />
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
      <BaseModal open={openEditionModal} classname={""}>
        <Form form={editForm} onSubmit={onSubmitUpdate}>
          <div className="w-[calc(150vh)] h-[98vh]">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[18px] font-medium font-poppins text-[#060606]">
                Modifier client
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
              <div className="w-full grid gap-[8px] grid-cols-3">
                <BaseInput
                  label="Nom du client"
                  id="name"
                  placeholder="Entrer un nom de client"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...editForm.register("name")}
                />
                <ComboboxMultiSelect
                  label={"Départements"}
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
                  id={`departements`}
                  options={allDepartments?.map((department: Department) => ({
                    value: department.id as unknown as string,
                    label: department.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={departments}
                  setSelectedElementInDropdown={setDepartments}
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
                <br />
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
      <BaseModal open={openDelationModal} classname={""}>
        <div className="w-[calc(80vh)] h-auto overflow-auto">
          <div className="w-full bg-white/80 rounded-t-xl h-auto flex items-start justify-between px-[20px] py-[10px] border-b">
            <div className="flex flex-col">
              <span className="text-[18px] font-poppins text-[#060606]">
                Confirmer la suppression
              </span>
              <span className="text-[14px] font-poppins text-primary-black-leg-600">
                Vous êtes sur point de supprimer <br /> un client cette action
                est definitive !
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDelationModal(false)}
              className={`w-[30px] shrink-0 h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center gap-x-[8px] px-[20px] py-[10px] h-[80px]">
            {/* <button
              type="button"
              onClick={() => setDelationModal((tmp) => !tmp)}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
            >
              Annuler
            </button> */}
            <button
              type="button"
              onClick={() => {
                handleDeleteClient(currentEntry as unknown as number);
              }}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
            >
              {loading ? <Spinner color={"#fff"} size={20} /> : "Supprimer"}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};
