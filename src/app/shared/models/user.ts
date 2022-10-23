import { BaseEntity } from './base-entity';

export class User extends BaseEntity {
  firstName?: string;
  lastName?: string;
  name?: string;
  mobile: number;
  email: string;
  loginName: string;
  password: string;
  gender: string;
  dob: string;
  profile: string;
  status: number;
  userType: string;
}
