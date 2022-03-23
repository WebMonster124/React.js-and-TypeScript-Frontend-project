export type ConfigValue = string | number | boolean | ConfigValue[];

export enum ConfigType {
  boolean = 'boolean',
}

export interface ConfigOption {
  label: string;
  value: string | number;
}

export interface ConfigField {
  value: ConfigValue | ConfigValue[];
  type?: ConfigType;
  options?: ConfigOption[];
  hidden?: boolean;
}

export interface Config {
  [key: string]: ConfigField;
}
