"use client";
import { FC, useMemo, useState } from "react";
import BaseDropdown from "@/components/ui/dropdown/BaseDropdown";
import BaseModal from "@/components/ui/modal/BaseModal";
import Link from "next/link";
import { EditIcon, FolderIcon, RulerIcon } from "@/components/svg";
import BaseInput from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
export const Users: FC<{}> = ({}) => {
  const meetLink = z.object({
    number: z.number(),
    client: z.string(),
    state: z.string(),
    product: z.string(),
    manufacturing: z.string(),
    format: z.string(),
    color: z.string(),
    support: z.string(),
    commercial: z.string(),
    details: z.string(),
    rules: z.string(),
  });
  const form = useForm({ schema: meetLink });
  const data = [
    {
      Code: "001",
      Client: "John Doe",
      Produit: "Produit A",
      Fabrication: "Fabrique XYZ",
      Forme: "Cylindrique",
      References: "REF1234",
      Règle: "Règle A",
      Status: "En cours",
      Countdown: "12:34:56",
      "Date & Heure d’entrée": "2024-08-10 08:30",
      "Date & Heure Finition": "2024-08-10 12:30",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "002",
      Client: "Jane Smith",
      Produit: "Produit B",
      Fabrication: "Fabrique ABC",
      Forme: "Rectangulaire",
      References: "REF5678",
      Règle: "Règle B",
      Status: "Complété",
      Countdown: "00:00:00",
      "Date & Heure d’entrée": "2024-08-09 14:00",
      "Date & Heure Finition": "2024-08-09 18:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "003",
      Client: "Alice Johnson",
      Produit: "Produit C",
      Fabrication: "Fabrique DEF",
      Forme: "Sphérique",
      References: "REF9101",
      Règle: "Règle C",
      Status: "En attente",
      Countdown: "24:00:00",
      "Date & Heure d’entrée": "2024-08-11 10:00",
      "Date & Heure Finition": "2024-08-11 16:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "004",
      Client: "Michael Brown",
      Produit: "Produit D",
      Fabrication: "Fabrique GHI",
      Forme: "Ovale",
      References: "REF1122",
      Règle: "Règle D",
      Status: "En cours",
      Countdown: "18:45:00",
      "Date & Heure d’entrée": "2024-08-10 09:00",
      "Date & Heure Finition": "2024-08-10 15:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "005",
      Client: "Emily Davis",
      Produit: "Produit E",
      Fabrication: "Fabrique JKL",
      Forme: "Carrée",
      References: "REF3344",
      Règle: "Règle E",
      Status: "Complété",
      Countdown: "00:00:00",
      "Date & Heure d’entrée": "2024-08-09 13:30",
      "Date & Heure Finition": "2024-08-09 17:30",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "006",
      Client: "Chris Wilson",
      Produit: "Produit F",
      Fabrication: "Fabrique MNO",
      Forme: "Triangulaire",
      References: "REF5566",
      Règle: "Règle F",
      Status: "En attente",
      Countdown: "36:00:00",
      "Date & Heure d’entrée": "2024-08-12 07:00",
      "Date & Heure Finition": "2024-08-12 13:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "007",
      Client: "Sophia Martinez",
      Produit: "Produit G",
      Fabrication: "Fabrique PQR",
      Forme: "Hexagonale",
      References: "REF7788",
      Règle: "Règle G",
      Status: "En cours",
      Countdown: "15:30:00",
      "Date & Heure d’entrée": "2024-08-10 10:00",
      "Date & Heure Finition": "2024-08-10 16:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "008",
      Client: "David Lee",
      Produit: "Produit H",
      Fabrication: "Fabrique STU",
      Forme: "Pentagonale",
      References: "REF9900",
      Règle: "Règle H",
      Status: "Complété",
      Countdown: "00:00:00",
      "Date & Heure d’entrée": "2024-08-09 16:00",
      "Date & Heure Finition": "2024-08-09 20:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "009",
      Client: "Isabella Garcia",
      Produit: "Produit I",
      Fabrication: "Fabrique VWX",
      Forme: "Octogonale",
      References: "REF1010",
      Règle: "Règle I",
      Status: "En attente",
      Countdown: "48:00:00",
      "Date & Heure d’entrée": "2024-08-11 12:00",
      "Date & Heure Finition": "2024-08-11 18:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
    {
      Code: "010",
      Client: "James Rodriguez",
      Produit: "Produit J",
      Fabrication: "Fabrique YZA",
      Forme: "Hexagonale",
      References: "REF1212",
      Règle: "Règle J",
      Status: "En cours",
      Countdown: "20:00:00",
      "Date & Heure d’entrée": "2024-08-10 11:00",
      "Date & Heure Finition": "2024-08-10 17:00",
      "Date & Heure Validation": "2024-08-10 12:00",
      options: "Modifier | Supprimer",
    },
  ];

  const tableHead = [
    "Code",
    "Client",
    "Produit",
    "Fabrication",
    "Forme",
    "References",
    "Règle",
    "Status",
    "Countdown",
    "Date & Heure d’entrée",
    "Date & Heure Finition",
    "Date & Heure Validation",
    "options",
  ];

  const [openDropdown, setDropdown] = useState<boolean>(false);

  const onSubmit = () => {};
  const [openCreationModal, setCreationModal] = useState<boolean>(false);
  const openModal = () => {};

  return (
    <div className="w-full h-full">
      <div className="w-full flex py-[10px] justify-end">
        <button
          type="button"
          onClick={() => setCreationModal((tmp) => !tmp)}
          className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
        >
          Créer
          <EditIcon color="#E65F2B" />
        </button>
      </div>
      <div className="w-full bg-white/80  rounded-t-xl h-[60px] flex items-center justify-center border-b"></div>
      <div className="relative w-full overflow-auto scrollbar-hide">
        <table className="w-full relative">
          <thead className="bg-white/50">
            <tr className="">
              {tableHead.map((head, index) => (
                <th
                  key={index}
                  className={`font-poppins  ${
                    head === "options" ? "w-auto" : "min-w-[150px]"
                  } text-[13px] py-[10px] font-medium  ${
                    index > 0 && index < tableHead.length
                  }  text-[#2f2f2f]`}
                >
                  <div className="h-full relative flex items-center text-start px-[10px] justify-start">
                    {head}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/80">
            {data.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Code}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Client}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Produit}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Fabrication}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Forme}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.References}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Règle}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Status}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row.Countdown}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row["Date & Heure d’entrée"]}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row["Date & Heure Finition"]}
                </td>
                <td className="text-[#2f2f2f] min-w-[100px] p-[10px] text-start font-poppins text-[13px]">
                  {row["Date & Heure Validation"]}
                </td>
                <td className="text-[#2f2f2f] w-auto p-[10px] text-start font-poppins text-[13px]">
                  <div className="w-full h-full flex items-center justify-end">
                    <BaseDropdown
                      dropdownOrigin="top-left"
                      isActive={openDropdown}
                      setIsActive={setDropdown}
                      otherStyles={"w-[240px]"}
                      buttonContent={
                        <div>
                          <div
                            className={`h-[44px] flex items-center justify-center`}
                          >
                            <svg
                              enableBackground="new 0 0 32 32"
                              height="24"
                              viewBox="0 0 32 32"
                              width="24"
                              xmlns="http://www.w3.org/2000/svg"
                              id="fi_2893795"
                            >
                              <g id="options">
                                <path
                                  fill="#2f2f2f"
                                  d="m13 8c0-1.654 1.346-3 3-3s3 1.346 3 3-1.346 3-3 3-3-1.346-3-3zm3 5c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"
                                ></path>
                              </g>
                            </svg>
                          </div>
                        </div>
                      }
                    >
                      <div className="">
                        <ul className="border-y border-primary-black-leg-50 ">
                          <li>
                            <div className="flex items-center gap-[8px] p-[10px] cursor-pointer sm:hover:bg-primary-black-leg-50 ">
                              <span className="block text-start text-[14px] leading-[20px] font-[500]  ">
                                {"Rentrée"}
                              </span>
                            </div>
                          </li>
                          <li>
                            <div className="flex items-center gap-[8px] p-[10px] cursor-pointer sm:hover:bg-primary-black-leg-50 ">
                              <span className="block text-start text-[14px] leading-[20px] font-[500]  ">
                                {"Terminé"}
                              </span>
                            </div>
                          </li>
                          <li>
                            <Link href={"/developer/api"}>
                              <div className="flex items-center gap-[8px] p-[10px] cursor-pointer  sm:hover:bg-primary-black-leg-50 ">
                                <span className="block text-start text-[14px] leading-[20px] font-[500]  ">
                                  {"Validé"}
                                </span>
                              </div>
                            </Link>
                          </li>
                        </ul>
                        <button
                          // onClick={async () => {
                          //   await logout();
                          //   ROUTER.push("/auth/login");
                          // }}
                          className="flex w-full items-center gap-[8px] p-[10px] cursor-pointer  sm:hover:bg-primary-black-leg-50 "
                        >
                          <div className="w-[20px] h-[20px] shrink-0 flex items-center justify-center ">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 1.66699V10.0003M15.3 5.53366C16.3487 6.58265 17.0627 7.91903 17.3519 9.37382C17.6411 10.8286 17.4924 12.3365 16.9247 13.7068C16.357 15.0771 15.3957 16.2483 14.1624 17.0723C12.9291 17.8963 11.4791 18.3361 9.99585 18.3361C8.5126 18.3361 7.06265 17.8963 5.82933 17.0723C4.59602 16.2483 3.63472 15.0771 3.06699 13.7068C2.49926 12.3365 2.35059 10.8286 2.63978 9.37382C2.92897 7.91903 3.64304 6.58265 4.69169 5.53366"
                                stroke="black"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <span className="block text-start text-[14px] leading-[20px] font-[500]">
                            {"Déconnexion"}
                          </span>
                        </button>
                      </div>
                    </BaseDropdown>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full bg-white/80 rounded-b-xl h-[60px]"></div>
      <BaseModal open={openCreationModal} classname={""}>
        <div className="w-[calc(100vh)] h-[500px] overflow-auto">
          <div className="w-full bg-white/80 rounded-t-xl h-[50px] flex items-center justify-between px-[20px] py-[10px] border-b">
            <span className="font-[16px] font-poppins text-[#060606]">
              Nouveau dossier
            </span>
            <button
              onClick={() => setCreationModal(false)}
              className={`w-[38px] h-[38px] flex items-center justify-center border rounded-full bg-white transition-all`}
            >
              <span className={``}>
                <svg
                  id="fi_2961937"
                  height="14"
                  viewBox="0 0 64 64"
                  width="14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m4.59 59.41a2 2 0 0 0 2.83 0l24.58-24.58 24.59 24.58a2 2 0 0 0 2.83-2.83l-24.59-24.58 24.58-24.59a2 2 0 0 0 -2.83-2.83l-24.58 24.59-24.59-24.58a2 2 0 0 0 -2.82 2.82l24.58 24.59-24.58 24.59a2 2 0 0 0 0 2.82z"></path>
                </svg>
              </span>
            </button>
          </div>
          <div className="flex flex-col justify-center w-full h-[calc(100%-130px)] relative py-[10px] px-[20px]">
            <Form form={form} onSubmit={onSubmit}>
              <div className="w-full grid gap-[8px] grid-cols-3">
                <BaseInput
                  label="N° Dossier"
                  id="number"
                  placeholder="N° Dossier"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="number"
                  {...form.register("number")}
                />
                <BaseInput
                  label="Client"
                  id="client"
                  placeholder="Client"
                  // leftIcon={<RulerIcon color={""} size={20} />}
                  type="text"
                  {...form.register("client")}
                />
                <BaseInput
                  label="State"
                  id="state"
                  placeholder="Etat"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("state")}
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
                  id="manufacturing"
                  placeholder="Fabrication"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("manufacturing")}
                />

                <BaseInput
                  label="Format"
                  id="format"
                  placeholder="Format"
                  // leftIcon={<RulerIcon color={""} size={0} />}
                  type="text"
                  {...form.register("format")}
                />
                <BaseInput
                  label="Couleurs"
                  id="color"
                  placeholder="Couleurs"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("color")}
                />
                <BaseInput
                  label="Support"
                  id="support"
                  placeholder="Support"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("support")}
                />
                <BaseInput
                  label="Commercial"
                  id="commercial"
                  placeholder="Commercial"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("commercial")}
                />
                <BaseInput
                  label="Détails"
                  id="details"
                  placeholder="Détails"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("details")}
                />
                <BaseInput
                  label="Règles"
                  id="rules"
                  placeholder="Règles"
                  // leftIcon={<FolderIcon size={18} color={""} />}
                  type="text"
                  {...form.register("rules")}
                />
              </div>
            </Form>
          </div>
          <div className="w-full bg-white/80 rounded-b-xl flex justify-end items-center px-[20px] py-[10px] h-[80px] border-t">
            <button
              type="button"
              onClick={() => setCreationModal((tmp) => !tmp)}
              className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};
