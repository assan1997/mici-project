"use client";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { ChevronDown } from "@/components/icons";
import {
  CardBoardIcon,
  CompassIcon,
  UserIcon,
  FolderIcon,
  PaintIcon,
  GreetingIcon,
  PrintIcon2,
  TaskIcon,
  ChevronRigthIcon,
} from "../../svg";
import uniqid from "uniqid";
import Image from "next/image";
const MainContainer: FC<{ children: any; title: string }> = ({
  children,
  title,
}) => {
  const [resize, setResize] = useState<boolean>(false);

  return (
    <div className="w-full h-screen  flex flex-row bg-white">
      <SideBar resize={resize} />
      <Content resize={resize} title={title} setResize={setResize}>
        {children}
      </Content>
    </div>
  );
};
export default MainContainer;

const SideBar: FC<{ resize: boolean }> = ({ resize }) => {
  type Nav = {
    link: string;
    slug: string;
    active: boolean;
    id: string;
    icon: (color: string) => JSX.Element;
  };

  type SubNav = Nav & {
    navId: string[];
  };

  const [nav, setNav] = useState<Nav[]>([
    {
      link: "/folder",
      slug: "Dossiers",
      active: true,
      id: "nav-0",
      icon: (color: string) => <FolderIcon color={color} />,
    },
    {
      link: "/b-a-t",
      slug: "B.A.T",
      active: false,
      id: "nav-1",
      icon: (color: string) => <PaintIcon color={color} />,
    },
    {
      link: "/forme",
      slug: "Formes",
      active: false,
      id: "nav-2",
      icon: (color: string) => <CompassIcon color={color} />,
    },
    {
      link: "/task",
      slug: "Tâches",
      active: false,
      id: "nav-3",
      icon: (color: string) => <TaskIcon color={color} />,
    },
    {
      link: "/user",
      slug: "Utilisateurs",
      active: false,
      id: "nav-4",
      icon: (color: string) => <UserIcon color={color} />,
    },
    {
      link: "/client",
      slug: "Clients",
      active: false,
      id: "nav-5",
      icon: (color: string) => <GreetingIcon color={color} />,
    },
  ]);

  const [subNav, setSubNav] = useState<SubNav[]>([
    {
      link: "/folder",
      slug: "Imprimerie Flexo - offset",
      active: false,
      id: "subNav-0",
      navId: ["nav-1", "nav-3"],
      icon: (color: string) => <PrintIcon2 color={color} />,
    },
    {
      link: "/b-a-t",
      slug: "Cartonnerie",
      active: false,
      id: "subNav-1",
      navId: ["nav-1", "nav-2", "nav-3"],
      icon: (color: string) => <CardBoardIcon color={color} />,
    },
    {
      link: "/forme",
      slug: "Imprimerie Offset",
      active: false,
      id: "subNav-2",
      navId: ["nav-2"],
      icon: (color: string) => <PrintIcon2 color={color} />,
    },
    {
      link: "/user",
      slug: "Imprimerie Flexo",
      active: false,
      id: "subNav-3",
      navId: ["nav-2"],
      icon: (color: string) => <PrintIcon2 color={color} />,
    },
  ]);

  const handleActiveNav = (
    id: string,
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>,
    cb?: Function
  ) => {
    handler((tmp: Nav[]) =>
      tmp.map((nav: Nav) =>
        nav.id === id
          ? { ...nav, active: !nav.active }
          : { ...nav, active: false }
      )
    );

    if (cb) cb();
  };

  const handleResetNavState = (
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>
  ) => {
    handler((tmp: Nav[]) => tmp.map((nav: Nav) => ({ ...nav, active: false })));
  };

  const handleUpdateSubNavId = (
    navId: string,
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>
  ) => {
    handler((tmp: Nav[]) => tmp.map((nav: Nav) => ({ ...nav, id: uniqid() })));
  };

  const getSubnavs = (navId: string) => {
    const subNavs = subNav.filter((nav: SubNav) => nav.navId.includes(navId));
    return subNavs;
  };

  return (
    <div
      className={`h-full justify-between ${
        resize ? "w-[108px]" : "w-[260px]"
      }  bg-[#060606] transition-all duration-300 overflow-scroll`}
    >
      <div
        className={`w-full flex   ${
          resize ? "justify-center" : "justify-start px-[30px]"
        }  top-0 sticky transition-all border-b border-[#EBDFD7]/10 duration-300`}
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
        {nav.map(({ active, slug, id, icon }, index) => (
          <div className="" key={index}>
            <button
              onClick={() => {
                handleActiveNav(
                  id,
                  setNav as Dispatch<
                    SetStateAction<SubNav[]> | SetStateAction<Nav[]>
                  >,
                  () => {
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
                  }
                );
              }}
              className={` ${
                active ? "text-white" : "bg-inherit text-[#EBDFD7]/90"
              } shrink-0 transition-all duration-100 ${
                resize ? "w-[48px] justify-center" : "justify-start w-[184px]"
              } h-[48px] flex items-center py-[30px] border-b border-[#EBDFD7]/10 hover:text-white/70 gap-x-[8px] hover:text-[#E65F2B]`}
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
                  ? getSubnavs(id).length * 60
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
                    icon: subNavIcon,
                  }) => (
                    <button
                      className={`${
                        subNavActive
                          ? "bg-white text-[#E65F2B]"
                          : "bg-inherit text-white hover:bg-white/10"
                      } shrink-0 transition-all duration-300 ${
                        resize
                          ? "w-[42px] justify-center"
                          : "justify-start w-[184px]"
                      } h-[42px] relative flex items-center justify-start text-justify font-poppins text-[13px] py-[16px] px-[16px] gap-x-[10px] rounded-full`}
                      onClick={() => {
                        handleActiveNav(
                          subNavId,
                          setSubNav as Dispatch<
                            SetStateAction<SubNav[]> | SetStateAction<Nav[]>
                          >
                        );
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
}> = ({ title, setResize, resize }) => {
  return (
    <div className="w-full h-[80px]">
      <div className="flex h-[48px] items-center p-[30px] relative border-b border-[#00000008]">
        <button
          onClick={() => setResize((tmp: boolean) => !tmp)}
          className={`w-[40px] -left-[20px] h-[40px] top-[36px] absolute  flex items-center justify-center border rounded-full bg-white`}
        >
          <span
            className={`${
              resize ? "rotate-[180deg]" : "rotate-[0deg]"
            } transition-all duration-500`}
          >
            <ChevronRigthIcon color={""} />
          </span>
        </button>
        <div className="flex justify-between items-center w-full">
          <h1 className="text-[#292D32] text-[18px] flex items-center gap-x-2 font-medium font-poppins">
            {title}
            <span
              className={`w-[4px] h-[4px] shrink-0 bg-[#E65F2B] rounded-full`}
            ></span>
            <span>Cartonnerie</span>
          </h1>
          <div className="w-[195px] h-[44px] bg-white border-gray-400 flex items-center px-[5px] gap-x-[10px] rounded-full">
            <div className="w-[38px] h-[38px] bg-slate-100 rounded-full"></div>
            <div className="flex flex-col">
              <span className="text-[#292D32] text-[14px] font-poppins">
                Alex meian
              </span>
              <span className="text-[#292d3244] text-[12px] font-poppins">
                Prodcut manager
              </span>
            </div>
            <div className="font-[500]">
              <ChevronDown />
            </div>
          </div>
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
}> = ({ children, resize, setResize, title }) => {
  return (
    <div
      className={`h-full ${
        resize ? "w-[calc(100%-108px)]" : "w-[calc(100%-260px)]"
      } bg-gray-100 transition-all duration-300`}
    >
      <TopBar setResize={setResize} resize={resize} title={title} />
      <div className="content-container px-[20px] overflow-scroll">
        {children}
      </div>
    </div>
  );
};
