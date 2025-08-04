// src/plugins/pluginManager.ts
// Loads and manages plugins, and detects/calls plugins for a query
import { Plugin, PluginResult } from './pluginInterface';

import MathPlugin from './mathPlugin';
import WeatherPlugin from './weatherPlugin';

const plugins: Plugin[] = [MathPlugin, WeatherPlugin];

export function detectAndRunPlugin(query: string): Promise<PluginResult | null> {
  for (const plugin of plugins) {
    if (plugin.canHandle(query)) {
      return plugin.handle(query).then(output => ({ plugin: plugin.name, output }));
    }
  }
  return Promise.resolve(null);
}
