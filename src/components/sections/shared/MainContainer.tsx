"use client";
import { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import { ChevronDown } from "@/components/icons";
import { ChevronRigthIcon } from "../../svg";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import BaseDropdown from "@/components/ui/dropdown/BaseDropdown";
import { Nav, SubNav, useSideBar } from "@/context/sidebar.context";
import { useData } from "@/context/data.context";
import { logout } from "@/services/auth";

const MainContainer: FC<{ children: any; title: string }> = ({
  children,
  title,
}) => {
  const pathName = usePathname();
  const subTitle = useMemo(() => {
    const texts = pathName.split("/");
    if (texts.length > 3) return texts[texts.length - 1];
    return "";
  }, [pathName]);

  const { setResize, resize } = useSideBar();
  return (
    <div className="w-full h-screen scrollbar-hide flex flex-row bg-white">
      <SideBar resize={resize} />
      <Content
        resize={resize}
        title={title}
        subTitle={subTitle}
        setResize={setResize}
      >
        {children}
      </Content>
    </div>
  );
};
export default MainContainer;

const SideBar: FC<{ resize: boolean }> = ({ resize }) => {
  const Router = useRouter();
  const {
    nav,
    handleActiveNav,
    handleResetNavState,
    handleUpdateSubNavId,
    getSubnavs,
    setNav,
    setSubNav,
  } = useSideBar();
  return (
    <div
      className={`h-full justify-between ${
        resize ? "w-[108px]" : "w-[260px]"
      }  bg-[#060606] transition-all duration-300 overflow-scroll`}
    >
      <div
        className={`w-full flex   ${
          resize ? "justify-center" : "justify-start px-[30px]"
        }  top-0 sticky transition-all  duration-300`}
      >
        <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center relative">
          <Image
            alt="logo"
            fill
            className="object-contain"
            src="/assets/logo/sig-variant.png"
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-[8px] px-[30px] items-start h-[calc(100%-65px)] justify-center w-full">
        {nav.map(({ active, slug, id, link, icon }, index) => (
          <div className="" key={index}>
            <button
              onClick={() => {
                handleActiveNav(
                  id,
                  setNav as Dispatch<
                    SetStateAction<SubNav[]> | SetStateAction<Nav[]>
                  >,
                  () => {
                    const subNavs = getSubnavs(id);
                    if (subNavs.length > 0) {
                      handleUpdateSubNavId(
                        id,
                        setSubNav as Dispatch<
                          SetStateAction<SubNav[]> | SetStateAction<Nav[]>
                        >
                      );

                      handleResetNavState(
                        setSubNav as Dispatch<
                          SetStateAction<SubNav[]> | SetStateAction<Nav[]>
                        >
                      );
                    } else Router.push(`/workspace${link}`);
                  }
                );
              }}
              className={` ${
                active ? "text-white" : "bg-inherit text-[#EBDFD7]/90"
              } shrink-0 transition-all duration-100 ${
                resize ? "w-[48px] justify-center" : "justify-start w-[184px]"
              } h-[48px] flex items-center py-[30px] border-b border-[#EBDFD7]/10 hover:text-white/70 gap-x-[14px] hover:text-[#E65F2B]`}
            >
              {/* <div className="absolute bg-inherit text-white hover:bg-white/10 h-[40px] left-[300px] w-[200px]"></div> */}
              <div className="shrink-0">
                {icon(active ? "#E65F2B" : "white")}
              </div>
              {!resize ? (
                <span
                  className={`${
                    resize ? "invisible absolute" : "visible"
                  } transition-all font-poppins`}
                >
                  {slug}
                </span>
              ) : null}
            </button>
            <div
              style={{
                height: !active
                  ? 0
                  : getSubnavs(id).length > 0
                  ? getSubnavs(id).length * 80
                  : 0,
              }}
              className={`relative overflow-hidden flex flex-col items-start ${
                resize ? "pl-[4px]" : "pl-[15px]"
              }  justify-center transition-height duration-300`}
            >
              <div className="py-[6px] flex flex-col gap-y-[12px] pl-[15px] border-l border-[#EBDFD7]/10">
                {getSubnavs(id)?.map(
                  ({
                    id: subNavId,
                    slug: subNavSlug,
                    active: subNavActive,
                    link: subnavLink,
                    icon: subNavIcon,
                  }) => (
                    <button
                      className={`${
                        subNavActive
                          ? "bg-[#E65F2B]/10 text-[#E65F2B]"
                          : "bg-inherit text-white hover:bg-[#E65F2B]/10"
                      } shrink-0 transition-all duration-300 ${
                        resize
                          ? "w-[42px] h-[42px] justify-center"
                          : "justify-start w-[184px] h-[50px]"
                      }  relative flex items-center justify-start text-justify font-poppins text-[14px] py-[16px] px-[16px] gap-x-[14px] rounded-[12px]`}
                      onClick={() => {
                        handleActiveNav(
                          subNavId,
                          setSubNav as Dispatch<
                            SetStateAction<SubNav[]> | SetStateAction<Nav[]>
                          >
                        );
                        Router.push(`/workspace${link}${subnavLink}`);
                      }}
                      key={subNavId}
                    >
                      <div
                        className={`absolute w-[6px] h-[6px] shrink-0 -left-[18px] ${
                          subNavActive ? "bg-[#E65F2B]" : "bg-[#2a2a2a]"
                        } rounded-full transition-all duration-200`}
                      ></div>
                      <div className="shrink-0">
                        {subNavIcon(subNavActive ? "#E65F2B" : "white")}
                      </div>
                      {!resize ? subNavSlug : null}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopBar: FC<{
  setResize: Dispatch<SetStateAction<boolean>>;
  resize: boolean;
  title: string;
  subTitle: string;
}> = ({ title, setResize, resize, subTitle }) => {
  const { user } = useData();
  const Router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  return (
    <div className="w-full relative h-[80px] px-[20px] border-b flex items-center justify-between border-[#00000008]">
      <button
        onClick={() => setResize((tmp: boolean) => !tmp)}
        className={`w-[40px] -left-[20px] h-[40px] top-[58px] absolute  flex items-center justify-center border rounded-full bg-white transition-all`}
      >
        <span
          className={`${
            resize ? "rotate-[180deg]" : "rotate-[0deg]"
          } transition-all  duration-500`}
        >
          <ChevronRigthIcon color={""} />
        </span>
      </button>
      <div className="flex justify-between items-center w-full">
        <h1 className="text-[#292D32] text-[18px] flex items-center gap-x-2 font-medium font-poppins">
          {title}
          {subTitle ? (
            <>
              <span
                className={`w-[4px] h-[4px] shrink-0 bg-[#E65F2B] rounded-full`}
              ></span>
              <span>{subTitle}</span>
            </>
          ) : null}
        </h1>
        <div className="w-[195px] h-[50px] bg-white border flex items-center px-[5px] gap-x-[10px] justify-between rounded-full">
          <div className="flex items-center gap-x-2">
            <div className="w-[34px] h-[34px] bg-slate-100 rounded-full"></div>
            <div className="flex flex-col">
              <span className="text-[#292D32] text-[14px] font-poppins">
                {user?.name}
              </span>
              <span className="text-[#292d3244] text-[12px] font-poppins">
                {user?.role_id}
              </span>
            </div>
          </div>
          <BaseDropdown
            dropdownOrigin="bottom-right"
            isActive={openDropdown}
            setIsActive={setOpenDropdown}
            otherStyles={"w-[240px] top-[20px]"}
            buttonContent={
              <div className="font-[500]">
                <ChevronDown />
              </div>
            }
          >
            <div className="">
              {/* <ul className="border-y border-primary-black-leg-50 ">
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
              </ul> */}
              <button
                onClick={async () => {
                  await logout();
                  Router.push("/");
                }}
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
                <span className="block text-[#060606] text-start text-[14px] leading-[20px] font-[500]">
                  {"Déconnexion"}
                </span>
              </button>
            </div>
          </BaseDropdown>
        </div>
      </div>
    </div>
  );
};

const Content: FC<{
  children: any;
  resize: boolean;
  setResize: Dispatch<SetStateAction<boolean>>;
  title: string;
  subTitle: string;
}> = ({ children, resize, setResize, subTitle, title }) => {
  return (
    <div
      className={`h-full  ${
        resize ? "w-[calc(100%-108px)]" : "w-[calc(100%-260px)]"
      } bg-gray-100 transition-all duration-300`}
    >
      <TopBar
        setResize={setResize}
        resize={resize}
        subTitle={subTitle}
        title={title}
      />
      <div className="content-container px-[20px] overflow-auto scrollbar-hide">
        {children}
      </div>
    </div>
  );
};
