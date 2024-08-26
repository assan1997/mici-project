/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
  useEffect,
} from "react";
// import uniqid from "uniqid";
import { usePathname, useRouter } from "next/navigation";
import { refreshUser } from "@/services/auth";
import { getAllDepartments, getDepartmentById } from "@/services/department";
import { getAllSections } from "@/services/section";
import { getAllUsers } from "@/services/users";
import { getAllClients } from "@/services/clients";
import { getAllOffsetShapes } from "@/services/shapes";

export interface Client {
  id: number;
  name: string;
  user: User;
  created_at: string;
  updated_at: string;
  departments: Department[];
}

export interface Department {
  id: number;
  name: string;
  description: string;
  created_at: null;
  updated_at: null;
}

export interface Section {
  id: number;
  name: string;
  description: string;
  created_at: null;
  updated_at: null;
}

export interface LoadUsers {
  isLoadCurrentUser: boolean;
  isLoadAllUsers: boolean;
  isloadSections: boolean;
  isLoadDepartments: boolean
}

export interface User {
  id: number;
  role_id: number;
  name: string;
  email: string;
  password: string;
  avatar: string;
  email_verified_at: string;
  settings: [];
  created_at: string;
  updated_at: string;
  sections: Section[];
  departments: Department[];
  clients: Client[];
}

export interface DataContextType {
  clients: Client[] | undefined;
  users: User[] | undefined;
  user: User | undefined;
  departments: Department[];
  sections: Section[];
  offsetShapes: OffsetShape[] | undefined;
  dispatchUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  dispatchUsers: React.Dispatch<React.SetStateAction<User[] | undefined>>;
  dispatchClients: React.Dispatch<React.SetStateAction<Client[] | undefined>>;
  dispatchDepartment: React.Dispatch<React.SetStateAction<Department[]>>;
  dispatchOffsetShapes: React.Dispatch<React.SetStateAction<OffsetShape[] | undefined>>;
  loadUsers: LoadUsers
}

export interface OffsetShape {
  id: number;
  client: Client;
  department: Department;
  commercial: User;
  dim_lx_lh: string;
  dim_square: string;
  dim_plate: string;
  paper_type: string;
  pose_number: string;
  part: string;
  reference: string;
  observation: string;
  created_at: string;
  updated_at: string;
  code: string;
  user: User;
  logs: any[];
}

const DataContext = createContext<DataContextType>({
  clients: [],
  users: [],
  sections: [],
  user: undefined,
  departments: [],
  offsetShapes: [],
  dispatchUser: () => { },
  dispatchUsers: () => { },
  dispatchClients: () => { },
  dispatchDepartment: () => { },
  loadUsers: {
    isLoadCurrentUser: false,
    isLoadAllUsers: false,
    isloadSections: false,
    isLoadDepartments: false,
  },
  dispatchOffsetShapes: () => { },
});

export const useData = () => useContext(DataContext);
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[] | undefined>();
  const [users, setUsers] = useState<User[] | undefined>();
  const [user, setUser] = useState<User>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [offsetShapes, setOffsetShapes] = useState<OffsetShape[] | undefined>();

  const Router = useRouter();
  const dispatchUser = useMemo(() => setUser, []);
  const dispatchClients = useMemo(() => setClients, []);
  const dispatchDepartment = useMemo(() => setDepartments, []);
  const dispatchSection = useMemo(() => setSections, []);
  const dispatchUsers = useMemo(() => setUsers, []);
  const dispatchOffsetShapes = useMemo(() => setOffsetShapes, []);

  const [loadUsers, setLoadUsers] = useState<LoadUsers>({
    isLoadCurrentUser: false,
    isLoadAllUsers: false,
    isloadSections: false,
    isLoadDepartments: false,
  })

  useEffect(() => {
    (async () => {
      const { data, success } = await refreshUser();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadCurrentUser: true }))
      if (!success) {
        Router.push("/");
      }
      dispatchUser(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllDepartments();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadDepartments: true }))
      if (!success) return;
      dispatchDepartment(data);
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllSections();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isloadSections: true }))
      if (!success) return;
      dispatchSection(data);
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllUsers();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadAllUsers: true }))
      if (!success) return;
      dispatchUsers(data);
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllClients();
      if (!success) return;
      dispatchClients(data);
    })();
  }, [user]);

  useEffect(() => {
    if (users && users?.length > 0) {
      (async () => {
        let { data, success } = await getAllOffsetShapes();
        if (!success) return;
        dispatchOffsetShapes(data.map((dat: any) => ({ ...dat, commercial: users?.find((use) => use.id === dat.commercial_id) })));
      })();
    }

  }, [users]);

  const commercials = useMemo(() => { }, [])

  return (
    <DataContext.Provider
      value={{
        clients,
        users,
        sections,
        offsetShapes,
        user,
        departments,
        loadUsers,
        dispatchUser,
        dispatchUsers,
        dispatchClients,
        dispatchDepartment,
        dispatchOffsetShapes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
