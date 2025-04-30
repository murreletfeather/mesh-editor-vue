import type { Node, Edge } from '@/types/mesh'

interface MeshData {
  nodes: Node[]
  edges: Edge[]
}

export function parseMeshFile(content: string): MeshData {
  const lines = content.split('\n')
  const nodes: Map<string, Node> = new Map()
  const edges: Edge[] = []
  let edgeCount = 0

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    // 每行包含三个点的坐标：x1,y1, x2,y2, x3,y3
    const coords = trimmedLine.split(',').map(s => parseFloat(s.trim()))
    if (coords.length >= 6) {
      const points = [
        { x: coords[0], y: coords[1] },
        { x: coords[2], y: coords[3] },
        { x: coords[4], y: coords[5] }
      ]

      // 为每个点创建或获取节点
      points.forEach(point => {
        const key = `${point.x},${point.y}`
        if (!nodes.has(key)) {
          nodes.set(key, {
            id: `node-${nodes.size}`,
            x: point.x,
            y: point.y,
            config: {
              x: point.x,
              y: point.y,
              radius: 5,
              fill: '#fff',
              stroke: '#fff',
              strokeWidth: 2
            }
          })
        }
      })

      // 创建三角形的三条边
      for (let i = 0; i < 3; i++) {
        const startPoint = points[i]
        const endPoint = points[(i + 1) % 3]
        const startNode = nodes.get(`${startPoint.x},${startPoint.y}`)!
        const endNode = nodes.get(`${endPoint.x},${endPoint.y}`)!

        // 检查边是否已存在
        const edgeExists = edges.some(e => 
          (e.startNodeId === startNode.id && e.endNodeId === endNode.id) ||
          (e.startNodeId === endNode.id && e.endNodeId === startNode.id)
        )

        if (!edgeExists) {
          const edge: Edge = {
            id: `edge-${edgeCount++}`,
            startNodeId: startNode.id,
            endNodeId: endNode.id,
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

  return { 
    nodes: Array.from(nodes.values()),
    edges 
  }
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