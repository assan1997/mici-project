/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";

import {
  CardBoardIcon,
  CompassIcon,
  UserIcon,
  FolderIcon,
  PaintIcon,
  GreetingIcon,
  PrintIcon2,
  TaskIcon,
} from "../components/svg";
import uniqid from "uniqid";
import { usePathname } from "next/navigation";

export type Nav = {
  link: string;
  slug: string;
  active: boolean;
  id: string;
  icon: (color: string) => JSX.Element;
};

export type SubNav = Nav & {
  navId: string[];
};
interface SideBarContextType {
  nav: Nav[];
  subNav: SubNav[];
  resize: boolean;
  handleActiveNav: (
    id: string,
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>,
    cb?: Function
  ) => void;
  handleResetNavState: (
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>
  ) => void;
  handleUpdateSubNavId: (
    navId: string,
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>
  ) => void;
  getSubnavs: (navId: string) => SubNav[];
  setNav: React.Dispatch<React.SetStateAction<Nav[]>>;
  setSubNav: React.Dispatch<React.SetStateAction<SubNav[]>>;
  setResize: React.Dispatch<React.SetStateAction<boolean>>;
}

const SibeBarContext = createContext<SideBarContextType>({
  nav: [],
  subNav: [],
  resize: false,
  handleActiveNav: () => { },
  handleResetNavState: () => { },
  handleUpdateSubNavId: () => { },
  getSubnavs: () => [],
  setNav: () => { },
  setSubNav: () => { },
  setResize: () => { },
});

export const useSideBar = () => useContext(SibeBarContext);
export const SideBarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nav, setNav] = useState<Nav[]>([
    {
      link: "/folder",
      slug: "Dossiers",
      active: false,
      id: "nav-0",
      icon: (color: string) => <FolderIcon color={color} size={22} />,
    },
    {
      link: "/bat",
      slug: "B.A.T",
      active: false,
      id: "nav-1",
      icon: (color: string) => <PaintIcon color={color} size={24} />,
    },
    {
      link: "/shapes",
      slug: "Formes",
      active: false,
      id: "nav-2",
      icon: (color: string) => <CompassIcon color={color} size={24} />,
    },
    {
      link: "/task",
      slug: "Tâches",
      active: false,
      id: "nav-3",
      icon: (color: string) => <TaskIcon color={color} size={20} />,
    },
    {
      link: "/users",
      slug: "Utilisateurs",
      active: false,
      id: "nav-4",
      icon: (color: string) => <UserIcon color={color} size={24} />,
    },
    {
      link: "/clients",
      slug: "Clients",
      active: false,
      id: "nav-5",
      icon: (color: string) => <GreetingIcon color={color} size={24} />,
    },
  ]);
  const [subNav, setSubNav] = useState<SubNav[]>([
    {
      link: "/imprimerie-flexo-offset",
      slug: "Imprimerie Flexo - offset",
      active: false,
      id: "subNav-0",
      navId: ["nav-1"],
      icon: (color: string) => <PrintIcon2 color={color} size={22} />,
    },
    // {
    //   link: "/cartonnerie",
    //   slug: "Cartonnerie",
    //   active: false,
    //   id: "subNav-1",
    //   navId: ["nav-1", "nav-2", "nav-3"],
    //   icon: (color: string) => <CardBoardIcon color={color} size={22} />,
    // },
    {
      link: "/imprimerie-offset",
      slug: "Imprimerie Offset",
      active: false,
      id: "subNav-2",
      navId: ["nav-2"],
      icon: (color: string) => <PrintIcon2 color={color} size={22} />,
    },
    {
      link: "/imprimerie-flexo",
      slug: "Imprimerie Flexo",
      active: false,
      id: "subNav-3",
      navId: ["nav-2"],
      icon: (color: string) => <PrintIcon2 color={color} size={22} />,
    },
  ]);
  const pathName = usePathname();
  const [resize, setResize] = useState<boolean>(false);

  useEffect(() => {
    setNav((navs: Nav[]) =>
      navs.map((nav: Nav) =>
        pathName.includes(nav.link)
          ? { ...nav, active: true }
          : { ...nav, active: false }
      )
    );

    setSubNav((navs: SubNav[]) =>
      navs.map((nav: SubNav) =>
        pathName.includes(nav.link)
          ? { ...nav, active: true }
          : { ...nav, active: false }
      )
    );
  }, [pathName]);

  const handleActiveNav = (
    id: string,
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>,
    cb?: Function
  ) => {
    handler((tmp: Nav[]) =>
      tmp.map((nav: Nav) =>
        nav.id === id ? { ...nav, active: true } : { ...nav, active: false }
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
    <SibeBarContext.Provider
      value={{
        nav,
        subNav,
        handleActiveNav,
        handleResetNavState,
        handleUpdateSubNavId,
        getSubnavs,
        setNav,
        setSubNav,
        setResize,
        resize,
      }}
    >
      {children}
    </SibeBarContext.Provider>
  );
};
