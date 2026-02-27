<template>
  <main class="app-shell">
    <header class="hero">
      <h1>minie — KityMinder 数据层重构</h1>
      <p>
        这一页将 <strong>TreeStore</strong> 与 Vue UI 连接起来，方便在重构过程中
        观察数据操作是否符合预期。
      </p>
    </header>
    <section class="panel">
      <div class="panel-head">
        <h3>树结构预览</h3>
        <div class="panel-actions">
          <button @click="handleUndo" :disabled="!canUndo">撤销</button>
          <button @click="handleRedo" :disabled="!canRedo">重做</button>
          <button @click="resetDemo">重置示例数据</button>
          <button @click="handleExport">导出为 JSON</button>
          <button @click="handleImport">从 JSON 导入</button>
        </div>
      </div>
      <TreeVisualizer :tree="tree" :actions="actions" />
    </section>

    <section class="panel">
      <div class="panel-head">
        <h3>JSON 数据（可粘贴 / 编辑后导入）</h3>
      </div>
      <textarea
        v-model="jsonText"
        class="json-box"
        spellcheck="false"
        rows="14"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import TreeVisualizer, {
  type TreeSnapshot,
  type TreeActions
} from '@core/components/TreeVisualizer.vue';
import { TreeStore } from '@core/models/TreeStore';
import { TreeNode } from '@core/models/Node';
import { exportToJSON, importFromJSON } from '@core/protocol/json';
import { HistoryStack } from '@core/commands/history';
import {
  createAddNodeCommand,
  createRemoveNodeCommand,
  createMoveNodeCommand,
  createUpdateNodeTextCommand
} from '@core/commands/treeCommands';
import { CommandRegistry } from '@core/commands/registry';
import { bindShortcuts } from '@core/commands/shortcuts';

// 使用 shallowRef 保持 TreeStore 实例的原型与方法，避免被深度代理后类型不匹配
const store = shallowRef<TreeStore>(buildInitialStore());
const revision = ref(0);
const jsonText = ref('');
const history = new HistoryStack();
const commandRegistry = new CommandRegistry();
let unbindShortcuts: (() => void) | null = null;
const selectedId = ref<string>('root');

const forceRefresh = () => {
  revision.value += 1;
};

const tree = computed<TreeSnapshot>(() => {
  revision.value;
  return toSnapshot(store.value.root, {
    isRoot: true,
    index: 0,
    total: 1
  });
});

const canUndo = computed(() => {
  revision.value;
  return history.canUndo();
});

const canRedo = computed(() => {
  revision.value;
  return history.canRedo();
});

const actions: TreeActions = {
  addChild(parentId) {
    const text = window.prompt('输入新节点的标题', '新节点');
    if (!text) return;
    history.execute(
      createAddNodeCommand(store.value, parentId, {
        id: generateNodeId(),
        text
      })
    );
    forceRefresh();
  },
  removeNode(nodeId) {
    if (!window.confirm('删除该节点及其所有子节点？')) return;
    try {
      history.execute(createRemoveNodeCommand(store.value, nodeId));
      forceRefresh();
    } catch (error) {
      window.alert((error as Error).message);
    }
  },
  moveUp(nodeId) {
    moveWithinParent(nodeId, -1);
  },
  moveDown(nodeId) {
    moveWithinParent(nodeId, 1);
  },
  selectNode(nodeId) {
    selectedId.value = nodeId;
  },
  editNode(nodeId) {
    handleEditNode(nodeId);
  }
};

function moveWithinParent(nodeId: string, offset: number) {
  const node = store.value.getNode(nodeId);
  if (!node || !node.parent) return;
  const siblings = node.parent.children;
  const currentIndex = siblings.indexOf(node);
  const targetIndex = currentIndex + offset;
  if (targetIndex < 0 || targetIndex >= siblings.length) return;
  history.execute(
    createMoveNodeCommand(store.value, nodeId, node.parent.data.id, targetIndex)
  );
  forceRefresh();
}

function buildInitialStore() {
  const s = new TreeStore({ id: 'root', text: '中心主题' });
  s.addNode('root', { id: 'news', text: '新闻' });
  s.addNode('root', { id: 'search', text: '网页搜索' });
  const forum = s.addNode('root', { id: 'tieba', text: '贴吧' });
  s.addNode(forum.data.id, { id: 'tieba-hot', text: '热点讨论' });
  s.addNode(forum.data.id, { id: 'tieba-cool', text: '兴趣小组' });
  return s;
}

interface SnapshotCtx {
  isRoot: boolean;
  index: number;
  total: number;
}

// 将 TreeNode 转换为可供 TreeVisualizer 使用的快照对象。
function toSnapshot(node: TreeNode, ctx: SnapshotCtx): TreeSnapshot {
  const { isRoot, index, total } = ctx;
  return {
    id: node.data.id,
    text: node.data.text ?? node.data.id,
    isRoot,
    isSelected: node.data.id === selectedId.value,
    canRemove: !isRoot,
    canMoveUp: !isRoot && index > 0,
    canMoveDown: !isRoot && index < total - 1,
    children: node.children.map((child, childIndex) =>
      toSnapshot(child, {
        isRoot: false,
        index: childIndex,
        total: node.children.length
      })
    )
  };
}

let seq = 0;
function generateNodeId() {
  seq += 1;
  return `node-${Date.now()}-${seq}`;
}

function handleExport() {
  jsonText.value = JSON.stringify(exportToJSON(store.value), null, 2);
}

function handleImport() {
  if (!jsonText.value.trim()) {
    window.alert('请输入 JSON 数据');
    return;
  }
  try {
    const parsed = JSON.parse(jsonText.value);
    const next = importFromJSON(parsed);
    store.value = next;
    history.clear();
    forceRefresh();
  } catch (error) {
    window.alert((error as Error).message);
  }
}

function resetDemo() {
  store.value = buildInitialStore();
  history.clear();
  selectedId.value = 'root';
  forceRefresh();
}

function handleUndo() {
  history.undo();
  forceRefresh();
}

function handleRedo() {
  history.redo();
  forceRefresh();
}

function handleEditNode(nodeId: string) {
  const node = store.value.getNode(nodeId);
  if (!node) return;
  const nextText = window.prompt('编辑节点文本', node.data.text ?? node.data.id);
  if (nextText === null) return;
  history.execute(createUpdateNodeTextCommand(store.value, nodeId, nextText));
  forceRefresh();
}

function handleDeleteSelected() {
  if (!selectedId.value || selectedId.value === store.value.root.data.id) return;
  if (!window.confirm('删除选中节点及其所有子节点？')) return;
  history.execute(createRemoveNodeCommand(store.value, selectedId.value));
  selectedId.value = store.value.root.data.id;
  forceRefresh();
}

function registerCommands() {
  commandRegistry.register({
    name: 'undo',
    handler: handleUndo,
    shortcuts: ['ctrl+z']
  });
  commandRegistry.register({
    name: 'redo',
    handler: handleRedo,
    shortcuts: ['ctrl+y', 'ctrl+shift+z']
  });
  commandRegistry.register({
    name: 'edit-node',
    handler: () => handleEditNode(selectedId.value),
    shortcuts: ['enter']
  });
  commandRegistry.register({
    name: 'delete-node',
    handler: handleDeleteSelected,
    shortcuts: ['delete', 'backspace']
  });
}

onMounted(() => {
  registerCommands();
  unbindShortcuts = bindShortcuts(commandRegistry, window);
});

onUnmounted(() => {
  unbindShortcuts?.();
  unbindShortcuts = null;
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #f6f8fb 0%, #f0f4ff 100%);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft Yahei', sans-serif;
  color: #0f172a;
}

.hero {
  max-width: 720px;
  margin-bottom: 24px;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: 32px;
}

.hero p {
  margin: 0;
  line-height: 1.6;
}
.panel {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-actions button {
  margin-left: 8px;
}

.json-box {
  width: 100%;
  box-sizing: border-box;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
}
</style>
