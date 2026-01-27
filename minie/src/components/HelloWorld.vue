<template>
  <div>
    <p>
      欢迎使用 minie。当前项目为最小 Vue + TypeScript
      模板，用于在不修改原始代码的前提下逐步重构。
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "HelloWorld", // 显式设置组件名称，主要用于Devtools和递归组件
});
</script>

<style scoped>
p {
  color: #333;
}
</style>
