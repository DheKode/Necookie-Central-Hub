const fs = require('fs');
const path = require('path');

const appJson = require('./app.json');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

module.exports = () => {
  const rootEnv = loadEnvFile(path.resolve(__dirname, '../.env'));

  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    rootEnv.EXPO_PUBLIC_SUPABASE_URL ||
    rootEnv.VITE_SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    rootEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    rootEnv.VITE_SUPABASE_ANON_KEY ||
    '';

  return {
    ...appJson,
    expo: {
      ...appJson.expo,
      extra: {
        ...appJson.expo?.extra,
        supabaseUrl,
        supabaseAnonKey,
      },
    },
  };
};
