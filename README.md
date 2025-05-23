# MCP htpasswd Server

Apache Webサーバー認証用のhtpasswdエントリを生成するModel Context Protocol (MCP) サーバーです。

## 概要

このプロジェクトは、htpasswdファイルで使用されるbcryptハッシュ化されたパスワードエントリを生成するためのMCPサーバーを提供します。Claude DesktopやCursor IDE、その他のMCP対応アプリケーションから直接利用できます。

## Model Context Protocol (MCP) について

Model Context Protocol (MCP) は、AI アプリケーションと大規模言語モデルが外部データソースやツールに接続するための標準化されたオープンプロトコルです。MCPを使用することで、構成可能で安全、かつ拡張可能なAIワークフローを構築できます。

### MCPの主な特徴

- **標準化された通信**: JSON-RPC 2.0ベースのプロトコル
- **セキュリティ**: 安全なデータアクセスとツール実行
- **拡張性**: 様々なデータソースとツールに対応
- **構成可能**: 柔軟なクライアント・サーバー構成

### アーキテクチャ

```
┌─────────────────────────────────────────┐
│          ホストアプリケーション           │
│      (Claude, IDE, ツールなど)          │
└─────────────┬───────────────────────────┘
              │ MCP Protocol
┌─────────────▼───────────────────────────┐
│           MCPクライアント               │
└─────────────┬───────────────────────────┘
              │
    ┌─────────▼─────────┐
    │   MCPサーバー A    │
    │  (htpasswd生成)   │
    └───────────────────┘
```

## 機能

- **htpasswdエントリ生成**: ユーザー名とパスワードからbcryptハッシュ化されたエントリを生成
- **セキュリティ**: bcryptアルゴリズムによる安全なパスワードハッシュ化
- **バリデーション**: 入力値の検証とエラーハンドリング
- **MCP準拠**: 標準的なMCPプロトコルに完全対応

## インストール

### 前提条件

- Node.js 20.0.0以上
- npm

### セットアップ

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd mcp_htpasswd
```

2. 依存関係をインストール:
```bash
npm install
```

3. プロジェクトをビルド:
```bash
npm run build
```

## 使用方法

### 開発モード

```bash
npm run dev
```

### 本番環境

```bash
npm run build
node dist/index.js
```

### MCPクライアントからの利用

このサーバーは以下のツールを提供します：

#### `generateHtpasswd`

Apache Webサーバー認証用のhtpasswdエントリを生成します。

**パラメータ:**
- `username` (string, 必須): htpasswdエントリのユーザー名。コロン(:)を含むことはできません
- `password` (string, 必須): ハッシュ化される平文パスワード

**戻り値:**
`username:hashedpassword` 形式の文字列

**使用例:**
```json
{
  "name": "generateHtpasswd",
  "arguments": {
    "username": "admin",
    "password": "secretpassword123"
  }
}
```

**出力例:**
```
admin:$2b$10$rKjp9h5f8g7j6k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e
```

## 技術仕様

### 依存関係

- **@modelcontextprotocol/sdk**: MCP TypeScript SDK
- **bcryptjs**: パスワードハッシュ化ライブラリ
- **zod**: スキーマバリデーション

### アーキテクチャ

- **Transport**: Stdio (標準入出力)
- **Protocol**: JSON-RPC 2.0
- **Hash Algorithm**: bcrypt (salt rounds: 10)

### セキュリティ

- bcryptアルゴリズムによる安全なパスワードハッシュ化
- ソルト付きハッシュ（10ラウンド）
- 入力値の厳密なバリデーション
- エラーハンドリングによる情報漏洩防止

## 開発

### プロジェクト構造

```
mcp_htpasswd/
├── src/
│   └── index.ts          # メインサーバーファイル
├── dist/                 # ビルド出力
├── package.json          # プロジェクト設定
├── tsconfig.json         # TypeScript設定
├── jest.config.js        # テスト設定
└── README.md            # このファイル
```

### スクリプト

- `npm run build`: TypeScriptをコンパイル
- `npm run dev`: 開発モードで実行
- `npm test`: テストを実行

### テスト

```bash
npm test
```

## Claude Desktopでの設定

Claude Desktopでこのサーバーを使用するには、設定ファイルに以下を追加してください：

```json
{
  "mcpServers": {
    "htpasswd": {
      "command": "node",
      "args": ["/path/to/mcp_htpasswd/dist/index.js"]
    }
  }
}
```

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 作者

Ozeki Masaki

## 貢献

プルリクエストやイシューの報告を歓迎します。貢献する前に、以下を確認してください：

1. コードスタイルガイドラインに従う
2. テストを追加・更新する
3. ドキュメントを更新する

## 関連リンク

- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Apache htpasswd ドキュメント](https://httpd.apache.org/docs/current/programs/htpasswd.html) 