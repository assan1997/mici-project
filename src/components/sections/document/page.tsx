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
      <OffsetShapePDF handleDownloadPDF={handleDownloadPDF} entry={entry} />
    );
  if (entry?.docType === "cartonnerie-shape-pdf")
    return (
      <CartonnerieShapePDF
        handleDownloadPDF={handleDownloadPDF}
        entry={entry}
      />
    );

  return null;
};

const OffsetShapePDF = ({
  handleDownloadPDF,
  entry,
}: {
  handleDownloadPDF: () => void;
  entry: any;
}) => {
  return (
    <div className="">
      <div className="p-[20px] flex justify-end">
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
                <h2 className="uppercase text-black text-[18px] font-bold">
                  {`Fiche d'étude prototype`}
                </h2>
              </div>
              <div className="h-[50px] text-center">
                <h2 className="uppercase text-black text-[18px] font-bold">
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
  entry,
}: {
  handleDownloadPDF: () => void;
  entry: any;
}) => {
  return (
    <div className="">
      <div className="p-[20px] flex justify-end">
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
