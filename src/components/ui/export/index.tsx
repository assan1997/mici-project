"use client";
import { FC, useEffect } from "react";
import { CSVLink } from "react-csv";

/* eslint-disable @next/next/no-img-element */
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatTime } from "@/lib/utils/timestamp";

export const Export: FC<{
  title: string;
  type: "csv" | "pdf";
  entry: {
    headers: { label: string; key: string }[];
    data: any;
  };
}> = ({ title, type, entry }) => {
  // Create styles
  // Create Document Component

  const handleDownloadPDF = async () => {
    const element: any = document.getElementById("ficheEtude");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const customWidth = 210; // largeur en mm
    const customHeight = 297; // hauteur en mm

    const pdf = new jsPDF("portrait", "mm", [customWidth, customHeight]);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Fiche_etude_prototype.pdf");
  };

  useEffect(() => {
    const embed = document.getElementsByTagName("iframe");
    console.log("entry.data?.code", entry.data?.code);
  }, [entry.data?.code]);

  if (type === "csv") {
    return (
      <CSVLink data={entry?.data} headers={entry?.headers}>
        <div className="h-[40px] shrink-0 text-[14px] min-w-[150px] shadow-custom bg-white gap-x-[4px] text-[#000] font-poppins leading-[20px] rounded-[20px] flex items-center justify-center px-[8px] border">
          <svg
            fill="none"
            height={16}
            width={16}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            id="fi_6847526"
          >
            <path
              d="m2.85902 2.87697 12.56998-1.795c.071-.01018.1433-.00498.212.01523.0688.02021.1324.05496.1865.1019.0542.04695.0976.10498.1274.17018.0297.06519.0451.13602.0451.20769v20.84603c0 .0715-.0154.1423-.0451.2074s-.073.1231-.127.17c-.0541.0469-.1176.0817-.1862.102s-.1408.0256-.2117.0156l-12.57198-1.795c-.23838-.034-.4565-.1528-.61431-.3347-.1578-.1818-.24468-.4145-.24469-.6553v-16.26603c.00001-.24079.08689-.47349.24469-.65536.15781-.18186.37593-.30069.61431-.33464zm1.141 1.858v14.53003l9.99998 1.429v-17.38803zm12.99998 14.26503h3v-14.00003h-3v-2h4c.2652 0 .5196.10536.7071.29289.1876.18754.2929.44189.2929.70711v16.00003c0 .2652-.1053.5195-.2929.7071-.1875.1875-.4419.2929-.7071.2929h-4zm-6.8-7 2.8 4h-2.4l-1.59998-2.286-1.6 2.286h-2.4l2.8-4-2.8-4.00003h2.4l1.6 2.28603 1.59998-2.28603h2.4z"
              fill="rgb(0,0,0)"
            ></path>
          </svg>
          {title}
        </div>
      </CSVLink>
    );
  }

  if (type === "pdf") {
    return (
      <>
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="flex items-center justify-start w-full text-[14px] text-[#000] font-poppins font-medium leading-[20px gap-[8px] py-[8px] px-[10px] rounded-t-[12px] cursor-pointer"
        >
          {title}
        </button>
        <div className="fixed top-0 left-[500%]">
          <div
            className="w-[794px] h-[1123px] bg-white border mx-auto p-[20px] flex flex-col justify-between"
            id="ficheEtude"
          >
            <div>
              {/* Header */}
              <div className="border h-[100px] grid grid-cols-4">
                <div className="flex items-center justify-center">
                  <div className="h-[80%] w-[80%] relative">
                    <img
                      src={`/assets/logo/logo-red.png`}
                      alt="logo"
                      className="object-contain h-full w-full"
                    />
                  </div>
                </div>
                <div className="col-span-2 border-x">
                  <div className="h-[50px] border-b text-center">
                    <h2 className="uppercase text-black text-[18px] font-bold">
                      {`Fiche d'étude prototype`}
                    </h2>
                  </div>
                  <div className="h-[50px] text-center">
                    <h2 className="uppercase text-black text-[18px] font-bold">
                      {`Cartonnerie`}
                    </h2>
                  </div>
                </div>
                <div className="">
                  <div className="h-[50px] border-b p-2">
                    <h2 className="text-black text-[14px]">
                      {`Date: ${formatTime(
                        new Date().getTime(),
                        "d:mo:y",
                        "short"
                      )}`}
                    </h2>
                  </div>
                  <div className="h-[50px] p-2">
                    <h2 className="text-black text-[14px]">
                      {`Code: ${entry.data?.code}`}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Renseigments généraux */}
              <div className="mt-[30px] border p-2">
                <h2 className="uppercase text-center text-black text-[16px] font-semibold mb-[10px]">
                  {`Renseigments généraux`}
                </h2>
                <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Client: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {entry.data?.client?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Commercial: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {entry.data?.commercial?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Réference: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {entry.data?.reference}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Date: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {formatTime(
                        new Date(entry.data?.["created_at"]).getTime(),
                        "d:mo:y",
                        "short"
                      )}
                      {" à "}
                      {formatTime(
                        new Date(entry.data?.["created_at"]).getTime(),
                        "h:m",
                        "short"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {`Type d'emballage: `}
                    </span>
                    <span className="text-black text-[14px]">
                      {`--------------------------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Code: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {entry.data?.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Renseigments techniques */}
              <div className="mt-[20px] border p-2">
                <h2 className="uppercase text-center text-black text-[16px] font-semibold mb-[10px]">
                  {`Renseigments techniques`}
                </h2>
                <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Dimensions intérieures: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {entry.data?.dim_lx_lh}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Jonction du carton: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`----------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Code grammage: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`----------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Format de la plaque: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {entry.data?.dim_plate}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {`Grammage (en g): `}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Surface de la plaque (en m2): "}
                    </span>
                    <span className="text-black text-[14px]">
                      {entry.data?.dim_square}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {`Box Compression Test (en kg): `}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Poids théorique (en kg): "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* footer */}
            <div>
              <div className="border grid grid-cols-3">
                <div className="p-2 !pb-[20px] space-y-[10px]">
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Réalisé par: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Date: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Visa: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                </div>
                <div className="p-2 !pb-[20px] space-y-[10px] border-x">
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Vérifié par: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Date: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Visa: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                </div>
                <div className="p-2 !pb-[20px] space-y-[10px]">
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Réçu par: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Date: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                  <div className="flex items-center gap-x-[10px]">
                    <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                      {"Visa: "}
                    </span>
                    <span className="text-black text-[14px]">
                      {`---------`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-end mt-[10px] mb-[35px]">
                <div className="">
                  <h2 className="text-black text-[14px] uppercase font-[600]">
                    {`T.S.V.P`}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};
