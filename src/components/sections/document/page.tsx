import React, { useEffect, useMemo } from "react";
const DOC = () => {
  const entry = useMemo(
    () => JSON.parse(localStorage.getItem("doc-entry") as string),
    []
  );
  useEffect(() => {
    console.log("entry", entry);
  }, [entry]);

  return null;
  // <div className="fixed invisible top-0 left-0 right-0 bottom-0">
  //   <div
  //     className="w-[794px] h-[1123px] bg-white border mx-auto p-[20px] flex flex-col justify-between"
  //     id="ficheEtude"
  //   >
  //     <div>
  //       {/* Header */}
  //       <div className="border h-[100px] grid grid-cols-4">
  //         <div className="flex items-center justify-center">
  //           <div className="h-[80%] w-[80%] relative">
  //             <img
  //               src={`/assets/logo/logo-red.png`}
  //               alt="logo"
  //               className="object-contain h-full w-full"
  //             />
  //           </div>
  //         </div>
  //         <div className="col-span-2 border-x">
  //           <div className="h-[50px] border-b text-center">
  //             <h2 className="uppercase text-black text-[18px] font-bold">
  //               {`Fiche d'étude prototype`}
  //             </h2>
  //           </div>
  //           <div className="h-[50px] text-center">
  //             <h2 className="uppercase text-black text-[18px] font-bold">
  //               {`Cartonnerie`}
  //             </h2>
  //           </div>
  //         </div>
  //         <div className="">
  //           <div className="h-[50px] border-b p-2">
  //             <h2 className="text-black text-[14px]">
  //               {`Date: ${formatTime(
  //                 new Date().getTime(),
  //                 "d:mo:y",
  //                 "short"
  //               )}`}
  //             </h2>
  //           </div>
  //           <div className="h-[50px] p-2">
  //             <h2 className="text-black text-[14px]">
  //               {`Code: ${entry.data?.code}`}
  //             </h2>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Renseigments généraux */}
  //       <div className="mt-[30px] border p-2">
  //         <h2 className="uppercase text-center text-black text-[16px] font-semibold mb-[10px]">
  //           {`Renseigments généraux`}
  //         </h2>
  //         <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Client: "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {entry.data?.client?.name}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Commercial: "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {entry.data?.commercial?.name}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Réference: "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {entry.data?.reference}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Date: "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {formatTime(
  //                 new Date(entry.data?.["created_at"]).getTime(),
  //                 "d:mo:y",
  //                 "short"
  //               )}
  //               {" à "}
  //               {formatTime(
  //                 new Date(entry.data?.["created_at"]).getTime(),
  //                 "h:m",
  //                 "short"
  //               )}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {`Type d'emballage: `}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {`--------------------------`}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Code: "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {entry.data?.code}
  //             </span>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Renseigments techniques */}
  //       <div className="mt-[20px] border p-2">
  //         <h2 className="uppercase text-center text-black text-[16px] font-semibold mb-[10px]">
  //           {`Renseigments techniques`}
  //         </h2>
  //         <div className="grid grid-cols-2 gap-[20px] mb-[20px]">
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Dimensions intérieures: "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {entry.data?.dim_lx_lh}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Jonction du carton: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`----------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Code grammage: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`----------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Format de la plaque: "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {entry.data?.dim_plate}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {`Grammage (en g): `}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Surface de la plaque (en m2): "}
  //             </span>
  //             <span className="text-black text-[14px]">
  //               {entry.data?.dim_square}
  //             </span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {`Box Compression Test (en kg): `}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Poids théorique (en kg): "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     {/* footer */}
  //     <div>
  //       <div className="border grid grid-cols-3">
  //         <div className="p-2 !pb-[20px] space-y-[10px]">
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Réalisé par: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Date: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Visa: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //         </div>
  //         <div className="p-2 !pb-[20px] space-y-[10px] border-x">
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Vérifié par: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Date: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Visa: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //         </div>
  //         <div className="p-2 !pb-[20px] space-y-[10px]">
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Réçu par: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Date: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //           <div className="flex items-center gap-x-[10px]">
  //             <span className="text-black text-[14px] font-[500] whitespace-nowrap">
  //               {"Visa: "}
  //             </span>
  //             <span className="text-black text-[14px]">{`---------`}</span>
  //           </div>
  //         </div>
  //       </div>
  //       <div className="flex items-end justify-end mt-[10px] mb-[35px]">
  //         <div className="">
  //           <h2 className="text-black text-[14px] uppercase font-[600]">
  //             {`T.S.V.P`}
  //           </h2>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // </div>
};

export default DOC;
