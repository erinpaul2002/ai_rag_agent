// src/plugins/pluginInterface.ts
// Defines the plugin interface and types

export interface Plugin {
  name: string;
  description: string;
  canHandle(query: string): boolean;
  handle(query: string): Promise<string>;
}

export type PluginResult = {
  plugin: string;
  output: string;
};
