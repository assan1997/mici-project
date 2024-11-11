import { formatTime } from "@/lib/utils/timestamp";
import React, { useEffect, useMemo } from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DOC = () => {
  const entry = useMemo(
    () => JSON.parse(localStorage.getItem("doc-entry") as string),
    []
  );
  useEffect(() => {
    console.log("entry", entry);
  }, [entry]);

  const handlePrintPDF = async () => {
    const element: any = document.getElementById("ficheEtude");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const customWidth = 210; // largeur en mm
    const customHeight = 297; // hauteur en mm

    const pdf = new jsPDF("portrait", "mm", [customWidth, customHeight]);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

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

  if (entry?.docType === "offset-shape-pdf")
    return (
      <OffsetShapePDF
        handlePrintPDF={handlePrintPDF}
        handleDownloadPDF={handleDownloadPDF}
        entry={entry}
      />
    );
  if (entry?.docType === "cartonnerie-shape-pdf")
    return (
      <CartonnerieShapePDF
        handlePrintPDF={handlePrintPDF}
        handleDownloadPDF={handleDownloadPDF}
        entry={entry}
      />
    );

  return null;
};

const OffsetShapePDF = ({
  handleDownloadPDF,
  handlePrintPDF,
  entry,
}: {
  handleDownloadPDF: () => void;
  handlePrintPDF: () => void;
  entry: any;
}) => {
  return (
    <div className="">
      <div className="p-[20px] flex justify-end">
        <button
          onClick={() => handlePrintPDF()}
          className={`w-fit h-[48px] text-white transition-all text-[14px] font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
        >
          Imprimer le document
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 7V5.2C18 4.0799 18 3.51984 17.782 3.09202C17.5903 2.71569 17.2843 2.40973 16.908 2.21799C16.4802 2 15.9201 2 14.8 2H9.2C8.0799 2 7.51984 2 7.09202 2.21799C6.71569 2.40973 6.40973 2.71569 6.21799 3.09202C6 3.51984 6 4.0799 6 5.2V7M6 18C5.07003 18 4.60504 18 4.22354 17.8978C3.18827 17.6204 2.37962 16.8117 2.10222 15.7765C2 15.395 2 14.93 2 14V11.8C2 10.1198 2 9.27976 2.32698 8.63803C2.6146 8.07354 3.07354 7.6146 3.63803 7.32698C4.27976 7 5.11984 7 6.8 7H17.2C18.8802 7 19.7202 7 20.362 7.32698C20.9265 7.6146 21.3854 8.07354 21.673 8.63803C22 9.27976 22 10.1198 22 11.8V14C22 14.93 22 15.395 21.8978 15.7765C21.6204 16.8117 20.8117 17.6204 19.7765 17.8978C19.395 18 18.93 18 18 18M15 10.5H18M9.2 22H14.8C15.9201 22 16.4802 22 16.908 21.782C17.2843 21.5903 17.5903 21.2843 17.782 20.908C18 20.4802 18 19.9201 18 18.8V17.2C18 16.0799 18 15.5198 17.782 15.092C17.5903 14.7157 17.2843 14.4097 16.908 14.218C16.4802 14 15.9201 14 14.8 14H9.2C8.0799 14 7.51984 14 7.09202 14.218C6.71569 14.4097 6.40973 14.7157 6.21799 15.092C6 15.5198 6 16.0799 6 17.2V18.8C6 19.9201 6 20.4802 6.21799 20.908C6.40973 21.2843 6.71569 21.5903 7.09202 21.782C7.51984 22 8.07989 22 9.2 22Z"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => handleDownloadPDF()}
          className={`w-fit h-[48px] text-white transition-all text-[14px] font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
        >
          Télécharger le document
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V15M17 10L12 15M12 15L7 10M12 15V3"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

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
                <h2 className="uppercase text-black text-[20px] font-bold">
                  {`Fiche d'étude prototype`}
                </h2>
              </div>
              <div className="h-[50px] text-center">
                <h2 className="uppercase text-black text-[20px] font-bold">
                  {`Imprimerie offset`}
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
                  {`Code: ${entry?.code}`}
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
                  {entry?.client?.name}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Commercial: "}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.commercial?.name}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Réference: "}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.reference}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">
                  {formatTime(
                    new Date(entry?.["created_at"]).getTime(),
                    "d:mo:y",
                    "short"
                  )}
                  {" à "}
                  {formatTime(
                    new Date(entry?.["created_at"]).getTime(),
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
                <span className="text-black text-[14px]">{entry?.code}</span>
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
                  {"Dimensions LxLxH :"}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.dim_lx_lh}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Dimensions Carré :"}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.dim_square}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Format de la plaque: "}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.dim_plate}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {`Format de papier :`}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.paper_type}
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
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Visa: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
            </div>
            <div className="p-2 !pb-[20px] space-y-[10px] border-x">
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Vérifié par: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Visa: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
            </div>
            <div className="p-2 !pb-[20px] space-y-[10px]">
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Réçu par: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Visa: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
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
  );
};

const CartonnerieShapePDF = ({
  handleDownloadPDF,
  handlePrintPDF,
  entry,
}: {
  handleDownloadPDF: () => void;
  handlePrintPDF: () => void;
  entry: any;
}) => {
  return (
    <div className="">
      <div className="p-[20px] flex justify-end">
        <button
          onClick={() => handlePrintPDF()}
          className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
        >
          Imprimer le document
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 7V5.2C18 4.0799 18 3.51984 17.782 3.09202C17.5903 2.71569 17.2843 2.40973 16.908 2.21799C16.4802 2 15.9201 2 14.8 2H9.2C8.0799 2 7.51984 2 7.09202 2.21799C6.71569 2.40973 6.40973 2.71569 6.21799 3.09202C6 3.51984 6 4.0799 6 5.2V7M6 18C5.07003 18 4.60504 18 4.22354 17.8978C3.18827 17.6204 2.37962 16.8117 2.10222 15.7765C2 15.395 2 14.93 2 14V11.8C2 10.1198 2 9.27976 2.32698 8.63803C2.6146 8.07354 3.07354 7.6146 3.63803 7.32698C4.27976 7 5.11984 7 6.8 7H17.2C18.8802 7 19.7202 7 20.362 7.32698C20.9265 7.6146 21.3854 8.07354 21.673 8.63803C22 9.27976 22 10.1198 22 11.8V14C22 14.93 22 15.395 21.8978 15.7765C21.6204 16.8117 20.8117 17.6204 19.7765 17.8978C19.395 18 18.93 18 18 18M15 10.5H18M9.2 22H14.8C15.9201 22 16.4802 22 16.908 21.782C17.2843 21.5903 17.5903 21.2843 17.782 20.908C18 20.4802 18 19.9201 18 18.8V17.2C18 16.0799 18 15.5198 17.782 15.092C17.5903 14.7157 17.2843 14.4097 16.908 14.218C16.4802 14 15.9201 14 14.8 14H9.2C8.0799 14 7.51984 14 7.09202 14.218C6.71569 14.4097 6.40973 14.7157 6.21799 15.092C6 15.5198 6 16.0799 6 17.2V18.8C6 19.9201 6 20.4802 6.21799 20.908C6.40973 21.2843 6.71569 21.5903 7.09202 21.782C7.51984 22 8.07989 22 9.2 22Z"
              stroke="black"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => handleDownloadPDF()}
          className={`w-fit h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
        >
          Télécharger le document
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V15M17 10L12 15M12 15L7 10M12 15V3"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

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
                <h2 className="uppercase text-black text-[20px] font-bold">
                  {`Fiche d'étude prototype`}
                </h2>
              </div>
              <div className="h-[50px] text-center">
                <h2 className="uppercase text-black text-[20px] font-bold">
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
                  {`Code: ${entry?.code}`}
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
                  {entry.client?.name}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Commercial: "}
                </span>
                <span className="text-black text-[14px]">
                  {entry.commercial?.name}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Réference: "}
                </span>
                <span className="text-black text-[14px]">
                  {entry.reference}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">
                  {formatTime(
                    new Date(entry?.["created_at"]).getTime(),
                    "d:mo:y",
                    "short"
                  )}
                  {" à "}
                  {formatTime(
                    new Date(entry?.["created_at"]).getTime(),
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
                <span className="text-black text-[14px]">{entry?.code}</span>
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
                  {entry?.cardboard_junction}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Code grammage: "}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.weight_code}
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
                <span className="text-black text-[14px]">{entry?.weight}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Surface de la plaque (en m2): "}
                </span>
                <span className="text-black text-[14px]">
                  {entry.dim_square}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {`Box Compression Test (en kg): `}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.compression_box}
                </span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Poids théorique (en kg): "}
                </span>
                <span className="text-black text-[14px]">
                  {entry?.theoretical_weight}
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
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Visa: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
            </div>
            <div className="p-2 !pb-[20px] space-y-[10px] border-x">
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Vérifié par: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Visa: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
            </div>
            <div className="p-2 !pb-[20px] space-y-[10px]">
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Réçu par: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Date: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
              </div>
              <div className="flex items-center gap-x-[10px]">
                <span className="text-black text-[14px] font-[500] whitespace-nowrap">
                  {"Visa: "}
                </span>
                <span className="text-black text-[14px]">{`---------`}</span>
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
  );
};

export default DOC;
