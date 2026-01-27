# minie

这是一个放在仓库内的最小重构项目，用于在不改动原始 `src` 目录代码的前提下，逐步用 TypeScript + Vue 重构部分逻辑。

快速开始：

```bash
cd minie
npm install
npm run dev
```

建议的第一步：重构数据模型（`src/models/Node.ts`），把多叉树的核心操作抽成独立、可测试的 TypeScript 模块；随后再逐步替换渲染和交互层。

优先级建议：
- 第一阶段：数据模型（Node / Tree 操作）
- 第二阶段：业务逻辑（minder核心操作、command）
- 第三阶段：渲染层（基于 kity 的桥接层）
