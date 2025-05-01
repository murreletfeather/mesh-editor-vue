<template>
  <div class="mesh-editor">
    <div class="canvas-container" ref="canvasContainer">
      <v-stage
        :config="{
          width: stageConfig.width,
          height: stageConfig.height,
          draggable: stageConfig.draggable,
          x: stageConfig.x,
          y: stageConfig.y
        }"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @dragmove="handleStageDragMove"
        @wheel="handleWheel"
      >
        <v-layer>
          <!-- 背景网格 -->
          <v-group v-if="showGrid">
            <v-line
              v-for="(line, index) in gridLines"
              :key="`grid-${index}`"
              :config="line"
            />
          </v-group>
          <!-- 坐标轴 -->
          <v-group v-if="showAxes">
            <v-line
              v-for="(line, index) in axisLines"
              :key="`axis-${index}`"
              :config="line"
            />
          </v-group>
          <!-- 节点 -->
          <v-circle
            v-for="node in meshStore.nodes"
            :key="node.id"
            :config="getNodeConfig(node)"
          />
          <!-- 边 -->
          <v-line
            v-for="edge in meshStore.edges"
            :key="edge.id"
            :config="getEdgeConfig(edge)"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { useMeshStore } from '@/store/mesh'
import type { Node, Edge } from '@/types/mesh'

const meshStore = useMeshStore()

// 添加调试信息
watch(() => meshStore.nodes, (newNodes) => {
  console.log('Nodes updated:', newNodes)
}, { deep: true })

watch(() => meshStore.edges, (newEdges) => {
  console.log('Edges updated:', newEdges)
}, { deep: true })

const canvasContainer = ref<HTMLElement | null>(null)

// 画布配置
const stageConfig = reactive({
  width: 800,
  height: 600,
  scale: 1,
  draggable: true,
  container: 'canvas-container',
  x: 0, // 舞台的偏移量
  y: 0
})

// 坐标系配置
const coordConfig = reactive({
  xmin: -2.0,
  xmax: 2.0,
  ymin: -2.0,
  ymax: 2.0,
  scale: 100, // 初始缩放比例
  gridIncr: 10 // 网格增量
})

// 缩放配置
const ZOOM_SPEED = 1.1 // 缩放速度
const MIN_ZOOM = 10 // 最小缩放比例
const MAX_ZOOM = 400 // 最大缩放比例

// 网格配置
const showGrid = computed(() => meshStore.showGrid)
const showAxes = computed(() => meshStore.showAxes)
const zoom = computed(() => meshStore.zoom)

// 网格线配置
const gridLines = computed(() => {
  const lines = []
  const width = stageConfig.width
  const height = stageConfig.height
  const scale = coordConfig.scale * (zoom.value / 100)
  const gridIncr = coordConfig.gridIncr * (zoom.value / 100)

  // 计算网格线的范围，考虑舞台偏移量
  const startX = -stageConfig.x - gridIncr
  const startY = -stageConfig.y - gridIncr
  const endX = width - stageConfig.x + gridIncr
  const endY = height - stageConfig.y + gridIncr

  // 计算网格线的数量
  const numHorizontalLines = Math.ceil((endY - startY) / gridIncr)
  const numVerticalLines = Math.ceil((endX - startX) / gridIncr)

  // 水平线
  for (let i = 0; i <= numHorizontalLines; i++) {
    const y = Math.floor(startY / gridIncr) * gridIncr + i * gridIncr
    lines.push({
      points: [startX, y, endX, y],
      stroke: '#808080', // 灰色
      strokeWidth: 1,
      opacity: 0.5
    })
  }

  // 垂直线
  for (let i = 0; i <= numVerticalLines; i++) {
    const x = Math.floor(startX / gridIncr) * gridIncr + i * gridIncr
    lines.push({
      points: [x, startY, x, endY],
      stroke: '#808080', // 灰色
      strokeWidth: 1,
      opacity: 0.5
    })
  }

  return lines
})

// 坐标轴配置
const axisLines = computed(() => {
  const width = stageConfig.width
  const height = stageConfig.height
  const centerX = width / 2 + stageConfig.x
  const centerY = height / 2 + stageConfig.y
  const scale = coordConfig.scale * (zoom.value / 100)
  const gridIncr = coordConfig.gridIncr * (zoom.value / 100)

  const lines = [
    // X轴
    {
      points: [-stageConfig.x, centerY, width - stageConfig.x, centerY],
      stroke: '#fff', // 白色
      strokeWidth: 2
    },
    // Y轴
    {
      points: [centerX, -stageConfig.y, centerX, height - stageConfig.y],
      stroke: '#fff', // 白色
      strokeWidth: 2
    }
  ]

  // 添加刻度
  const tickSize = gridIncr / 2
  const numTicks = 20 // 每个方向的刻度数量

  // X轴刻度
  for (let i = -numTicks; i <= numTicks; i++) {
    const x = centerX + i * gridIncr * 5
    if (x >= -stageConfig.x && x <= width - stageConfig.x) {
      lines.push({
        points: [x, centerY - tickSize, x, centerY + tickSize],
        stroke: '#fff',
        strokeWidth: 1
      })
    }
  }

  // Y轴刻度
  for (let i = -numTicks; i <= numTicks; i++) {
    const y = centerY + i * gridIncr * 5
    if (y >= -stageConfig.y && y <= height - stageConfig.y) {
      lines.push({
        points: [centerX - tickSize, y, centerX + tickSize, y],
        stroke: '#fff',
        strokeWidth: 1
      })
    }
  }

  return lines
})

// 鼠标事件处理
const isDragging = ref(false)
const selectedNode = ref<string | null>(null)
const isMiddleButtonPressed = ref(false)  // 添加中键按下状态

// 将舞台坐标转换为网格坐标
const stageToGrid = (stageX: number, stageY: number) => {
  const scale = coordConfig.scale * (zoom.value / 100)
  const centerX = stageConfig.width / 2
  const centerY = stageConfig.height / 2
  
  // 计算相对于中心点的偏移，考虑舞台的拖动偏移量和缩放
  const relativeX = (stageX - centerX - stageConfig.x) / scale
  const relativeY = (stageY - centerY - stageConfig.y) / scale
  
  // 转换为网格坐标
  return {
    x: relativeX,
    y: -relativeY // 注意：y轴需要翻转
  }
}

// 将网格坐标转换为舞台坐标
const gridToStage = (gridX: number, gridY: number) => {
  const scale = coordConfig.scale * (zoom.value / 100)
  const centerX = stageConfig.width / 2
  const centerY = stageConfig.height / 2
  
  // 转换为舞台坐标，考虑舞台的拖动偏移量
  return {
    x: gridX * scale + centerX + stageConfig.x,
    y: centerY - gridY * scale + stageConfig.y // 注意：y轴需要翻转
  }
}

const handleMouseDown = (e: any) => {
  const stage = e.target.getStage()
  const pos = stage.getPointerPosition()
  
  // 检查是否是鼠标中键
  if (e.evt.button === 1) {  // 0: 左键, 1: 中键, 2: 右键
    isMiddleButtonPressed.value = true
    return
  }
  
  // 获取鼠标相对于舞台的位置
  const stagePos = {
    x: pos.x - stageConfig.x,
    y: pos.y - stageConfig.y
  }
  
  const gridPos = stageToGrid(stagePos.x, stagePos.y)
  
  // 检查是否点击了现有节点
  const clickedNode = meshStore.nodes.find(node => {
    const dx = node.x - gridPos.x
    const dy = node.y - gridPos.y
    const clickRadius = 0.1 / (zoom.value / 100) // 根据缩放调整点击半径
    return Math.sqrt(dx * dx + dy * dy) < clickRadius
  })

  if (clickedNode) {
    // 选中节点
    selectedNode.value = clickedNode.id
    isDragging.value = true
    meshStore.addSelectedNode(clickedNode.id)
  } else if (!isMiddleButtonPressed.value) {  // 只有在非中键按下时才创建新节点
    // 创建新节点
    meshStore.addNode(gridPos.x, gridPos.y)
    meshStore.clearSelectedNodes() // 清除之前的选择
  }
}

const handleMouseMove = (e: any) => {
  if (isDragging.value && selectedNode.value) {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    
    // 获取鼠标相对于舞台的位置
    const stagePos = {
      x: pos.x - stageConfig.x,
      y: pos.y - stageConfig.y
    }
    
    const gridPos = stageToGrid(stagePos.x, stagePos.y)
    meshStore.updateNodePosition(selectedNode.value, gridPos.x, gridPos.y)
  }
}

const handleMouseUp = (e: any) => {
  // 重置中键状态
  if (e.evt.button === 1) {
    isMiddleButtonPressed.value = false
  }
  
  if (isDragging.value) {
    isDragging.value = false
    selectedNode.value = null
  }
}

// 添加键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    // 取消选择
    meshStore.clearSelectedNodes()
    selectedNode.value = null
    isDragging.value = false
  } else if (e.key === 'Delete' && selectedNode.value) {
    // 删除选中的节点
    meshStore.deleteNode(selectedNode.value)
    meshStore.clearSelectedNodes()
    selectedNode.value = null
  }
}

// 监听容器大小变化
const handleResize = () => {
  if (canvasContainer.value) {
    const width = canvasContainer.value.clientWidth
    const height = canvasContainer.value.clientHeight
    console.log('Container size:', { width, height })
    stageConfig.width = width
    stageConfig.height = height
  }
}

// 添加舞台拖动事件处理
const handleStageDragMove = (e: any) => {
  const stage = e.target
  stageConfig.x = stage.x()
  stageConfig.y = stage.y()
}

// 处理鼠标滚轮缩放
const handleWheel = (e: any) => {
  e.evt.preventDefault() // 阻止默认滚动行为

  const stage = e.target.getStage()
  const oldScale = zoom.value / 100
  const pointer = stage.getPointerPosition()

  // 计算鼠标相对于舞台的位置
  const mousePointTo = {
    x: (pointer.x - stageConfig.x) / oldScale,
    y: (pointer.y - stageConfig.y) / oldScale
  }

  // 根据滚轮方向确定新的缩放比例
  let newZoom = e.evt.deltaY < 0 ? zoom.value * ZOOM_SPEED : zoom.value / ZOOM_SPEED
  newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom))
  const newScale = newZoom / 100

  // 计算新的舞台位置，使缩放以鼠标位置为中心
  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale
  }

  // 更新舞台位置和缩放比例
  stageConfig.x = newPos.x
  stageConfig.y = newPos.y
  meshStore.setZoom(newZoom)
}

// 初始化
onMounted(() => {
  console.log('MeshEditor mounted')
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
  
  // 添加调试信息
  console.log('Stage config:', stageConfig)
  console.log('Container element:', canvasContainer.value)
  console.log('Grid lines:', gridLines.value)
  console.log('Axis lines:', axisLines.value)
})

// 清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})

// 更新节点和边的显示样式
const getNodeConfig = (node: Node) => {
  const stagePos = gridToStage(node.x, node.y)
  const baseConfig = {
    x: stagePos.x,
    y: stagePos.y,
    radius: 5 / (zoom.value / 100),
    strokeWidth: 2 / (zoom.value / 100),
    fill: '#fff',
    stroke: '#fff'
  }
  
  // 选中状态显示不同的颜色
  if (node.id === selectedNode.value) {
    return {
      ...baseConfig,
      fill: '#ff0',
      stroke: '#ff0'
    }
  } else if (meshStore.selectedNodes.includes(node.id)) {
    return {
      ...baseConfig,
      fill: '#0f0',
      stroke: '#0f0'
    }
  }
  
  return baseConfig
}

const getEdgeConfig = (edge: Edge) => {
  const startPos = gridToStage(edge.source.x, edge.source.y)
  const endPos = gridToStage(edge.target.x, edge.target.y)
  
  return {
    points: [startPos.x, startPos.y, endPos.x, endPos.y],
    strokeWidth: 2 / (zoom.value / 100),
    stroke: '#fff'
  }
}
</script>

<style scoped>
.mesh-editor {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* 确保canvas元素正确显示 */
.konvajs-content {
  background-color: #000;
}

canvas {
  display: block;
}

:deep(.v-stage) {
  width: 100% !important;
  height: 100% !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  background-color: #000;
}

:deep(.v-layer) {
  width: 100% !important;
  height: 100% !important;
}
</style> 