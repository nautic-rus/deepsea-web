export interface Users {
  id: number;
  login: string;
  password: string;
  name: string;
  surname: string;
  profession: string;
  department: string;
  birthday: string;
  email: string;
  phone: string;
  tcid: number;
  avatar: string;
  avatar_full: string;
  rocket_login: string;
  gender: string;
  visibility: string;
  visible_projects: string[];
  visible_pages: string[];
  shared_access: string[];
  groups: string[];
  groupNames: string;
  permissions: string[];
  token: string;
  id_department: number;
  removed: number;
}
