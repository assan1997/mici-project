"use client";
import { FC, useEffect } from 'react'
import { CSVLink } from "react-csv";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <p>Loading...</p>,
    },
);
import BaseModal from '../modal/BaseModal';
export const Export: FC<{
    title: string; type: "csv" | "pdf", entry: {
        headers: { label: string, key: string }[],
        data: any,
    }
}> = ({ title, type, entry }) => {

    // Create styles

    // Create Document Component



    useEffect(() => {
        const embed = document.getElementsByTagName('iframe')
        console.log('iframe', embed);
    }, [])


    if (type === "csv") {
        return <CSVLink data={entry?.data} headers={entry?.headers}>
            <div className="h-[40px] text-[14px] bg-white gap-x-[4px] text-[#000] font-poppins font-medium leading-[20px] rounded-[20px] flex items-center justify-center px-[8px] border">
                <svg fill="none" height={16} width={16} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" id="fi_6847526"><path d="m2.85902 2.87697 12.56998-1.795c.071-.01018.1433-.00498.212.01523.0688.02021.1324.05496.1865.1019.0542.04695.0976.10498.1274.17018.0297.06519.0451.13602.0451.20769v20.84603c0 .0715-.0154.1423-.0451.2074s-.073.1231-.127.17c-.0541.0469-.1176.0817-.1862.102s-.1408.0256-.2117.0156l-12.57198-1.795c-.23838-.034-.4565-.1528-.61431-.3347-.1578-.1818-.24468-.4145-.24469-.6553v-16.26603c.00001-.24079.08689-.47349.24469-.65536.15781-.18186.37593-.30069.61431-.33464zm1.141 1.858v14.53003l9.99998 1.429v-17.38803zm12.99998 14.26503h3v-14.00003h-3v-2h4c.2652 0 .5196.10536.7071.29289.1876.18754.2929.44189.2929.70711v16.00003c0 .2652-.1053.5195-.2929.7071-.1875.1875-.4419.2929-.7071.2929h-4zm-6.8-7 2.8 4h-2.4l-1.59998-2.286-1.6 2.286h-2.4l2.8-4-2.8-4.00003h2.4l1.6 2.28603 1.59998-2.28603h2.4z" fill="rgb(0,0,0)"></path></svg>
                {title}
            </div>
        </CSVLink>
    }

    if (type === "pdf") {
        return <button disabled className="h-[40px] cursor-not-allowed text-[14px] bg-gray-100 gap-x-[4px] text-[#000] font-poppins font-medium leading-[20px] rounded-[20px] flex items-center justify-center px-[8px] border">
            <svg id="fi_3022204" enable-background="new 0 0 512 512" height={16} viewBox="0 0 512 512" width={16} xmlns="http://www.w3.org/2000/svg"><g><path d="m127.741 209h-31.741c-3.986 0-7.809 1.587-10.624 4.41s-4.389 6.651-4.376 10.638l.221 113.945c0 8.284 6.716 15 15 15s15-6.716 15-15v-34.597c6.133-.031 12.685-.058 16.52-.058 26.356 0 47.799-21.16 47.799-47.169s-21.443-47.169-47.799-47.169zm0 64.338c-3.869 0-10.445.027-16.602.059-.032-6.386-.06-13.263-.06-17.228 0-3.393-.017-10.494-.035-17.169h16.696c9.648 0 17.799 7.862 17.799 17.169s-8.15 17.169-17.798 17.169z"></path><path d="m255.33 209h-31.33c-3.983 0-7.803 1.584-10.617 4.403s-4.391 6.642-4.383 10.625c0 .001.223 110.246.224 110.646.015 3.979 1.609 7.789 4.433 10.592 2.811 2.79 6.609 4.354 10.567 4.354h.057c.947-.004 23.294-.089 32.228-.245 33.894-.592 58.494-30.059 58.494-70.065-.001-42.054-23.981-70.31-59.673-70.31zm.655 110.38c-3.885.068-10.569.123-16.811.163-.042-13.029-.124-67.003-.147-80.543h16.303c27.533 0 29.672 30.854 29.672 40.311 0 19.692-8.972 39.719-29.017 40.069z"></path><path d="m413.863 237.842c8.284 0 15-6.716 15-15s-6.716-15-15-15h-45.863c-8.284 0-15 6.716-15 15v113.158c0 8.284 6.716 15 15 15s15-6.716 15-15v-42.65h27.22c8.284 0 15-6.716 15-15s-6.716-15-15-15h-27.22v-25.508z"></path><path d="m458 145h-11v-4.279c0-19.282-7.306-37.607-20.572-51.601l-62.305-65.721c-14.098-14.87-33.936-23.399-54.428-23.399h-199.695c-24.813 0-45 20.187-45 45v100h-11c-24.813 0-45 20.187-45 45v180c0 24.813 20.187 45 45 45h11v52c0 24.813 20.187 45 45 45h292c24.813 0 45-20.187 45-45v-52h11c24.813 0 45-20.187 45-45v-180c0-24.813-20.187-45-45-45zm-363-100c0-8.271 6.729-15 15-15h199.695c12.295 0 24.198 5.117 32.657 14.04l62.305 65.721c7.96 8.396 12.343 19.391 12.343 30.96v4.279h-322zm322 422c0 8.271-6.729 15-15 15h-292c-8.271 0-15-6.729-15-15v-52h322zm56-97c0 8.271-6.729 15-15 15h-404c-8.271 0-15-6.729-15-15v-180c0-8.271 6.729-15 15-15h404c8.271 0 15 6.729 15 15z"></path></g></svg>
            {title}
        </button>
    }

    return null
}


