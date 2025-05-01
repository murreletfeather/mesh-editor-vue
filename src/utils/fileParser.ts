import type { Node, Edge, MeshData } from '@/types/mesh'

export function parseMeshFile(content: string): MeshData {
  const lines = content.trim().split('\n')
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  lines.forEach((line, index) => {
    const coordinates = line.split(',').map(Number)
    if (coordinates.length === 6) { // 每行6个数字：x1,y1,x2,y2,x3,y3
      // 创建三个节点
      const node1: Node = { 
        id: `node-${index}-1`,
        x: coordinates[0], 
        y: coordinates[1] 
      }
      const node2: Node = { 
        id: `node-${index}-2`,
        x: coordinates[2], 
        y: coordinates[3] 
      }
      const node3: Node = { 
        id: `node-${index}-3`,
        x: coordinates[4], 
        y: coordinates[5] 
      }
      
      // 添加节点
      nodes.push(node1, node2, node3)
      
      // 创建边
      edges.push(
        { 
          id: `edge-${index}-1`,
          source: node1, 
          target: node2 
        },
        { 
          id: `edge-${index}-2`,
          source: node2, 
          target: node3 
        },
        { 
          id: `edge-${index}-3`,
          source: node3, 
          target: node1 
        }
      )
    }
  })

  return { nodes, edges }
}

export function parseDtaFile(content: string): MeshData {
  const lines = content.split('\n')
  const nodes: Node[] = []
  const edges: Edge[] = []
  let nodeCount = 0
  let edgeCount = 0
  let numVertices = 0
  let numTriangles = 0
  let currentLine = 0

  while (currentLine < lines.length) {
    const trimmedLine = lines[currentLine].trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      currentLine++
      continue
    }

    // 第一个非注释行包含节点数和三角形数
    const headerParts = trimmedLine.split(/\s+/)
    if (headerParts.length >= 2) {
      numVertices = parseInt(headerParts[0])
      numTriangles = parseInt(headerParts[1])
      currentLine++
      break
    }
    currentLine++
  }

  // 读取节点
  for (let i = 0; i < numVertices && currentLine < lines.length; i++) {
    const trimmedLine = lines[currentLine].trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      i--
      currentLine++
      continue
    }

    const parts = trimmedLine.split(/\s+/)
    if (parts.length >= 2) {
      const x = parseFloat(parts[0])
      const y = parseFloat(parts[1])
      const node: Node = {
        id: `node-${nodeCount++}`,
        x,
        y,
        config: {
          x,
          y,
          radius: 5,
          fill: '#fff',
          stroke: '#fff',
          strokeWidth: 2
        }
      }
      nodes.push(node)
    }
    currentLine++
  }

  // 读取三角形
  for (let i = 0; i < numTriangles && currentLine < lines.length; i++) {
    const trimmedLine = lines[currentLine].trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      i--
      currentLine++
      continue
    }

    const parts = trimmedLine.split(/\s+/)
    if (parts.length >= 3) {
      const indices = parts.slice(0, 3).map(p => parseInt(p) - 1) // .dta文件也使用1-based索引
      if (indices.every(idx => idx >= 0 && idx < nodes.length)) {
        // 创建三角形的三条边
        for (let j = 0; j < 3; j++) {
          const startIdx = indices[j]
          const endIdx = indices[(j + 1) % 3]
          
          // 检查边是否已存在
          const edgeExists = edges.some(e => 
            (e.startNodeId === nodes[startIdx].id && e.endNodeId === nodes[endIdx].id) ||
            (e.startNodeId === nodes[endIdx].id && e.endNodeId === nodes[startIdx].id)
          )
          
          if (!edgeExists) {
            const edge: Edge = {
              id: `edge-${edgeCount++}`,
              startNodeId: nodes[startIdx].id,
              endNodeId: nodes[endIdx].id,
              config: {
                points: [0, 0, 0, 0],
                stroke: '#fff',
                strokeWidth: 2
              }
            }
            edges.push(edge)
          }
        }
      }
    }
    currentLine++
  }

  return { nodes, edges }
}