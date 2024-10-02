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
import { getAllFolders } from "@/services/folder";
import { getAllBats } from "@/services/bat";
import { getTasks } from "@/services/task";

export interface FolderInterface {
  file_number: string;
  client: Client;
  state: string;
  product: any;
  fabrication: any;
  format: string;
  color: string;
  support: string;
  commercial: Client;
  department: Department;
  shape: OffsetShape;
  bat: any;
  details: string;
  updated_at: string;
  created_at: string;
  id: number;
  status_id: number;
  logs: any[];
}

export interface BatInterface {
  client: Client;
  product: any;
  fabrication: any;
  commercial: Client;
  department: Department;
  shape: OffsetShape;
  details: string;
  updated_at: string;
  created_at: string;
  id: number;
  status_id: number;
  logs: any[];
  reference: string;
  assignated_user: User;
}

// "id": 1,
// "client_id": 1,
// "product_id": 1,
// "code": "BAT 001",
// "commercial_id": 1,
// "user_assignated_id": 1,
// "department_id": 1,
// "shape_id": 1,
// "reference": "ref",
// "fabrication_id": 1,
// "details": "details",
// "created_at": "2024-08-23T17:44:20.000000Z",
// "updated_at": "2024-08-23T17:45:30.000000Z",
// "status_id": null,

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
  isLoadDepartments: boolean;
}

export interface TaskInterface {
  completed_at: string | null;
  created_at: string;
  description: string;
  id: number;
  started_at: string | null;
  status: string;
  updated_at: string | null;
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
  bats: BatInterface[] | undefined;
  folders: FolderInterface[] | undefined;
  clients: Client[] | undefined;
  users: User[] | undefined;
  user: User | undefined;
  departments: Department[];
  sections: Section[];
  offsetShapes: OffsetShape[] | undefined;
  flexoShapes: FlexoShape[] | undefined;
  dispatchUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  dispatchUsers: React.Dispatch<React.SetStateAction<User[] | undefined>>;
  dispatchClients: React.Dispatch<React.SetStateAction<Client[] | undefined>>;
  dispatchDepartment: React.Dispatch<React.SetStateAction<Department[]>>;
  dispatchOffsetShapes: React.Dispatch<
    React.SetStateAction<OffsetShape[] | undefined>
  >;
  dispatchBats: React.Dispatch<
    React.SetStateAction<BatInterface[] | undefined>
  >;
  dispatchTasks: React.Dispatch<
    React.SetStateAction<TaskInterface[] | undefined>
  >;
  loadUsers: LoadUsers;
  status: Status[];
  tasks: TaskInterface[] | undefined;
  rules: number[];
}
export interface Status {
  id: number;
  name: string;
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
  observations: any[];
  created_at: string;
  updated_at: string;
  code: string;
  user: User;
  logs: any[];
  status_id: number;
  rule_id: number;
}
export interface FlexoShape {
  id: number;
  client: Client;
  department: Department;
  commercial: User;
  reference: string;
  observation: string;
  created_at: string;
  updated_at: string;
  code: string;
  user: User;
  logs: any[];
  status_id: number;
}
const DataContext = createContext<DataContextType>({
  folders: [],
  bats: [],
  clients: [],
  users: [],
  sections: [],
  user: undefined,
  departments: [],
  offsetShapes: [],
  flexoShapes: [],
  dispatchUser: () => {},
  dispatchUsers: () => {},
  dispatchClients: () => {},
  dispatchDepartment: () => {},
  loadUsers: {
    isLoadCurrentUser: false,
    isLoadAllUsers: false,
    isloadSections: false,
    isLoadDepartments: false,
  },
  dispatchOffsetShapes: () => {},
  dispatchBats: () => {},
  dispatchTasks: () => {},
  status: [],
  tasks: [],
  rules: [],
});
export const useData = () => useContext(DataContext);
export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [folders, setFolders] = useState<FolderInterface[] | undefined>();
  const [clients, setClients] = useState<Client[] | undefined>();
  const [users, setUsers] = useState<User[] | undefined>();
  const [user, setUser] = useState<User>();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [offsetShapes, setOffsetShapes] = useState<OffsetShape[] | undefined>();
  const [flexoShapes, setFlexoShapes] = useState<FlexoShape[] | undefined>();
  const [bats, setBats] = useState<BatInterface[] | undefined>();
  const [tasks, setTasks] = useState<TaskInterface[] | undefined>();

  const status: Status[] = useMemo(
    () => [
      {
        name: "En cours",
        id: 1,
      },
      {
        name: "En standby",
        id: 2,
      },
      {
        name: "Bloqué",
        id: 3,
      },
      {
        name: "Terminé",
        id: 4,
      },
    ],
    []
  );

  const rules: number[] = useMemo(() => [1, 2, 3], []);

  const Router = useRouter();
  const dispatchUser = useMemo(() => setUser, []);
  const dispatchClients = useMemo(() => setClients, []);
  const dispatchDepartment = useMemo(() => setDepartments, []);
  const dispatchSection = useMemo(() => setSections, []);
  const dispatchUsers = useMemo(() => setUsers, []);
  const dispatchOffsetShapes = useMemo(() => setOffsetShapes, []);
  const dispatchFolders = useMemo(() => setFolders, []);
  const dispatchBats = useMemo(() => setBats, []);
  const dispatchTasks = useMemo(() => setTasks, []);

  const [loadUsers, setLoadUsers] = useState<LoadUsers>({
    isLoadCurrentUser: false,
    isLoadAllUsers: false,
    isloadSections: false,
    isLoadDepartments: false,
  });

  useEffect(() => {
    (async () => {
      const { data, success } = await refreshUser();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadCurrentUser: true }));
      if (!success) {
        Router.push("/");
      }
      dispatchUser(data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllDepartments();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadDepartments: true }));
      if (!success) return;
      dispatchDepartment(data);
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllSections();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isloadSections: true }));
      if (!success) return;
      dispatchSection(data);
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      const { data, success } = await getAllUsers();
      setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadAllUsers: true }));
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
        console.log("data", data);
        if (!success) return;
        dispatchOffsetShapes(
          data?.map((dat: any) => ({
            ...dat,
            commercial: users?.find((use) => use.id === dat.commercial_id),
          }))
        );
      })();
    }
  }, [users]);

  useEffect(() => {
    if (users && users?.length > 0) {
      (async () => {
        let { data, success } = await getAllFolders();
        if (!success) return;
        dispatchFolders(
          data.map((dat: any) => ({
            ...dat,
            commercial: users?.find((use) => use.id === dat.commercial_id),
          }))
        );
      })();
    }
  }, [users]);

  useEffect(() => {
    if (users && users?.length > 0 && departments && departments.length > 0) {
      (async () => {
        let { data, success } = await getAllBats();
        if (!success) return;
        dispatchBats(
          data.map((dat: any) => ({
            ...dat,
            department: departments?.find(
              (dep) => dep.id === dat.department_id
            ),
            commercial: users?.find((use) => use.id === dat.commercial_id),
          }))
        );
      })();
    }
  }, [users, departments]);

  useEffect(() => {
    (async () => {
      let { data } = await getTasks();
      dispatchTasks(data);
    })();
  }, [user]);

  return (
    <DataContext.Provider
      value={{
        bats,
        folders,
        clients,
        users,
        sections,
        offsetShapes,
        flexoShapes,
        user,
        departments,
        loadUsers,
        dispatchUser,
        dispatchUsers,
        dispatchClients,
        dispatchDepartment,
        dispatchOffsetShapes,
        dispatchBats,
        dispatchTasks,
        status,
        tasks,
        rules,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
