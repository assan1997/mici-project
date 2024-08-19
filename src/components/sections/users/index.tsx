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
import BaseInput from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import { Department, Section, useData, User } from "@/context/data.context";
import Image from "next/image";
import MenuDropdown from "@/components/ui/dropdown/MenuDropdown";
import useActiveState from "@/lib/hooks/useActiveState";
import ComboboxMultiSelect from "@/components/ui/select/comboBoxMultiSelect";
import { createUser, deleteUser, updateUser } from "@/services/users";
import { useToast } from "@/context/toast.context";
import { UserEntry } from "@/services/users";
import { formatTime } from "@/lib/utils/timestamp";
export const Users: FC<{}> = ({ }) => {
  const userSchema = z.object({
    name: z.string(),
    departments: z.array(z.number()),
    sections: z.array(z.number()),
    email: z.string(),
    password: z.string(),
  });
  const form = useForm({ schema: userSchema });
  const {
    users,
    sections: allSections,
    departments: allDepartments,
    dispatchUsers,
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

  const { showToast } = useToast();
  const reset = () => {
    form.setValue('name', '');
    form.setValue('password', '');
    form.setValue('email', '');
    form.setValue('departments', []);
    form.setValue('sections', []);
    setCurrentEntry(undefined);
    setSections([]);
    setDepartments([]);
  }
  const onSubmit = async (data: z.infer<typeof userSchema>) => {
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
        message: "Utilisateur a été crée",
        type: "success",
        position: "bottom-left",
      });
      dispatchUsers((tmp) => {
        createdUser.departments = allDepartments.filter((dep) => departments.includes(dep.id) && dep)
        createdUser.sections = allDepartments.filter((sec) => sections.includes(sec.id) && sec)
        tmp.unshift(createdUser);
        return [...tmp];
      });
      reset();
      setCreationModal(false);
    } else {
      console.log("error");
    }
  };

  const onSubmitUpdate = async (data: z.infer<typeof userSchema>) => {
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
    if (
      entry?.password?.length === 0
    )
      delete entry.password;

    const { data: updatedUser, success } = await updateUser(
      currentEntry as number,
      entry
    );

    if (success) {
      showToast({
        message: "Utilisateur a été crée",
        type: "success",
        position: "bottom-left",
      });
      dispatchUsers((users): User[] => {
        updatedUser.departments = allDepartments.filter((dep) => departments.includes(dep.id) && dep)
        updatedUser.sections = allDepartments.filter((sec) => sections.includes(sec.id) && sec)
        return users.map((user: User) => user.id === currentEntry ? ({ ...updatedUser }) : user)
      })
      setOpenEditionModal(false);
    } else {
      console.log("error");
    }
  };

  const { box, handleClick } = useActiveState();
  const userInEntry = useMemo(() => {
    const user: User | undefined = users.find(
      (user: User) => user.id === currentEntry
    );
    return user;
  }, [currentEntry]);

  useEffect(() => {
    const user: User | undefined = users.find(
      (user: User) => user.id === currentEntry
    );

    if (user) {
      form.setValue('name', user?.name as string);
      form.setValue('email', user?.email as string);
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
  }, [currentEntry])

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
      <div className="w-[40px]  h-[40px] bg-slate-200 rounded-full relative"></div>
    );
  };

  const handleDeleteUser = async (id: number) => {
    const { success } = await deleteUser(id);
    if (!success) return;
    dispatchUsers((users) => {
      return users.filter((user: User) => user.id !== id && user);
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
      <div className="w-full bg-white/80 rounded-t-xl h-[60px] flex items-center justify-center border-b"></div>
      <div className="relative w-full scrollbar-hide">
        <table className="w-full relative">
          <thead className="bg-white/50">
            <tr className="">
              {tableHead.map((head, index) => (
                <th
                  key={index}
                  className={`font-poppins  ${head === "options" ? "w-auto" : "min-w-[150px]"
                    } text-[13px] py-[10px] font-medium  ${index > 0 && index < tableHead.length
                    }  text-[#2f2f2f]`}
                >
                  <div
                    className={`h-full relative flex items-center  px-[20px] ${head === "Options"
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
            {users.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                  {renderAvatar(row?.avatar)}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                  {row.name}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                  {row?.email}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                  {formatTime(new Date(row?.["created_at"]).getTime(), "d:mo:y", "short")}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[20px] text-start font-poppins text-[13px]">
                  {formatTime(new Date(row?.["updated_at"]).getTime(), "d:mo:y", "short")}
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
                            <button type="button" onClick={() => { }} className="flex items-center border-t w-full py-[4px] gap-[8px] px-[10px] rounded-b-[12px]  cursor-pointer">
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
      </div>
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
                Mettre à jour
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
                alert(currentEntry);
                handleDeleteUser(currentEntry as unknown as number);
              }}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-red-500 bg-red-500/90 `}
            >
              Supprimer
            </button>
          </div>
        </div>
      </BaseModal>
      <div className="w-full bg-white/80 rounded-b-xl h-[60px]"></div>
    </div>
  );
};
