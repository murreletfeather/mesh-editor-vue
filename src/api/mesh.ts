import axios, { AxiosError } from 'axios'
import type { Node, Edge, MeshData, MeshResponse } from '@/types/mesh'

const API_BASE_URL = 'http://localhost:8080/api'

interface QMorphParameters {
  triangleToQuad: boolean
  epsilon1: number
  epsilon2: number
  topologicalCleanup: boolean
  minAngle: number
  globalSmoothing: boolean
  coinctol: number
  movetolerance: number
  obstol: number
  deltafactor: number
  mymin: number
  thetamax: number
  tol: number
  gamma: number
  maxiter: number
}

// 解析.mesh文件内容
export function parseMeshFile(content: string): MeshData {
  const lines = content.trim().split('\n')
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  lines.forEach((line, index) => {
    const coordinates = line.split(',').map(Number)
    if (coordinates.length === 6) { // 每行6个数字：x1,y1,x2,y2,x3,y3
      // 创建三个节点
      const node1: Node = { x: coordinates[0], y: coordinates[1] }
      const node2: Node = { x: coordinates[2], y: coordinates[3] }
      const node3: Node = { x: coordinates[4], y: coordinates[5] }
      
      // 添加节点
      nodes.push(node1, node2, node3)
      
      // 创建边
      edges.push(
        { source: node1, target: node2 },
        { source: node2, target: node3 },
        { source: node3, target: node1 }
      )
    }
  })

  return { nodes, edges }
}

// 将网格数据转换为后端需要的格式
function convertToBackendFormat(meshData: MeshData): string {
  const triangles = new Set<string>()
  
  // 每三个节点组成一个三角形
  for (let i = 0; i < meshData.nodes.length; i += 3) {
    if (i + 2 < meshData.nodes.length) {
      const node1 = meshData.nodes[i]
      const node2 = meshData.nodes[i + 1]
      const node3 = meshData.nodes[i + 2]
      
      const triangle = `${node1.x},${node1.y},${node2.x},${node2.y},${node3.x},${node3.y}`
      triangles.add(triangle)
    }
  }

  return Array.from(triangles).join('\n')
}

// 执行QMorph处理
export async function executeQMorph(
  meshData: MeshData, 
  parameters: QMorphParameters
): Promise<MeshResponse> {
  try {
    console.log('执行QMorph处理，原始数据:', meshData)
    
    const formattedData = convertToBackendFormat(meshData)
    const requestData = {
      meshData: formattedData,
      fileType: 'mesh',
      ...parameters
    }
    
    console.log('发送到后端的数据:', requestData)
    
    const response = await axios.post<MeshResponse>(
      `${API_BASE_URL}/mesh/process`,
      requestData
    )
    
    console.log('后端返回的数据:', response.data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      console.error('API 错误详情:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        requestConfig: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          data: axiosError.config?.data
        }
      })
    } else {
      console.error('未知错误:', error)
    }
    throw error
  }
} 