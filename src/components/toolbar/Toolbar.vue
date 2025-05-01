<template>
  <div class="toolbar">
    <el-button-group>
      <el-button @click="undo" :disabled="!canUndo">撤销</el-button>
      <el-button @click="clearAll">清屏</el-button>
    </el-button-group>

    <el-divider />

    <el-button-group>
      <el-button :type="showGrid ? 'primary' : 'default'" @click="toggleGrid">
        {{ showGrid ? '隐藏网格' : '显示网格' }}
      </el-button>
      <el-button :type="showAxes ? 'primary' : 'default'" @click="toggleAxes">
        {{ showAxes ? '隐藏坐标轴' : '显示坐标轴' }}
      </el-button>
    </el-button-group>

    <el-divider />

    <el-button type="primary" @click="handleExecuteQMorph">
      Execute Q-Morph
    </el-button>

    <el-divider />

    <div class="zoom-control">
      <el-slider
        v-model="zoom"
        :min="10"
        :max="400"
        :step="10"
        vertical
        height="150px"
      />
    </div>

    <el-divider />

    <el-button-group>
      <el-button @click="exportToLatex">导出LaTeX</el-button>
      <el-button @click="importFile">导入文件</el-button>
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMeshStore } from '@/store/mesh'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import { parseMeshFile } from '@/utils/fileParser'
import type { Node, Edge, MeshData } from '@/types/mesh'
import { executeQMorph } from '@/api/mesh'

const meshStore = useMeshStore()

// 撤销/重做
const canUndo = computed(() => meshStore.currentHistoryIndex > 0)
const undo = () => meshStore.undo()
const clearAll = () => meshStore.clearAll()

// 显示控制
const showGrid = computed({
  get: () => meshStore.showGrid,
  set: (value) => meshStore.setShowGrid(value)
})

const showAxes = computed({
  get: () => meshStore.showAxes,
  set: (value) => meshStore.setShowAxes(value)
})

// 缩放控制
const zoom = computed({
  get: () => meshStore.zoom,
  set: (value) => meshStore.setZoom(value)
})

// 切换网格显示
const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

// 切换坐标轴显示
const toggleAxes = () => {
  showAxes.value = !showAxes.value
}

// 执行QMorph
const handleExecuteQMorph = async () => {
  if (!meshStore.nodes.length && !meshStore.edges.length) {
    ElMessage.warning('请先导入网格文件')
    return
  }

  try {
    const result = await executeQMorph({
      nodes: meshStore.nodes,
      edges: meshStore.edges
    }, {
      triangleToQuad: true,
      epsilon1: 0.04,
      epsilon2: 0.09,
      topologicalCleanup: true,
      minAngle: 200,
      globalSmoothing: true,
      coinctol: 0.01,
      movetolerance: 0.01,
      obstol: 0.1,
      deltafactor: 0.00001,
      mymin: 0.05,
      thetamax: 200,
      tol: 0.00001,
      gamma: 0.8,
      maxiter: 5
    })

    // 更新网格数据
    meshStore.$patch({
      nodes: result.nodes,
      edges: result.edges
    })
    meshStore.saveToHistory()

    ElMessage.success('Q-Morph执行成功')
  } catch (error) {
    console.error('执行Q-Morph错误:', error)
    ElMessage.error('执行Q-Morph失败: ' + (error as Error).message)
  }
}

// 文件操作
const exportToLatex = () => {
  // 实现导出到LaTeX的功能
  const content = generateLatexContent()
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, 'mesh.tex')
}

const importFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.mesh,.dta'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const content = await file.text()
        const meshData = parseMeshFile(content)
        
        // 直接更新store中的数据
        meshStore.$patch({
          nodes: meshData.nodes,
          edges: meshData.edges,
          originalMeshData: meshData // 保存原始数据用于后续处理
        })
        meshStore.saveToHistory()
        
        ElMessage.success('文件导入成功')
      } catch (error) {
        console.error('导入错误:', error)
        ElMessage.error('文件导入失败: ' + (error as Error).message)
      }
    }
  }
  input.click()
}

const generateLatexContent = () => {
  // 生成LaTeX格式的内容
  return `\\documentclass[12pt]{article}
\\usepackage{tikz}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\begin{document}

\\begin{tikzpicture}[scale=1.0]
  % Nodes
  ${meshStore.nodes.map(node => `\\node[circle,draw,inner sep=1pt] (${node.id}) at (${node.x.toFixed(3)},${node.y.toFixed(3)}) {};`).join('\n  ')}
  
  % Edges
  ${meshStore.edges.map(edge => `\\draw[thick] (${edge.source.id}) -- (${edge.target.id});`).join('\n  ')}
\\end{tikzpicture}

\\end{document}`
}
</script>

<style scoped>
.toolbar {
  padding: 10px;
  background-color: #1e1e1e;
  border-right: 1px solid #333;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.el-button-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-divider {
  margin: 10px 0;
  background-color: #333;
}

.zoom-control {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

:deep(.el-slider) {
  margin: 0;
}

:deep(.el-slider__runway) {
  background-color: #4a4a4a;
}

:deep(.el-slider__bar) {
  background-color: #409eff;
}

:deep(.el-slider__button) {
  border-color: #409eff;
}

:deep(.qmorph-dialog-modal) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-dialog) {
  margin: 0 !important;
  position: relative;
}

:deep(.el-dialog__header) {
  cursor: move;
  margin-right: 0;
  padding: 15px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  user-select: none;
}

:deep(.el-dialog__headerbtn) {
  top: 15px;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__footer) {
  padding: 15px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style> 