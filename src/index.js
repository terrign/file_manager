import { CliPlugin, NavigatorPlugin, OsPlugin, SessionPlugin } from './plugins/index.js';

class FileManager {
  _plugins = {};

  constructor(...plugins) {
    for (const PluginConstructor of plugins) {
      const plugin = new PluginConstructor(this);
      const { cliDescriptor, key } = plugin;
      if (this[key]) {
        throw new Error(`Plugin with key "${key}" already exists`);
      }
      this._plugins[key] = plugin;
      this._plugins.cli.registerCommands(key, cliDescriptor);
    }
  }
}

new FileManager(CliPlugin, OsPlugin, NavigatorPlugin, SessionPlugin);
