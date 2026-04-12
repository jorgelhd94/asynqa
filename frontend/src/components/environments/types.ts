import { domain } from "../../../wailsjs/go/models";

export type Environment = domain.Environment;

export type EnvironmentFormData = {
  Name: string;
  Host: string;
  Password: string;
  DB: number;
  UseTLS: boolean;
  TLSSkipVerify: boolean;
};
