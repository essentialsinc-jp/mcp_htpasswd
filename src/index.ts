#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// 型定義
interface HtpasswdCredentials {
  username: string;
  password: string;
}

// バリデーションスキーマ
const credentialsSchema = {
  username: z.string().min(1, "Username cannot be empty"),
  password: z.string().min(1, "Password cannot be empty")
};

const promptCredentialsSchema = {
  username: z.string().min(1, "Username cannot be empty. This will be the name before the colon in the htpasswd entry."),
  password: z.string().min(1, "Password cannot be empty. This will be securely hashed.")
};

// ユーティリティ関数
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// メイン機能：htpasswdエントリの生成
export async function generateHtpasswdEntry(username: string, password: string): Promise<string> {
  if (!username || !password) {
    throw new Error("Username and password cannot be empty");
  }
  if (username.includes(':')) {
    throw new Error("Username cannot contain a colon (:)");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return `${username}:${hashedPassword}`;
}

// MCPサーバーの設定
const server = new Server({
  name: "HtpasswdToolServer",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
    prompts: {}
  }
});

// ツール一覧の定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [{
      name: "generateHtpasswd",
      description: "Generate an htpasswd entry for Apache web server authentication. This tool creates a bcrypt-hashed password entry in the format 'username:hashedpassword' that can be used in .htpasswd files.",
      inputSchema: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "The username for the htpasswd entry. This will appear before the colon in the output. Cannot contain colons.",
            minLength: 1
          },
          password: {
            type: "string",
            description: "The plain text password to be hashed. This will be securely hashed using bcrypt with a salt.",
            minLength: 1
          }
        },
        required: ["username", "password"]
      }
    }]
  };
});

// ツール実行の処理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generateHtpasswd") {
    const args = request.params.arguments as unknown as HtpasswdCredentials;
    const { username, password } = args;
    
    try {
      const htpasswdEntry = await generateHtpasswdEntry(username, password);
      return {
        content: [{ type: "text", text: htpasswdEntry }]
      };
    } catch (error: unknown) {
      return {
        content: [{ type: "text", text: `Error generating htpasswd: ${getErrorMessage(error)}` }],
        isError: true
      };
    }
  }
  throw new Error("Tool not found");
});

// プロンプト一覧の定義
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [{
      name: "interactiveGenerateHtpasswd",
      description: "Interactive prompt to generate htpasswd entries with user input validation",
      arguments: [{
        name: "username",
        description: "The username for the htpasswd entry. This will be the name before the colon in the htpasswd entry.",
        required: true
      }, {
        name: "password",
        description: "The password to be hashed. This will be securely hashed using bcrypt.",
        required: true
      }]
    }]
  };
});

// プロンプト実行の処理
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === "interactiveGenerateHtpasswd") {
    const args = request.params.arguments as unknown as HtpasswdCredentials;
    const { username, password } = args;
    
    try {
      const htpasswdEntry = await generateHtpasswdEntry(username, password);
      return {
        description: "Generated htpasswd entry",
        messages: [
          {
            role: "assistant",
            content: { type: "text", text: htpasswdEntry }
          }
        ]
      };
    } catch (error: unknown) {
      return {
        description: "Error generating htpasswd entry",
        messages: [
          {
            role: "assistant",
            content: { type: "text", text: `Error: ${getErrorMessage(error)}` }
          }
        ]
      };
    }
  }
  throw new Error("Prompt not found");
});

// サーバー起動
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
