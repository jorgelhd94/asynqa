export { Environment } from "@bindings/internal/domain/models";

export type EnvironmentFormData = {
  Name: string;
  Host: string;
  Password: string;
  DB: number;
  UseTLS: boolean;
  TLSSkipVerify: boolean;
};
