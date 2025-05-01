<script setup lang="ts">
import { ElContainer, ElAside, ElMain } from 'element-plus'
import Toolbar from './components/toolbar/Toolbar.vue'
import MeshEditor from './components/editor/MeshEditor.vue'
</script>

<template>
  <div class="app-container">
    <el-container>
      <el-aside width="200px">
        <toolbar />
      </el-aside>
      <el-main>
        <mesh-editor />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  background-color: #000;
}

.el-container {
  height: 100%;
  width: 100%;
  flex: 1;
  background-color: #000;
}

.el-aside {
  background-color: #1a1a1a;
  border-right: 1px solid #333;
  height: 100%;
  overflow-y: auto;
}

.el-main {
  padding: 0;
  background-color: #000;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>

<style>
:root {
  color-scheme: dark;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
