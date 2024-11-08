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
  useMemo,
} from "react";

import {
  CompassIcon,
  UserIcon,
  FolderIcon,
  PaintIcon,
  GreetingIcon,
  PrintIcon2,
  TaskIcon,
  Home,
  CardBoardIcon,
  PrintIcon,
} from "../components/svg";
import uniqid from "uniqid";
import { usePathname } from "next/navigation";
import { useData } from "./data.context";
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
  roleAdmin: boolean;
}

const SibeBarContext = createContext<SideBarContextType>({
  nav: [],
  subNav: [],
  resize: false,
  handleActiveNav: () => {},
  handleResetNavState: () => {},
  handleUpdateSubNavId: () => {},
  getSubnavs: () => [],
  setNav: () => {},
  setSubNav: () => {},
  setResize: () => {},
  roleAdmin: false,
});

export const useSideBar = () => useContext(SibeBarContext);
export const SideBarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useData();
  const navDatas = useMemo(
    () => [
      {
        link: "/user-tasks",
        slug: "Travaux",
        active: false,
        id: "nav-10",
        icon: (color: string) => (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M21 7L15.5657 12.4343C15.3677 12.6323 15.2687 12.7313 15.1545 12.7684C15.0541 12.8011 14.9459 12.8011 14.8455 12.7684C14.7313 12.7313 14.6323 12.6323 14.4343 12.4343L12.5657 10.5657C12.3677 10.3677 12.2687 10.2687 12.1545 10.2316C12.0541 10.1989 11.9459 10.1989 11.8455 10.2316C11.7313 10.2687 11.6323 10.3677 11.4343 10.5657L7 15M21 7H17M21 7V11"
              stroke={color}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        ),
      },
      {
        link: "/folders",
        slug: "Dossiers",
        active: false,
        disable: false,
        id: "nav-0",
        icon: (color: string) => <FolderIcon color={color} size={22} />,
      },
      {
        link: "/bat",
        slug: "B.A.T",
        active: false,
        disable: true,
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
        disable: true,
        id: "nav-3",
        icon: (color: string) => <TaskIcon color={color} size={24} />,
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
    ],
    []
  );
  const [nav, setNav] = useState<Nav[]>([]);
  const [subNav, setSubNav] = useState<SubNav[]>([
    {
      link: "/imprimerie-flexo-offset",
      slug: "Imprimerie Flexo - offset",
      active: false,
      id: "subNav-0",
      navId: [""],
      icon: (color: string) => <PrintIcon2 color={color} size={24} />,
    },
    {
      link: "/cartonnerie",
      slug: "Cartonnerie",
      active: false,
      id: "subNav-1",
      navId: ["nav-1", "nav-2", "nav-3"],
      icon: (color: string) => <CardBoardIcon color={color} size={24} />,
    },
    {
      link: "/imprimerie-offset",
      slug: "Imprimerie Offset",
      active: false,
      id: "subNav-2",
      navId: ["nav-2"],
      icon: (color: string) => <PrintIcon2 color={color} size={24} />,
    },
    {
      link: "/imprimerie-flexo",
      slug: "Imprimerie  Flexo",
      active: false,
      id: "subNav-3",
      navId: ["nav-2"],
      icon: (color: string) => <PrintIcon color={color} size={24} />,
    },
  ]);
  const pathName = usePathname();
  const [resize, setResize] = useState<boolean>(false);

  const roleAdmin = useMemo(() => {
    const sectionsIds = user?.sections?.map((section) => section.id);
    if (
      sectionsIds?.includes(1) ||
      sectionsIds?.includes(2) ||
      sectionsIds?.includes(3)
    )
      return true;
    else return false;
  }, [user?.sections]);

  useEffect(() => {
    if (!roleAdmin)
      setNav(
        navDatas
          .filter((nav) => !nav.disable)
          .filter((nav) => !["nav-4", "nav-5"].includes(nav.id))
          .map((nav: Nav) =>
            pathName.includes(nav.link)
              ? { ...nav, active: true }
              : { ...nav, active: false }
          )
      );
    else
      setNav(
        navDatas
          .filter((nav) => !nav.disable)
          .map((nav: Nav) =>
            pathName.includes(nav.link)
              ? { ...nav, active: true }
              : { ...nav, active: false }
          )
      );
  }, [roleAdmin, pathName]);

  // useEffect(() => {
  //   setNav((navs: Nav[]) =>
  //     navs?.map((nav: Nav) =>
  //       pathName.includes(nav.link)
  //         ? { ...nav, active: true }
  //         : { ...nav, active: false }
  //     )
  //   );

  //   setSubNav((navs: SubNav[]) =>
  //     navs?.map((nav: SubNav) =>
  //       pathName.includes(nav.link)
  //         ? { ...nav, active: true }
  //         : { ...nav, active: false }
  //     )
  //   );
  // }, [pathName]);

  const handleActiveNav = (
    id: string,
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>,
    cb?: Function
  ) => {
    handler((tmp: Nav[]) =>
      tmp?.map((nav: Nav) =>
        nav.id === id ? { ...nav, active: true } : { ...nav, active: false }
      )
    );
    if (cb) cb();
  };

  const handleResetNavState = (
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>
  ) => {
    handler((tmp: Nav[]) =>
      tmp?.map((nav: Nav) => ({ ...nav, active: false }))
    );
  };

  const handleUpdateSubNavId = (
    navId: string,
    handler: Dispatch<SetStateAction<SubNav[]> | SetStateAction<Nav[]>>
  ) => {
    handler((tmp: Nav[]) => tmp?.map((nav: Nav) => ({ ...nav, id: uniqid() })));
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
        roleAdmin,
      }}
    >
      {children}
    </SibeBarContext.Provider>
  );
};
