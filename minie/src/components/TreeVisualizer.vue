<template>
  <section class="tree-visualizer">
    <header>
      <h2>树形数据预览</h2>
      <p>
        该视图直接读取 <code>TreeStore</code> 数据，以验证新增 / 删除 /
        移动等操作结果。
      </p>
    </header>
    <ul class="tree-list">
      <TreeNodeView :node="tree" :depth="0" :actions="actions" />
    </ul>
  </section>
</template>

<script setup lang="ts">
import TreeNodeView from '@core/components/TreeNodeView.vue';

export interface TreeSnapshot {
  id: string;
  text: string;
  children: TreeSnapshot[];
  isRoot: boolean;
  isSelected: boolean;
  collapsed?: boolean;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export interface TreeActions {
  addChild(nodeId: string): void;
  removeNode(nodeId: string): void;
  moveUp(nodeId: string): void;
  moveDown(nodeId: string): void;
  selectNode(nodeId: string): void;
  editNode(nodeId: string): void;
  focusNode(nodeId: string): void;
  toggleCollapse(nodeId: string): void;
}

defineProps<{ tree: TreeSnapshot; actions: TreeActions }>();
</script>

<style scoped>
.tree-visualizer {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1);
}

header {
  margin-bottom: 12px;
}

.tree-list {
  list-style: none;
  padding-left: 0;
}

code {
  background: #eee;
  border-radius: 4px;
  padding: 2px 4px;
}
</style>