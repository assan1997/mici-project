"use client";
import { FC, useEffect, useMemo, useRef, useState } from "react";
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
import {
  createClient,
  getAllClients,
  deleteClient,
  updateClient,
} from "@/services/clients";
import { useToast } from "@/contexts/toast.context";
import { ClientEntry } from "@/services/clients";
import { formatTime } from "@/lib/utils/timestamp";
import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton } from "@/components/ui/loader/Skeleton";
import { motion } from "framer-motion";
export const Clients: FC<{}> = ({}) => {
  const userSchema = z.object({
    name: z.string(),
    departments: z.array(z.number()),
    user: z.number(),
  });
  const form = useForm({ schema: userSchema });
  const {
    users,
    clients,
    departments: allDepartments,
    dispatchClients,
  } = useData();
  const tableHead = [
    "Nom du client",
    "Nom du commercial",
    "Date de création",
    "Date de mise à jour",
    "Options",
  ];

  interface ComboSelect {
    label: string;
    value: string;
  }
  const [user, setUser] = useState<ComboSelect[]>([]);
  const [departments, setDepartments] = useState<ComboSelect[]>([]);

  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);

  const { showToast } = useToast();
  const reset = () => {
    form.setValue("name", "");
    form.setValue("user", 0);
    setCurrentEntry(undefined);
    setUser([]);
    setDepartments([]);
  };
  const onSubmit = async (data: z.infer<typeof userSchema>) => {
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
        createdClient.user = users?.find((use) => use.id === user);
        tmp?.unshift(createdClient);
        if (tmp) return [...tmp];
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
      console.log("error");
    }
  };
  const onSubmitUpdate = async (data: z.infer<typeof userSchema>) => {
    setLoading(true);
    let { name, departments } = data;
    name = name.trim();
    let user_id = user[0].value as unknown as number;
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
        return clients?.map((client: Client) =>
          client.id === currentEntry ? { ...updatedClient } : client
        ) as any;
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
      console.log("error");
    }
  };
  const { box, handleClick } = useActiveState();
  const clientInEntry = useMemo(() => {
    const client: Client | undefined = clients?.find(
      (client: Client) => client.id === currentEntry
    );
    return client;
  }, [currentEntry]);

  useEffect(() => {
    const client: Client | undefined = clients?.find(
      (client: Client) => client.id === currentEntry
    );
    if (client) {
      form.setValue("name", client?.name as string);
      const dep = client?.departments?.map((department: Department) => ({
        value: department.id,
        label: department.name,
      }));
      if (dep) setDepartments(dep as any);
      if (client.user) {
        
        const com = {
          value: client.user.id,
          label: client.user.name,
        };
        if (com) setUser([com as any]);
      }
    }
  }, [currentEntry]);

  useEffect(() => {
    form.setValue(
      "departments",
      departments?.map((department) => department.value as unknown as number)
    );
  }, [departments]);

  useEffect(() => {
    form.setValue("user", user[0]?.value as unknown as number);
  }, [user]);

  const renderAvatar = (avatar: string) => {
    return (
      <div className="w-[40px]  h-[40px] bg-slate-200 rounded-full relative"></div>
    );
  };

  const handleDeleteClient = async (id: number) => {
    // const { success } = await deleteClient(id);
    // if (!success) return;
    dispatchClients((clients: Client[] | undefined) => {
      return clients?.filter((client: Client) => client.id !== id && client);
    });
    setDelationModal(false);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCreationModal((tmp) => !tmp);
            reset();
          }}
          className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
        >
          Créer
          <EditIcon color="#E65F2B" />
        </button>
      </div>
      {/* overflow-auto  */}
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
        <div className="w-full bg-white/80 rounded-t-xl h-[60px] flex items-center justify-center border-b"></div>
        <div className="relative w-full scrollbar-hide">
          {!clients ? (
            <TableSkeleton head={tableHead} />
          ) : (
            <table className="w-full relative">
              <thead className="bg-white/50">
                <tr className="">
                  {tableHead?.map((head, index) => (
                    <th
                      key={index}
                      className={`font-poppins  ${
                        head === "options" ? "w-auto" : "min-w-[150px]"
                      } text-[13px] py-[10px] font-medium  ${
                        index > 0 && index < tableHead.length
                      }  text-[#2f2f2f]`}
                    >
                      <div
                        className={`h-full relative flex items-center  px-[20px] ${
                          head === "Options"
                            ? "justify-end text-end"
                            : "justify-start text-start"
                        } `}
                      >
                        {head}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/80">
                {clients?.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row?.name}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {row?.user?.name}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {formatTime(
                        new Date(row?.["created_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                    </td>
                    <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                      {formatTime(
                        new Date(row?.["updated_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                    </td>
                    <td className="text-[#2f2f2f] w-auto p-[10px] text-start font-poppins text-[13px]">
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
                            <div className="bg-white shadow-large h-auto border border-[#FFF] rounded-[12px] overlow-hidden relative">
                              <div className="flex flex-col items-center w-full">
                                <button
                                  type="button"
                                  onClick={() => setOpenEditionModal(true)}
                                  className="flex items-center w-full gap-[8px] py-[4px] px-[10px] rounded-t-[12px] cursor-pointer"
                                >
                                  <UpdateIcon color={""} />
                                  <span className="text-[14px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
                                    Modifier
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {}}
                                  className="flex items-center border-t w-full py-[4px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                >
                                  <DetailsIcon color={""} />
                                  <span className="text-[14px] font-poppins text-grayscale-900 font-medium leading-[20px] ">
                                    Détails
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDelationModal(true);
                                  }}
                                  className="flex items-center border-t w-full py-[4px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                >
                                  <DeleteUserIcon className={""} />
                                  <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
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
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="w-full bg-white/80 rounded-b-xl h-[60px]"></div>
      </motion.div>

      {/* CREATION MODAL */}
      <BaseModal open={openCreationModal} classname={""}>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-[calc(150vh)] h-[500px] overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[18px] font-poppins text-[#060606]">
                Création
              </span>
              <button
                type="button"
                onClick={() => setCreationModal(false)}
                className={`w-[30px] h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex flex-col justify-start w-full h-[calc(100%-130px)] relative py-[10px] px-[20px]">
              <div className="w-full grid gap-[8px] grid-cols-3">
                <BaseInput
                  label="Nom"
                  id="name"
                  placeholder="Nom du commercial"
                  type="text"
                  {...form.register("name")}
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
                  id={`departments`}
                  options={allDepartments?.map((department: Section) => ({
                    value: department.id as unknown as string,
                    label: department.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={departments}
                  setSelectedElementInDropdown={setDepartments}
                  borderColor="border-grayscale-200"
                />
              </div>
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center px-[20px] py-[10px] h-[80px] border-t">
              <button
                type="submit"
                // onClick={() => setCreationModal((tmp) => !tmp)}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                {loading ? <Spinner color={"#fff"} size={20} /> : "Enregistrer"}
              </button>
            </div>
          </div>
        </Form>
      </BaseModal>
      {/* EDITION MODAL */}
      <BaseModal open={openEditionModal} classname={""}>
        <Form form={form} onSubmit={onSubmitUpdate}>
          <div className="w-[calc(150vh)] h-[500px] overflow-auto">
            <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
              <span className="text-[18px] font-medium font-poppins text-[#060606]">
                Modification
              </span>
              <button
                type="button"
                onClick={() => setOpenEditionModal(false)}
                className={`w-[30px] h-[30px] flex items-center justify-center border rounded-full bg-white transition-all`}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex flex-col justify-start w-full h-[calc(100%-130px)] relative py-[10px] px-[20px]">
              <div className="w-full grid gap-[8px] grid-cols-3">
                <BaseInput
                  label="Nom"
                  id="name"
                  placeholder="Nom du commercial"
                  type="text"
                  {...form.register("name")}
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
                  id={`departments`}
                  options={allDepartments?.map((department: Section) => ({
                    value: department.id as unknown as string,
                    label: department.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={departments}
                  setSelectedElementInDropdown={setDepartments}
                  borderColor="border-grayscale-200"
                />
              </div>
            </div>
            <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center px-[20px] py-[10px] h-[80px] border-t">
              <button
                type="submit"
                // onClick={() => setCreationModal((tmp) => !tmp)}
                className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
              >
                {loading ? (
                  <Spinner color={"#fff"} size={20} />
                ) : (
                  " Mettre à jour"
                )}
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
                Vous êtes sur point de supprimer <br /> un client, cette action
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
