import { defineStore } from 'pinia'
import type { Node, Edge, MeshData } from '@/types/mesh'

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
    currentHistoryIndex: -1,
    fileType: '' as 'm' | 'dta' | '',
    originalMeshData: null as MeshData | null
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

    addEdge(startNode: Node, endNode: Node) {
      const edge: Edge = {
        id: `edge-${Date.now()}`,
        source: startNode,
        target: endNode,
        config: {
          points: [startNode.x, startNode.y, endNode.x, endNode.y],
          stroke: '#fff',
          strokeWidth: 2
        }
      }
      this.edges.push(edge)
      this.saveToHistory()
    },

    updateNodePosition(nodeId: string, x: number, y: number) {
      const node = this.nodes.find(n => n.id === nodeId)
      if (node) {
        node.x = x
        node.y = y
        this.updateConnectedEdges(node)
        this.saveToHistory()
      }
    },

    updateConnectedEdges(node: Node) {
      this.edges.forEach(edge => {
        if (edge.source.id === node.id) {
          edge.source = node
          edge.config!.points = [edge.source.x, edge.source.y, edge.target.x, edge.target.y]
        }
        if (edge.target.id === node.id) {
          edge.target = node
          edge.config!.points = [edge.source.x, edge.source.y, edge.target.x, edge.target.y]
        }
      })
    },

    deleteNode(nodeId: string) {
      this.nodes = this.nodes.filter(n => n.id !== nodeId)
      this.edges = this.edges.filter(e => e.source.id !== nodeId && e.target.id !== nodeId)
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
      const node = this.nodes.find(n => n.id === nodeId)
      if (node && !this.selectedNodes.includes(nodeId)) {
        this.selectedNodes.push(nodeId)
        
        if (this.selectedNodes.length === 2) {
          const startNode = this.nodes.find(n => n.id === this.selectedNodes[0])
          const endNode = this.nodes.find(n => n.id === this.selectedNodes[1])
          if (startNode && endNode) {
            this.addEdge(startNode, endNode)
          }
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