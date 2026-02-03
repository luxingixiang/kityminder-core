<template>
  <li>
    <div
      class="node-row"
      :style="{ marginLeft: depth * 20 + 'px' }"
    >
      <div class="node-chip">
        <span class="node-title">{{ node.text }}</span>
        <span class="node-id">{{ node.id }}</span>
      </div>
      <div class="node-actions">
        <button @click="actions.addChild(node.id)">添加子节点</button>
        <button
          @click="actions.moveUp(node.id)"
          :disabled="!node.canMoveUp"
        >上移</button>
        <button
          @click="actions.moveDown(node.id)"
          :disabled="!node.canMoveDown"
        >下移</button>
        <button
          @click="actions.removeNode(node.id)"
          :disabled="!node.canRemove"
        >删除</button>
      </div>
    </div>
    <ul v-if="node.children.length" class="node-children">
      <TreeNodeView
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :actions="actions"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { TreeSnapshot, TreeActions } from '@core/components/TreeVisualizer.vue';

defineProps<{
  node: TreeSnapshot;
  depth: number;
  actions: TreeActions;
}>();
</script>

<style scoped>
.node-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.node-chip {
  background: #f3f4f6;
  border-radius: 4px;
  padding: 6px 10px;
  min-width: 140px;
}

.node-title {
  font-weight: 600;
  margin-right: 6px;
}

.node-id {
  color: #65748b;
  font-size: 12px;
}

.node-actions button {
  margin-right: 4px;
}

.node-children {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
</style>