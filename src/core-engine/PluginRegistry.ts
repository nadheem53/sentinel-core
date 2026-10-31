import { IScannerPlugin } from '../scanners/IScannerPlugin';
import { IssueCategory } from './types';
import { globalEventBus } from './EventBus';

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, IScannerPlugin> = new Map();

  private constructor() {}

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  public register(plugin: IScannerPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginRegistry] Plugin with ID ${plugin.id} is already registered. Overwriting.`);
    }
    this.plugins.set(plugin.id, plugin);
    globalEventBus.emit('plugin_registered', plugin);
  }

  public unregister(pluginId: string): boolean {
    const result = this.plugins.delete(pluginId);
    globalEventBus.emit('plugin_unregistered', pluginId);
    return result;
  }

  public getPlugin(pluginId: string): IScannerPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  public getAllPlugins(): IScannerPlugin[] {
    return Array.from(this.plugins.values());
  }

  public getEnabledPlugins(): IScannerPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.enabled && p.isSupported());
  }

  public getPluginsByCategory(category: IssueCategory): IScannerPlugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.category === category);
  }

  public setPluginEnabled(pluginId: string, enabled: boolean): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = enabled;
      globalEventBus.emit('plugin_toggled', { pluginId, enabled });
    }
  }
}

export const pluginRegistry = PluginRegistry.getInstance();
