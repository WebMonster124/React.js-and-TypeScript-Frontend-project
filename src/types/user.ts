import { AuthUser } from './auth-user';

export interface UserAttribute {
  Name: string;
  Value: string;
}

export interface UserAttributesMap {
  'custom:position'?: string;
  email_verified?: boolean | string;
  email?: string;
  locale?: string;
  name?: string;
  phone_number_verified?: boolean | string;
  phone_number?: string;
  [key: string]: string | string[] | boolean;
}

export interface UserUpdates {
  userAttributes?: UserAttributesMap;
  [key: string]: any;
}

export interface User {
  Attributes: UserAttribute[];
  AttributesMap: UserAttributesMap;
  Enabled: boolean;
  UserCreateDate: string;
  UserLastModifiedDate: string;
  UserStatus: string;
  Username: string;
  group: string;
  editorAccess?: string[];
  graphicsAccess?: string[];
}

export type UserLike = User | AuthUser;
