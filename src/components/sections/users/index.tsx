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
import { BaseInput } from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import { Department, Section, useData, User } from "@/contexts/data.context";
import Image from "next/image";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import { createUser, deleteUser, updateUser } from "@/services/users";
import { useToast } from "@/contexts/toast.context";
import { UserEntry } from "@/services/users";
import { formatTime } from "@/lib/utils/timestamp";
import { Spinner } from "@/components/ui/loader/spinner";
import { TableSkeleton } from "@/components/ui/loader/Skeleton";
import { motion } from "framer-motion";
import { Filter } from "@/components/ui/filter";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
export const Users: FC<{}> = ({}) => {
  const userSchema = z.object({
    name: z.string(),
    departments: z.array(z.number()),
    sections: z.array(z.number()),
    email: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });
  const form = useForm({ schema: userSchema });
  const {
    users,
    sections: allSections,
    departments: allDepartments,
    dispatchUsers,
    refreshTaskData,
    onRefreshingUsers,
    loadUsers,
  } = useData();
  const tableHead = [
    "Avatar",
    "Nom",
    "Email",
    "Date de création",
    "Date de mise à jour",
    // "Role",
    // "Departements",
    // "Sections",
    "Options",
  ];

  const [sections, setSections] = useState<{ label: string; value: string }[]>(
    []
  );
  const [departments, setDepartments] = useState<
    { label: string; value: string }[]
  >([]);
  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);
  const [openDelationModal, setDelationModal] = useState<boolean>(false);
  const [currentEntry, setCurrentEntry] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const { showToast } = useToast();
  const reset = () => {
    form.setValue("name", "");
    form.setValue("password", "");
    form.setValue("email", "");
    form.setValue("departments", []);
    form.setValue("sections", []);
    setCurrentEntry(undefined);
    setSections([]);
    setDepartments([]);
  };
  const onSubmit = async (data: z.infer<typeof userSchema>) => {
    setLoading(true);
    let { name, departments, sections, email, password } = data;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    const { data: createdUser, success } = await createUser({
      name,
      department_ids: departments,
      email,
      password,
      section_ids: sections,
    });
    if (success) {
      showToast({
        message: "Crée avec succès",
        type: "success",
        position: "top-center",
      });
      dispatchUsers((tmp) => {
        createdUser.departments = allDepartments.filter(
          (dep) => departments.includes(dep.id) && dep
        );
        createdUser.sections = allDepartments.filter(
          (sec) => sections.includes(sec.id) && sec
        );
        tmp?.unshift(createdUser);

        if (tmp) return [...tmp];
      });
      reset();
      setCreationModal(false);
    } else {
      console.log("error");
    }
    setLoading(false);
  };

  const onSubmitUpdate = async (data: z.infer<typeof userSchema>) => {
    setLoading(true);
    let { name, departments, sections, email, password } = data;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    const entry: UserEntry = {
      name,
      department_ids: departments,
      email,
      password,
      section_ids: sections,
    };

    if (JSON.stringify(entry.name) === JSON.stringify(userInEntry?.name))
      delete entry.name;
    if (JSON.stringify(entry.email) === JSON.stringify(userInEntry?.email))
      delete entry.email;
    if (
      JSON.stringify(entry.password) === JSON.stringify(userInEntry?.password)
    )
      delete entry.password;
    if (
      JSON.stringify(entry.department_ids) ===
      JSON.stringify(userInEntry?.departments.map((dep) => dep.id))
    )
      delete entry.department_ids;
    if (
      JSON.stringify(entry.section_ids) ===
      JSON.stringify(userInEntry?.sections.map((sec) => sec.id))
    )
      delete entry.section_ids;
    if (entry?.password?.length === 0) delete entry.password;
    const { data: updatedUser, success } = await updateUser(
      currentEntry as number,
      entry
    );
    if (success) {
      showToast({
        message: "Crée avec succès",
        type: "success",
        position: "top-center",
      });
      dispatchUsers((users): User[] => {
        updatedUser.departments = allDepartments.filter(
          (dep) => departments.includes(dep.id) && dep
        );
        updatedUser.sections = allDepartments.filter(
          (sec) => sections.includes(sec.id) && sec
        );
        return users?.map((user: User) =>
          user.id === currentEntry ? { ...updatedUser } : user
        ) as any;
      });
      setOpenEditionModal(false);
    } else {
      showToast({
        message: "L'opération à échouée",
        type: "danger",
        position: "top-center",
      });
      console.log("error");
    }
    setLoading(false);
  };

  const { box, handleClick } = useActiveState();
  const userInEntry = useMemo(() => {
    const user: User | undefined = users?.find(
      (user: User) => user.id === currentEntry
    );
    return user;
  }, [currentEntry]);

  useEffect(() => {
    const user: User | undefined = users?.find(
      (user: User) => user.id === currentEntry
    );
    if (user) {
      form.setValue("name", user?.name as string);
      form.setValue("email", user?.email as string);
      const dep = user?.departments?.map((department: Department) => ({
        value: department.id,
        label: department.name,
      }));
      if (dep) setDepartments(dep as any);
      const sec = user?.sections?.map((section: Department) => ({
        value: section.id,
        label: section.name,
      }));
      if (sec) setSections(sec as any);
    }
  }, [currentEntry]);

  useEffect(() => {
    form.setValue(
      "departments",
      departments.map((department) => department.value as unknown as number)
    );
  }, [departments]);

  useEffect(() => {
    form.setValue(
      "sections",
      sections.map((section) => section.value as unknown as number)
    );
  }, [sections]);

  const renderAvatar = (avatar: string) => {
    return (
      <div className="w-[30px] h-[30px] bg-slate-200 rounded-full relative"></div>
    );
  };

  const handleDeleteUser = async (id: number) => {
    const { success } = await deleteUser(id);
    if (!success) return;
    dispatchUsers((users) => {
      return users?.filter((user: User) => user.id !== id && user) as any;
    });
    setDelationModal(false);
  };
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [currentDatas, setCurrentDatas] = useState<any[]>(users ? users : []);

  useEffect(() => {
    setCurrentDatas(users ? users : []);
  }, [users]);

  const Router = useRouter();

  const goToDetail = (id: any) => {
    Router.push(`/workspace/details/users/${id}`);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          disabled={!users}
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
        className=""
      >
        <div className="relative w-full bg-white/10 z-50 gap-x-[4px] flex items-center h-[60px] justify-start">
          <Filter
            type="button"
            title={""}
            row={""}
            index={""}
            list={[]}
            filterDatas={users ? users : []}
            dataHandler={setCurrentDatas}
            filterHandler={setAllUsers}
            onClick={() => {
              refreshTaskData();
            }}
          >
            {onRefreshingUsers ? (
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
          {/* <RenderDepartmentFilter /> */}

          <Filter
            type="search"
            title={"Recherche"}
            row={""}
            indexs={["code", "reference", "dim_lx_lh", "commercial.name"]}
            list={[]}
            filterDatas={users ? users : []}
            dataHandler={setCurrentDatas}
            filterHandler={setAllUsers}
          />
          {/* <Filter
            type="date"
            title={"Affichage par date"}
            row={"Status"}
            index={"status_id"}
            list={status}
            filterDatas={allOffsetShapes ? allOffsetShapes : []}
            dataHandler={setCurrentDatas}
            filterHandler={setOffsetShapes}
          /> */}
          {/* {allOffsetShapes && allOffsetShapes?.length > 0 ? (
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
                  ? allOffsetShapes.map((shape) => ({
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
          {/* <Export
            title="Télécharger le pdf"
            type="pdf"
            entry={{ headers: [], data: [] }}
          /> */}
        </div>
        <div className="relative w-full scrollbar-hide bg-white">
          {allUsers ? (
            <table className="w-full mb-[15rem] relative">
              <thead className="bg-white/50 transition">
                <tr className="border-b bg-gray-50 cursor-pointer">
                  {tableHead.map((head, index) => (
                    <th
                      key={index}
                      className={`font-poppins  ${
                        head === "options" ? "w-auto" : "min-w-[150px]"
                      } text-[13px] py-[10px] font-medium  ${
                        index > 0 && index < tableHead.length
                      }  text-[#000000]`}
                    >
                      <div
                        className={`relative flex items-center h-[40px] gap-x-[10px] px-[20px] ${
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
              <tbody className="bg-white/10">
                {allUsers?.map((row, index) => (
                  <tr
                    key={index}
                    className={`cursor-pointer border-b transition-all duration hover:bg-gray-100 checked:hover:bg-gray-100`}
                  >
                    <td
                      onClick={() => goToDetail(row?.id)}
                      className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                    >
                      {renderAvatar(row?.avatar)}
                    </td>
                    <td
                      onClick={() => goToDetail(row?.id)}
                      className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                    >
                      {row.name}
                    </td>
                    <td
                      onClick={() => goToDetail(row?.id)}
                      className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]"
                    >
                      {row?.email}
                    </td>
                    <td className="text-[#636363] min-w-[100px] px-[20px] text-start font-poppins text-[13px]">
                      {formatTime(
                        new Date(row?.["created_at"]).getTime(),
                        "d:mo:y",
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
                    </td>
                    {/* <td className="text-[#636363] w-auto px-[10px] text-start font-poppins text-[13px]">
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
                    </td> */}

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
                                {/* <button
                                  type="button"
                                  onClick={() => {
                                    setOpenAssignToUserModal(true);
                                  }}
                                  className="flex items-center border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer"
                                >
                                 
                                  <span className="text-[14px]  font-poppins text-grayscale-900 font-medium leading-[20px]">
                                    Assigner à un utilisateur
                                  </span>
                                </button> */}
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
                                {/* <button
                                  type="button"
                                  onClick={() => {
                                    setOpenLockModal(true);
                                  }}
                                  className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                >
                                
                                  <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                    {row.status_id === 3
                                      ? "Débloquer"
                                      : "Bloquer"}
                                  </span>
                                </button> */}
                                {/* 
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenStandByModal(true);
                                  }}
                                  className="flex items-center justify-start border-t w-full py-[8px] gap-[8px] px-[10px] rounded-b-[12px] cursor-pointer"
                                >
                                
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
                                  <span className="text-[14px] text-grayscale-900 font-medium font-poppins leading-[20px] ">
                                    Terminer
                                  </span>
                                </button> */}
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
                                  <span className="text-[14px] text-red-500 font-medium font-poppins leading-[20px] ">
                                    {`Supprimer l'utilisateur`}
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
          ) : (
            <TableSkeleton head={tableHead} />
          )}

          {currentDatas.length > 0 ? (
            <Pagination
              datas={currentDatas ? currentDatas : []}
              listHandler={setAllUsers}
            />
          ) : null}
        </div>
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
                  placeholder="Nom de l'utilisateur"
                  type="text"
                  {...form.register("name")}
                />
                <BaseInput
                  label="Email"
                  id="email"
                  placeholder="Email"
                  type="text"
                  {...form.register("email")}
                />
                <BaseInput
                  label="Mot de passe"
                  id="password"
                  placeholder="Mot de passe"
                  type="text"
                  {...form.register("password")}
                />
                <ComboboxMultiSelect
                  label={"Départements"}
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
                  id={`department`}
                  options={allDepartments?.map((department: Section) => ({
                    value: department.id as unknown as string,
                    label: department.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={departments}
                  setSelectedElementInDropdown={setDepartments}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Sections"}
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
                  id={`sections`}
                  options={allSections?.map((section: Section) => ({
                    value: section.id as unknown as string,
                    label: section.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={sections}
                  setSelectedElementInDropdown={setSections}
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
                Enregistrer
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
              <span className="text-[18px] font-poppins text-[#060606]">
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
                  placeholder="Nom de l'utilisateur"
                  type="text"
                  {...form.register("name")}
                />
                <BaseInput
                  label="Email"
                  id="email"
                  placeholder="Email"
                  type="text"
                  {...form.register("email")}
                />
                <BaseInput
                  label="Mot de passe"
                  id="password"
                  placeholder="Mot de passe"
                  type="text"
                  {...form.register("password")}
                />
                <ComboboxMultiSelect
                  label={"Départements"}
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
                  id={`department`}
                  options={allDepartments?.map((department: Section) => ({
                    value: department.id as unknown as string,
                    label: department.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={departments}
                  setSelectedElementInDropdown={setDepartments}
                  borderColor="border-grayscale-200"
                />
                <ComboboxMultiSelect
                  label={"Sections"}
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
                  id={`sections`}
                  options={allSections?.map((section: Section) => ({
                    value: section.id as unknown as string,
                    label: section.name,
                  }))}
                  error={undefined}
                  selectedElementInDropdown={sections}
                  setSelectedElementInDropdown={setSections}
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
                  "Mettre à jour"
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
                Vous êtes sur point de supprimer <br /> un utilisateur cette
                action est definitive !
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
                handleDeleteUser(currentEntry as unknown as number);
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
