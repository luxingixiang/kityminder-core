<template>
  <main class="app-shell">
    <header class="hero">
      <h1>minie — KityMinder 数据层重构</h1>
      <p>
        这一页将 <strong>TreeStore</strong> 与 Vue UI 连接起来，方便在重构过程中
        观察数据操作是否符合预期。
      </p>
    </header>
    <TreeVisualizer :tree="tree" :actions="actions" />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TreeVisualizer, {
  type TreeSnapshot,
  type TreeActions
} from '@core/components/TreeVisualizer.vue';
import { TreeStore } from '@core/models/TreeStore';
import { TreeNode } from '@core/models/Node';

const store = buildInitialStore();
const revision = ref(0);

const forceRefresh = () => {
  revision.value += 1;
};

const tree = computed<TreeSnapshot>(() => {
  revision.value;
  return toSnapshot(store.root, {
    isRoot: true,
    index: 0,
    total: 1
  });
});

const actions: TreeActions = {
  addChild(parentId) {
    const text = window.prompt('输入新节点的标题', '新节点');
    if (!text) return;
    store.addNode(parentId, { id: generateNodeId(), text });
    forceRefresh();
  },
  removeNode(nodeId) {
    if (!window.confirm('删除该节点及其所有子节点？')) return;
    try {
      store.removeNode(nodeId);
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
  }
};

function moveWithinParent(nodeId: string, offset: number) {
  const node = store.getNode(nodeId);
  if (!node || !node.parent) return;
  const siblings = node.parent.children;
  const currentIndex = siblings.indexOf(node);
  const targetIndex = currentIndex + offset;
  if (targetIndex < 0 || targetIndex >= siblings.length) return;
  // 先将节点从当前位置移除
  siblings.splice(currentIndex, 1);
  // 然后插入到目标位置
  node.parent.insertChild(node, targetIndex);
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

function toSnapshot(node: TreeNode, ctx: SnapshotCtx): TreeSnapshot {
  const { isRoot, index, total } = ctx;
  return {
    id: node.data.id,
    text: node.data.text ?? node.data.id,
    isRoot,
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
</style>
