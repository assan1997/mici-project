"use client";
import { FC, useEffect, useState } from "react";
import { CSVLink } from "react-csv";

/* eslint-disable @next/next/no-img-element */
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatTime } from "@/lib/utils/timestamp";
import BaseModal from "@/components/ui/modal/BaseModal";
import { createRoot } from "react-dom/client";

export const Export: FC<{
  title: string;
  type: "csv" | "pdf";
  entry: {
    headers: { label: string; key: string }[];
    data: any;
  };
  onClick?: () => void;
}> = ({ title, type, entry, onClick }) => {
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
  }, [entry.data?.code]);

  const [openModal, setModal] = useState<boolean>(false);

  if (type === "csv") {
    return (
      <CSVLink data={entry?.data} headers={entry?.headers}>
        <div className="h-[40px] shrink-0 text-[13px] min-w-[150px]  bg-white gap-x-[4px] text-[#000] font-poppins font-medium leading-[20px] rounded-[14px] flex items-center justify-center px-[8px] border">
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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick ? onClick() : null;
        }}
        className="flex items-center justify-start w-full text-[14px] font-medium text-[#000] font-poppins leading-[20px gap-[8px] py-[8px] px-[10px] rounded-t-[12px] cursor-pointer"
      >
        {title}
      </button>
    );
  }

  return null;
};
