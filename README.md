# 论文生成助手（Paper Generator）

一个基于 React + TypeScript 的前端应用，通过调用 Dify API 自动生成论文大纲与正文，并提供标题建议、错误提示与恢复建议。

## 功能概述

- **论文大纲生成**：根据题目、专业、研究方向、字数与补充说明调用 Dify 工作流生成大纲。
- **标题建议**：输入种子主题后获取多个备选标题，便于快速确定论文题目。
- **论文正文生成**：确认或编辑大纲后触发正文生成流程，支持长文本写作。
- **错误提示与恢复**：对网络异常、超时、鉴权失败等情况提供清晰的中文提示。
- **帮助中心**：提供快速上手指南与常见问题解答，降低使用门槛。

## 目录结构

```
├── public/                # CRA 静态资源
├── src/
│   ├── components/
│   │   └── OutlineEditor/ # 通用大纲编辑器组件
│   ├── pages/
│   │   ├── Generate/      # 论文生成页
│   │   └── Help/          # 使用帮助页
│   ├── services/
│   │   └── difyApi.ts     # Dify API 封装与错误处理
│   ├── styles/            # 全局样式
│   ├── App.tsx            # 应用主入口
│   ├── index.tsx          # React 渲染入口
│   ├── setupProxy.js      # 本地开发代理：/v1 -> https://api.dify.ai
│   ├── setupTests.ts      # 测试初始化
│   └── App.test.tsx       # 基础渲染测试
├── package.json
└── tsconfig.json
```

## 本地开发

```bash
npm install
npm start
```

默认端口为 `3000`。如需自定义端口，可在启动前设置 `PORT` 环境变量。

### 代理说明

开发环境下，`src/setupProxy.js` 会将前端发往 `/v1/*` 的请求转发到 `https://api.dify.ai/v1`，并将超时设置为 10 分钟，以缓解长流程导致的 504 问题。

## 生产建议

- 若任务耗时较长，建议改造为 **SSE 流式输出** 或 **异步提交 + 结果轮询**，提升稳定性。
- 在生产环境中不要暴露 Dify API Key，可通过后端代理或 BFF 层统一管理密钥。
- 对关键调用增加监控与日志，记录失败类型、请求耗时与重试次数。

## 测试

```bash
npm test
```

该命令会以非 watch 模式运行 React Testing Library 提供的单元测试。
