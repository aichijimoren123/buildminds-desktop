# 移除 Claude OAuth 认证 - 改造清单

> 目标：移除 Claude OAuth 认证方式，只保留自定义 baseURL 和 API key 的认证方式

## 进度总览

- [x] 1. 修改核心类型定义
- [x] 2. 简化凭证存储系统
- [x] 3. 移除 OAuth 认证文件
- [x] 4. 简化认证状态管理
- [x] 5. 简化配置存储
- [x] 6. 简化 Electron IPC 处理
- [x] 7. 简化 Onboarding UI
- [x] 8. 类型检查验证
- [x] 9. 清理 Settings UI 中的 Billing OAuth 代码

---

## 详细任务清单

### 1. 修改核心类型定义 ✅

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `packages/core/src/types/workspace.ts` | `AuthType` 从 `'api_key' \| 'oauth_token'` 改为 `'api_key'` | ✅ 完成 |

### 2. 简化凭证存储系统 ✅

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `packages/shared/src/credentials/types.ts` | 移除 `claude_oauth`, `craft_oauth` 凭证类型 | ✅ 完成 |
| `packages/shared/src/credentials/manager.ts` | 移除 OAuth 相关方法 | ✅ 完成 |

### 3. 移除 OAuth 认证文件 ✅

| 文件 | 操作 | 状态 |
|------|------|------|
| `packages/shared/src/auth/claude-oauth.ts` | 删除文件 | ✅ 完成 |
| `packages/shared/src/auth/claude-token.ts` | 删除文件 | ✅ 完成 |
| `packages/shared/src/auth/pkce.ts` | 删除文件 | ✅ 完成 |
| `packages/shared/src/auth/callback-server.ts` | 保留（Google/Slack/Microsoft OAuth 需要） | ✅ 保留 |
| `packages/shared/src/auth/callback-page.ts` | 保留（Google/Slack/Microsoft OAuth 需要） | ✅ 保留 |
| `packages/shared/src/auth/index.ts` | 更新导出 | ✅ 完成 |

### 4. 简化认证状态管理 ✅

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `packages/shared/src/auth/types.ts` | 移除 `craft` 和 `billing.claudeOAuthToken` 字段 | ✅ 完成 |
| `packages/shared/src/auth/state.ts` | 简化 `getAuthState`，移除 OAuth 相关逻辑 | ✅ 完成 |
| `packages/shared/src/auth/env.ts` | 简化为只支持 API key | ✅ 完成 |

### 5. 简化配置存储 ✅

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `packages/shared/src/config/storage.ts` | 移除 `getClaudeOAuthToken` 函数 | ✅ 完成 |

### 6. 简化 Electron IPC 处理 ✅

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `apps/electron/src/main/onboarding.ts` | 移除 Claude OAuth 相关 IPC 处理器 | ✅ 完成 |
| `apps/electron/src/preload/index.ts` | 移除 Claude OAuth 相关 API 暴露 | ✅ 完成 |
| `apps/electron/src/shared/types.ts` | 移除 OAuth IPC 通道定义和相关类型 | ✅ 完成 |

### 7. 简化 Onboarding UI ✅

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `apps/electron/src/renderer/components/onboarding/BillingMethodStep.tsx` | 删除文件 | ✅ 完成 |
| `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx` | 移除 OAuth 相关逻辑，只保留 API key 输入 | ✅ 完成 |
| `apps/electron/src/renderer/components/onboarding/OnboardingWizard.tsx` | 移除 billing-method 步骤，简化流程 | ✅ 完成 |
| `apps/electron/src/renderer/hooks/useOnboarding.ts` | 移除 OAuth 相关状态和处理逻辑 | ✅ 完成 |
| `apps/electron/src/renderer/components/onboarding/index.ts` | 移除 BillingMethodStep 导出 | ✅ 完成 |

### 8. 类型检查验证 ✅

| 命令 | 描述 | 状态 |
|------|------|------|
| `bun run typecheck:all` | 运行全项目类型检查，确保没有错误 | ✅ 通过 |

---

## 修改记录

### 2024-01-23

1. **✅ 完成** - 修改 `packages/core/src/types/workspace.ts`
   - 将 `AuthType` 从 `'api_key' | 'oauth_token'` 改为 `'api_key'`

2. **✅ 完成** - 修改 `packages/shared/src/credentials/types.ts`
   - 移除 `claude_oauth`, `craft_oauth` 凭证类型
   - 更新注释中的示例

3. **✅ 完成** - 修改 `packages/shared/src/credentials/manager.ts`
   - 移除 `getClaudeOAuth`, `setClaudeOAuth` 方法
   - 移除 `getClaudeOAuthCredentials`, `setClaudeOAuthCredentials` 方法
   - 移除 `getClaudeCodeOAuth`, `setClaudeCodeOAuth` 方法

4. **✅ 完成** - 删除 Claude OAuth 认证文件
   - 删除 `claude-oauth.ts`, `claude-token.ts`, `pkce.ts`
   - 保留 `callback-server.ts`, `callback-page.ts`（Google/Slack/Microsoft OAuth 需要）
   - 更新 `auth/index.ts` 导出

5. **✅ 完成** - 修改 `packages/shared/src/auth/types.ts`
   - 移除 `craft` 字段
   - 移除 `billing.claudeOAuthToken` 字段
   - 移除 `SetupNeeds.needsCraftAuth` 和 `needsReauth` 字段

6. **✅ 完成** - 修改 `packages/shared/src/auth/state.ts`
   - 移除 `getValidClaudeOAuthToken` 函数
   - 简化 `getAuthState` 和 `getSetupNeeds` 函数

7. **✅ 完成** - 修改 `packages/shared/src/auth/env.ts`
   - 移除 `ClaudeMaxCredentials` 类型和 `oauth_token` case
   - 简化 `setAuthEnvironment` 函数

8. **✅ 完成** - 修改 `packages/shared/src/config/storage.ts`
   - 移除 `getClaudeOAuthToken` 函数

9. **✅ 完成** - 修改 `apps/electron/src/main/onboarding.ts`
   - 移除所有 Claude OAuth IPC 处理器
   - 保留 MCP OAuth 处理器

10. **✅ 完成** - 修改 `apps/electron/src/shared/types.ts`
    - 移除 Claude OAuth IPC 通道定义
    - 移除 `ClaudeOAuthResult` 类型
    - 移除 ElectronAPI 中的 OAuth 方法声明

11. **✅ 完成** - 修改 `apps/electron/src/preload/index.ts`
    - 移除 Claude OAuth API 暴露

12. **✅ 完成** - 简化 Onboarding UI
    - 删除 `BillingMethodStep.tsx`
    - 修改 `OnboardingWizard.tsx` - 移除 billing-method 步骤
    - 修改 `CredentialsStep.tsx` - 只保留 API key 输入
    - 修改 `useOnboarding.ts` - 移除 OAuth 状态和逻辑
    - 修改 `index.ts` - 移除 BillingMethodStep 导出

13. **✅ 完成** - 修复其他依赖
    - 修改 `agent/diagnostics.ts` - 移除 OAuth token 检查
    - 修改 `agent/session-scoped-tools.ts` - 移除 OAuth token 使用
    - 修改 `config/validators.ts` - 修复 z.record() 调用语法

14. **✅ 完成** - 清理 Settings UI 中的 Billing OAuth 代码
    - 修改 `apps/electron/src/renderer/pages/settings/AppSettingsPage.tsx`
      - 移除 `ClaudeOAuthDialogContent` 组件
      - 移除 `ApiKeyDialogContent` 组件（已被 API Provider section 取代）
      - 移除 OAuth 状态变量和处理函数
      - 移除整个 Billing section（功能已合并到 API Provider section）
      - 清理未使用的 imports
    - 修改 `apps/electron/src/main/sessions.ts` - 移除 oauth_token 和 CLAUDE_CODE_OAUTH_TOKEN 处理
    - 修改 `apps/electron/src/main/ipc.ts`
      - 简化 `getBillingMethod` - 移除 oauth_token 检查
      - 简化 `updateBillingMethod` - 移除 oauth_token 凭证处理
      - 简化 `testProviderConnection` - 移除 OAuth token 回退逻辑

---

## 注意事项

1. ✅ 保留 MCP OAuth 功能（用于 workspace OAuth），只移除 Claude 账户 OAuth
2. ✅ 保留 `workspace_oauth`, `workspace_bearer` 等工作区级别的凭证类型
3. ✅ 保留其他 OAuth 提供者（Google, Slack, Microsoft）用于 sources 集成
4. ✅ 确保 API key + baseURL 的认证流程完整可用

## 新的 Onboarding 流程

原流程：Welcome → Billing Method (API Key/OAuth) → Credentials → Complete

新流程：Welcome → Credentials (API Key + 可选 Base URL) → Complete

## 已删除的文件

- `packages/shared/src/auth/claude-oauth.ts`
- `packages/shared/src/auth/claude-token.ts`
- `packages/shared/src/auth/pkce.ts`
- `apps/electron/src/renderer/components/onboarding/BillingMethodStep.tsx`
