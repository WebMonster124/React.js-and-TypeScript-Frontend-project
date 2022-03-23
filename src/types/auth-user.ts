export interface AuthUser {
  attributes: {
    'custom:position': string;
    email: string;
    email_verified: boolean;
    locale: string;
    name: string;
    phone_number: string;
    phone_number_verified: boolean;
  };
  group: string;
  editorAccess: string[];
  graphicsAccess: string[];
  username: string;
  challengeName?: string;
}
