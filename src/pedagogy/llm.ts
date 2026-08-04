/**
 * EnSuLugar — Cliente LLM genérico (BYOK)
 *
 * Soporta Ollama local y APIs compatibles con OpenAI (OpenAI, Anthropic, etc.).
 * El usuario configura el proveedor en .env (nunca en el repo).
 *
 * Uso:
 *   const llm = new LLMClient();
 *   const respuesta = await llm.generate("prompt");
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

export interface LLMConfig {
  provider: "ollama" | "openai" | "anthropic";
  baseUrl: string;
  model: string;
  apiKey?: string;
}

function loadEnv(): Record<string, string> {
  const envPath = join(ROOT, ".env");
  const env: Record<string, string> = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
      }
    }
  }
  return env;
}

export function loadConfig(): LLMConfig {
  const env = loadEnv();
  const provider = (env.LLM_PROVIDER ?? "ollama") as LLMConfig["provider"];
  return {
    provider,
    baseUrl: env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    model: env.OLLAMA_MODEL ?? "deepseek-v4-flash",
    apiKey: env.OPENAI_API_KEY ?? env.ANTHROPIC_API_KEY,
  };
}

export class LLMClient {
  private config: LLMConfig;

  constructor(config?: LLMConfig) {
    this.config = config ?? loadConfig();
  }

  async generate(prompt: string, system?: string): Promise<string> {
    switch (this.config.provider) {
      case "ollama":
        return this.generateOllama(prompt, system);
      case "openai":
        return this.generateOpenAI(prompt, system);
      case "anthropic":
        return this.generateAnthropic(prompt, system);
      default:
        throw new Error(`Proveedor no soportado: ${this.config.provider}`);
    }
  }

  private async generateOllama(prompt: string, system?: string): Promise<string> {
    const url = `${this.config.baseUrl}/api/chat`;
    const messages: { role: string; content: string }[] = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama error (${res.status}): ${text}`);
    }

    const data = (await res.json()) as { message?: { content: string } };
    return data.message?.content ?? "";
  }

  private async generateOpenAI(prompt: string, system?: string): Promise<string> {
    const url = `${this.config.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`;
    const messages: { role: string; content: string }[] = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error (${res.status}): ${text}`);
    }

    const data = (await res.json()) as { choices?: { message?: { content: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
  }

  private async generateAnthropic(prompt: string, system?: string): Promise<string> {
    const url = "https://api.anthropic.com/v1/messages";
    const messages: { role: string; content: string }[] = [];
    messages.push({ role: "user", content: prompt });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 1024,
        system,
        messages,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic error (${res.status}): ${text}`);
    }

    const data = (await res.json()) as { content?: { text: string }[] };
    return data.content?.[0]?.text ?? "";
  }
}
