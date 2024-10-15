import {
  CliPlugin,
  FsPlugin,
  HashPlugin,
  NavigatorPlugin,
  OsPlugin,
  SessionPlugin,
  ZipPlugin,
} from './plugins/index.js';

class FileManager {
  _plugins = {};

  constructor(...plugins) {
    for (const PluginConstructor of plugins) {
      const plugin = new PluginConstructor(this);
      const { cliDescriptor, key } = plugin;
      if (this._plugins[key]) {
        throw new Error(`Plugin with key "${key}" already exists`);
      }
      this._plugins[key] = plugin;
      this._plugins.cli.registerCommands(key, cliDescriptor);
    }
  }
}

new FileManager(
  CliPlugin,
  OsPlugin,
  NavigatorPlugin,
  FsPlugin,
  SessionPlugin,
  HashPlugin,
  ZipPlugin
);
