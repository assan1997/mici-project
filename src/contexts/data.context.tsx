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
import { useToast } from "@/contexts/toast.context";

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
  shape: ShapeInterface;
  shape_id: number;
  reference: string;
  bat: any;
  details: string;
  updated_at: string;
  created_at: string;
  id: number;
  status_id: number;
  rule_id: number;
  printing_plate_id: number;
  logs: any[];
  shape_to_order_at: string | null;
  plate_to_order_at: string | null;
}

export interface BatInterface {
  client: Client;
  product: any;
  fabrication: any;
  commercial: Client;
  department: Department;
  shape: ShapeInterface;
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
  commercial: User;
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
  assignable: any;
  created_at: string;
  description: string;
  id: number;
  started_at: string | null;
  status: string;
  updated_at: string | null;
  assignable_type: string;
  user_id: number;
}

export interface User {
  slice(arg0: number, arg1: number): unknown;
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
  offsetShapes: ShapeInterface[] | undefined;
  flexoShapes: FlexoShape[] | undefined;
  dispatchUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  dispatchUsers: React.Dispatch<React.SetStateAction<User[] | undefined>>;
  dispatchClients: React.Dispatch<React.SetStateAction<Client[] | undefined>>;
  dispatchDepartment: React.Dispatch<React.SetStateAction<Department[]>>;
  dispatchOffsetShapes: React.Dispatch<
    React.SetStateAction<ShapeInterface[] | undefined>
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
  onRefreshingShape: Boolean;
  onRefreshingTask: Boolean;
  onRefreshingUsers: Boolean;
  refreshShapeData: Function;
  refreshTaskData: Function;
  refreshUsersData: Function;
  refreshClientsData: Function;
  getUser: Function;
  getSections: Function;
  getDepartements: Function;
  getUsers: Function;
  getClients: Function;
  getAllShapes: Function;
  getAllTasks: Function;
  getFolders: Function;
  getBats: Function;
  onRefreshingData: Boolean;
  checkIfCommercial: (user: User) => Boolean;
}
export interface Status {
  id: number;
  name: string;
}
export interface ShapeInterface {
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
  dim_int: string;
  compression_box: string;
  theoretical_weight: string;
  weight_code: string;
  weight: string;
  cardboard_junction: string;
  plate_surface: string;
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
  onRefreshingShape: false,
  onRefreshingTask: false,
  onRefreshingUsers: false,
  onRefreshingData: false,
  refreshShapeData: (cb: Function) => {},
  refreshTaskData: () => {},
  refreshUsersData: () => {},
  refreshClientsData: () => {},
  getUser: () => {},
  getSections: () => {},
  getDepartements: () => {},
  getUsers: () => {},
  getClients: () => {},
  getAllShapes: () => {},
  getAllTasks: () => {},
  getFolders: () => {},
  getBats: () => {},
  checkIfCommercial: (arg) => false,
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
  const [offsetShapes, setOffsetShapes] = useState<
    ShapeInterface[] | undefined
  >();
  const [flexoShapes, setFlexoShapes] = useState<FlexoShape[] | undefined>();
  const [bats, setBats] = useState<BatInterface[] | undefined>();
  const [tasks, setTasks] = useState<TaskInterface[] | undefined>();
  const { showToast } = useToast();

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

  const getUser = async () => {
    if (user) return;
    const { data, success } = await refreshUser();
    setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadCurrentUser: true }));
    if (!success) {
      Router.push("/");
    }
    dispatchUser(data);
  };
  useEffect(() => {
    getUser();
  }, []);

  const getDepartements = async () => {
    const { data, success } = await getAllDepartments();
    setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadDepartments: true }));
    if (!success) return;
    dispatchDepartment(data);
  };
  useEffect(() => {
    if (departments.length > 0) return;
    getDepartements();
  }, [user]);

  const getSections = async () => {
    const { data, success } = await getAllSections();
    setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isloadSections: true }));
    if (!success) return;
    dispatchSection(data);
  };

  useEffect(() => {
    if (sections.length > 0) return;
    getSections();
  }, [user]);

  const getUsers = async () => {
    const { data, success } = await getAllUsers();
    setLoadUsers((tmp: LoadUsers) => ({ ...tmp, isLoadAllUsers: true }));
    if (!success) return;
    dispatchUsers(data);
  };

  useEffect(() => {
    if (users) return;
    getUsers();
  }, [user]);

  const getClients = async () => {
    const { data, success } = await getAllClients();
    if (!success) return;
    dispatchClients(data);
  };

  useEffect(() => {
    if (clients) return;
    getClients();
  }, [user]);

  const getAllShapes = async () => {
    let { data, success } = await getAllOffsetShapes();
    if (!success) return;
    dispatchOffsetShapes(
      data?.map((dat: any) => ({
        ...dat,
        commercial: users?.find((use) => use.id === dat.commercial_id),
      }))
    );
  };

  // useEffect(() => {
  //   if (offsetShapes) return;
  //   if (users && users?.length > 0) {
  //     getAllShapes();
  //   }
  // }, [users, getAllShapes]);

  const getFolders = async () => {
    let { allFolders, success } = await getAllFolders();
    if (!success) return;
    dispatchFolders(
      allFolders?.map((dat: any) => ({
        ...dat,
        commercial: users?.find((use) => use.id === dat.commercial_id),
      }))
    );
  };

  useEffect(() => {
    if (folders) return;
    if (users && users?.length > 0) {
      getFolders();
    }
  }, [users]);

  const getBats = async () => {
    let { data, success } = await getAllBats();
    if (!success) return;
    dispatchBats(
      data?.map((dat: any) => ({
        ...dat,
        department: departments?.find((dep) => dep.id === dat.department_id),
        commercial: users?.find((use) => use.id === dat.commercial_id),
      }))
    );
  };

  // useEffect(() => {
  //   if (bats) return;
  //   if (users && users?.length > 0 && departments && departments.length > 0) {
  //     getBats();
  //   }
  // }, [users, departments]);

  const getAllTasks = async () => {
    let { data } = await getTasks();
    dispatchTasks(data);
  };

  // useEffect(() => {
  //   if (tasks) return;
  //   getAllTasks();
  // }, [user, getAllTasks]);

  const [onRefreshingShape, setOnRefreshingShape] = useState<boolean>(false);
  const refreshShapeData = async (cb: Function) => {
    setOnRefreshingShape(true);
    const { data: departmentsData, success: depSuccess } =
      await getAllDepartments();
    dispatchDepartment(departmentsData);
    const { data: sections, success: secSuccess } = await getAllSections();
    dispatchSection(sections);
    let { data: shapesData, success: shapesSuccess } =
      await getAllOffsetShapes();
    dispatchOffsetShapes(
      shapesData?.map((dat: any) => ({
        ...dat,
        commercial: users?.find((use) => use.id === dat.commercial_id),
      }))
    );

    setOnRefreshingShape(false);
    if (depSuccess && secSuccess && shapesSuccess) {
      showToast({
        type: "success",
        message: "Synchronisation terminée",
        position: "top-center",
      });

      cb();
    } else {
      showToast({
        type: "danger",
        message: "Une erreur est survenue",
        position: "top-center",
      });
    }
  };
  const [onRefreshingTask, setOnRefreshingTask] = useState<boolean>(false);
  const [onRefreshingUsers, setOnRefreshingUsers] = useState<boolean>(false);
  const [onRefreshingData, setOnRefreshingClients] = useState<boolean>(false);

  const refreshTaskData = async () => {
    setOnRefreshingTask(true);
    let { data, success } = await getTasks();
    dispatchTasks(data);
    setOnRefreshingTask(false);
    if (success) {
      showToast({
        type: "success",
        message: "Synchronisation terminée",
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "Une erreur est survenue",
        position: "top-center",
      });
    }
  };

  const refreshUsersData = async () => {
    setOnRefreshingUsers(true);
    let { data, success } = await getAllUsers();
    dispatchUsers(data);
    if (success) {
      showToast({
        type: "success",
        message: "Synchronisation terminée",
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "Une erreur est survenue",
        position: "top-center",
      });
    }
    setOnRefreshingUsers(false);
  };

  const refreshClientsData = async () => {
    setOnRefreshingClients(true);
    let { data, success } = await getAllClients();
    dispatchClients(data);
    setOnRefreshingClients(false);
    if (success) {
      showToast({
        type: "success",
        message: "Synchronisation terminée",
        position: "top-center",
      });
    } else {
      showToast({
        type: "danger",
        message: "Une erreur est survenue",
        position: "top-center",
      });
    }
  };

  function checkIfCommercial(user: User): Boolean {
    return user.sections.map((section: Section) => section.id).includes(6);
  }

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
        refreshShapeData,
        refreshTaskData,
        refreshUsersData,
        refreshClientsData,
        onRefreshingUsers,
        onRefreshingShape,
        onRefreshingTask,
        onRefreshingData,
        getUser,
        getSections,
        getDepartements,
        getUsers,
        getClients,
        getAllShapes,
        getAllTasks,
        getFolders,
        getBats,
        checkIfCommercial,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
