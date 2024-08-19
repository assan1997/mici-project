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
  clients: Client[];
  users: User[];
  user: User | undefined;
  departments: Department[];
  sections: Section[];
  dispatchUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  dispatchUsers: React.Dispatch<React.SetStateAction<User[]>>;
  dispatchClients: React.Dispatch<React.SetStateAction<Client[]>>;
  dispatchDepartment: React.Dispatch<React.SetStateAction<Department[]>>;
  loadUsers: LoadUsers
}

export interface Shape {
  client_id: string;
  department_id: string;
  commercial_id: string;
  dim_lx_lh: string;
  dim_square: string;
  dim_plate: string;
  paper_type: string;
  pose_number: string;
  part: string;
  observation: string;
  user_id: string;
}

const DataContext = createContext<DataContextType>({
  clients: [],
  users: [],
  sections: [],
  user: undefined,
  departments: [],
  dispatchUser: () => { },
  dispatchUsers: () => { },
  dispatchClients: () => { },
  dispatchDepartment: () => { },
  loadUsers: {
    isLoadCurrentUser: false,
    isLoadAllUsers: false,
    isloadSections: false,
    isLoadDepartments: false,
  }
});

export const useData = () => useContext(DataContext);
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const pathName = usePathname();
  const Router = useRouter();

  const dispatchUser = useMemo(() => setUser, []);
  const dispatchClients = useMemo(() => setClients, []);
  const dispatchDepartment = useMemo(() => setDepartments, []);
  const dispatchSection = useMemo(() => setSections, []);
  const dispatchUsers = useMemo(() => setUsers, []);

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
      // ?.map((tmpUser: any) => {
      //   let tmpSections: Section[] = [], tmpDepartments: Department[] = []
      //   if (sections.length > 0)
      //     tmpSections = sections?.filter(
      //       (section: Section) => tmpUser.sections.map((tmp: Section) => tmp.id).includes(section.id) && section
      //     );
      //   if (departments.length > 0)
      //     tmpDepartments = departments?.filter(
      //       (department: Section) =>
      //         tmpUser.departments.map((tmp: Department) => tmp.id).includes(department.id) && department
      //     );
      //   return { ...tmpUser, sections: tmpSections, departments: tmpDepartments };
      // })
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllClients();
      if (!success) return;
      dispatchClients(data);
      // ?.map((tmpUser: any) => {
      //   let tmpSections: Section[] = [], tmpDepartments: Department[] = []
      //   if (sections.length > 0)
      //     tmpSections = sections?.filter(
      //       (section: Section) => tmpUser.sections.map((tmp: Section) => tmp.id).includes(section.id) && section
      //     );
      //   if (departments.length > 0)
      //     tmpDepartments = departments?.filter(
      //       (department: Section) =>
      //         tmpUser.departments.map((tmp: Department) => tmp.id).includes(department.id) && department
      //     );
      //   return { ...tmpUser, sections: tmpSections, departments: tmpDepartments };
      // })
    })();
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        clients,
        users,
        sections,
        user,
        dispatchUser,
        dispatchUsers,
        dispatchClients,
        dispatchDepartment,
        departments,
        loadUsers
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
