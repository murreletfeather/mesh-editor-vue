import { defineStore } from 'pinia'
import type { Node, Edge } from '@/types/mesh'

export const useMeshStore = defineStore('mesh', {
  state: () => ({
    nodes: [] as Node[],
    edges: [] as Edge[],
    selectedNode: null as Node | null,
    selectedEdge: null as Edge | null,
    selectedNodes: [] as string[],
    mode: 'node' as 'node' | 'triangle' | 'quad',
    zoom: 100,
    showGrid: true,
    showAxes: true,
    history: [] as any[],
    currentHistoryIndex: -1
  }),

  actions: {
    addNode(x: number, y: number) {
      const node: Node = {
        id: `node-${Date.now()}`,
        x,
        y,
        config: {
          x: 0,
          y: 0,
          radius: 5,
          fill: '#fff',
          stroke: '#fff',
          strokeWidth: 2
        }
      }
      this.nodes.push(node)
      this.saveToHistory()
    },

    addEdge(startNodeId: string, endNodeId: string) {
      const startNode = this.nodes.find(n => n.id === startNodeId)
      const endNode = this.nodes.find(n => n.id === endNodeId)
      
      if (startNode && endNode) {
        const edge: Edge = {
          id: `edge-${Date.now()}`,
          startNodeId,
          endNodeId,
          config: {
            points: [0, 0, 0, 0],
            stroke: '#fff',
            strokeWidth: 2
          }
        }
        this.edges.push(edge)
        this.saveToHistory()
      }
    },

    updateNodePosition(nodeId: string, x: number, y: number) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node) {
        node.x = x
        node.y = y
        this.saveToHistory()
      }
    },

    updateConnectedEdges(nodeId: string) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (!node) return

      this.edges.forEach(edge => {
        if (edge.startNodeId === nodeId || edge.endNodeId === nodeId) {
          const startNode = this.nodes.find(n => n.id === edge.startNodeId)
          const endNode = this.nodes.find(n => n.id === edge.endNodeId)
          if (startNode && endNode) {
            edge.config.points = [startNode.x, startNode.y, endNode.x, endNode.y]
          }
        }
      })
    },

    deleteNode(nodeId: string) {
      this.nodes = this.nodes.filter(n => n.id !== nodeId)
      this.edges = this.edges.filter(e => e.startNodeId !== nodeId && e.endNodeId !== nodeId)
      this.saveToHistory()
    },

    deleteEdge(edgeId: string) {
      this.edges = this.edges.filter(e => e.id !== edgeId)
      this.saveToHistory()
    },

    setZoom(zoom: number) {
      this.zoom = Math.max(10, Math.min(400, zoom))
    },

    toggleGrid() {
      this.showGrid = !this.showGrid
    },

    toggleAxes() {
      this.showAxes = !this.showAxes
    },

    setMode(mode: 'node' | 'triangle' | 'quad') {
      this.mode = mode
    },

    clearAll() {
      this.nodes = []
      this.edges = []
      this.saveToHistory()
    },

    saveToHistory() {
      this.history = this.history.slice(0, this.currentHistoryIndex + 1)
      this.history.push({
        nodes: JSON.parse(JSON.stringify(this.nodes)),
        edges: JSON.parse(JSON.stringify(this.edges))
      })
      this.currentHistoryIndex = this.history.length - 1
    },

    undo() {
      if (this.currentHistoryIndex > 0) {
        this.currentHistoryIndex--
        const state = this.history[this.currentHistoryIndex]
        this.nodes = JSON.parse(JSON.stringify(state.nodes))
        this.edges = JSON.parse(JSON.stringify(state.edges))
      }
    },

    redo() {
      if (this.currentHistoryIndex < this.history.length - 1) {
        this.currentHistoryIndex++
        const state = this.history[this.currentHistoryIndex]
        this.nodes = JSON.parse(JSON.stringify(state.nodes))
        this.edges = JSON.parse(JSON.stringify(state.edges))
      }
    },

    addSelectedNode(nodeId: string) {
      if (!this.selectedNodes.includes(nodeId)) {
        this.selectedNodes.push(nodeId)
        
        if (this.selectedNodes.length === 2) {
          this.addEdge(this.selectedNodes[0], this.selectedNodes[1])
          this.selectedNodes = [this.selectedNodes[1]]
        }
      }
    },

    clearSelectedNodes() {
      this.selectedNodes = []
    },

    setShowGrid(value: boolean) {
      this.showGrid = value
    },

    setShowAxes(value: boolean) {
      this.showAxes = value
    }
  }
}) 