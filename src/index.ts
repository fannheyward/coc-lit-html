import { ExtensionContext, extensions, workspace, WorkspaceConfiguration } from 'coc.nvim';

const typeScriptExtensionId = 'coc-tsserver';
const pluginId = 'typescript-lit-html-plugin';
const configurationSection = 'lit-html';

interface SynchronizedConfiguration {
  tags?: ReadonlyArray<string>;
  format: {
    enabled?: boolean;
  };
}

export async function activate(context: ExtensionContext): Promise<void> {
  const extension = extensions.getExtension(typeScriptExtensionId).extension;
  if (!extension) {
    return;
  }

  await extension.activate();
  if (!extension.exports) {
    return;
  }

  const api = extension.exports;
  if (!api) {
    return;
  }

  workspace.onDidChangeConfiguration(
    e => {
      if (e.affectsConfiguration(configurationSection)) {
        synchronizeConfiguration(api);
      }
    },
    null,
    context.subscriptions
  );

  synchronizeConfiguration(api);
}

function synchronizeConfiguration(api: any): void {
  if (!api) return;
  api.configurePlugin(pluginId, getConfiguration());
}

function getConfiguration(): SynchronizedConfiguration {
  const config = workspace.getConfiguration(configurationSection);
  const outConfig: SynchronizedConfiguration = {
    format: {}
  };

  withConfigValue<string[]>(config, 'tags', tags => {
    outConfig.tags = tags;
  });
  withConfigValue<boolean>(config, 'format.enabled', enabled => {
    outConfig.format.enabled = enabled;
  });

  return outConfig;
}

function withConfigValue<T>(config: WorkspaceConfiguration, key: string, withValue: (value: T) => void): void {
  const configSetting = config.inspect(key);
  if (!configSetting) {
    return;
  }

  const value = config.get<T | undefined>(key, undefined);
  if (typeof value !== 'undefined') {
    withValue(value);
  }
}
