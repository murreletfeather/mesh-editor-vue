export interface Node {
  id?: string
  x: number // 网格坐标系中的 x 坐标
  y: number // 网格坐标系中的 y 坐标
  config?: {
    x: number // 舞台坐标系中的 x 坐标（由 gridToStage 函数计算）
    y: number // 舞台坐标系中的 y 坐标（由 gridToStage 函数计算）
    radius: number
    fill: string
    stroke: string
    strokeWidth: number
  }
}

export interface Edge {
  id?: string
  source: Node
  target: Node
  config?: {
    points: number[] // [x1, y1, x2, y2] 在舞台坐标系中的点（由 gridToStage 函数计算）
    stroke: string
    strokeWidth: number
  }
}

export interface MeshData {
  nodes: Node[]
  edges: Edge[]
}

export interface MeshResponse {
  nodes: Node[]
  edges: Edge[]
}

export interface QMorphParameters {
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