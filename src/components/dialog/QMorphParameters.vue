<template>
  <el-dialog
    title="Parameters for QMorph"
    v-model="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="parameters-form">
      <el-form :model="parameters" label-position="left">
        <div class="form-section">
          <el-checkbox v-model="parameters.triangleToQuad" class="checkbox-item">
            Triangle to quad conversion
          </el-checkbox>
        </div>

        <div class="form-section">
          <div class="input-row">
            <label>Epsilon1= e1 * PI, e1=</label>
            <el-input v-model="parameters.epsilon1" type="number" class="param-input" />
          </div>

          <div class="input-row">
            <label>Epsilon2= e2 * PI, e2=</label>
            <el-input v-model="parameters.epsilon2" type="number" class="param-input" />
          </div>
        </div>

        <div class="form-section">
          <el-checkbox v-model="parameters.topologicalCleanup" class="checkbox-item">
            Topological clean-up
          </el-checkbox>
        </div>

        <div class="form-section">
          <div class="input-row">
            <label>Minimum size of greatest angle in a chevron</label>
            <el-input v-model="parameters.minChevronAngle" type="number" class="param-input" />
          </div>
        </div>

        <div class="form-section">
          <el-checkbox v-model="parameters.globalSmoothing" class="checkbox-item">
            Global smoothing
          </el-checkbox>
        </div>

        <div class="parameters-grid">
          <div class="grid-row">
            <div class="grid-item">
              <label>COINCTOL</label>
              <el-input v-model="parameters.COINCTOL" type="number" />
            </div>
            <div class="grid-item">
              <label>MOVETOLERANCE</label>
              <el-input v-model="parameters.MOVETOLERANCE" type="number" />
            </div>
            <div class="grid-item">
              <label>OBSTOL</label>
              <el-input v-model="parameters.OBSTOL" type="number" />
            </div>
          </div>

          <div class="grid-row">
            <div class="grid-item">
              <label>DELTAFACTOR</label>
              <el-input v-model="parameters.DELTAFACTOR" type="number" />
            </div>
            <div class="grid-item">
              <label>MYMIN</label>
              <el-input v-model="parameters.MYMIN" type="number" />
            </div>
            <div class="grid-item">
              <label>THETAMAX</label>
              <el-input v-model="parameters.THETAMAX" type="number" />
            </div>
          </div>

          <div class="grid-row">
            <div class="grid-item">
              <label>TOL</label>
              <el-input v-model="parameters.TOL" type="number" />
            </div>
            <div class="grid-item">
              <label>GAMMA</label>
              <el-input v-model="parameters.GAMMA" type="number" />
            </div>
            <div class="grid-item">
              <label>MAXITER</label>
              <el-input v-model="parameters.MAXITER" type="number" />
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleSetDefaults">Set defaults</el-button>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleRun">Run</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const dialogVisible = ref(false)

// 默认参数值
const defaultParameters = {
  triangleToQuad: true,
  epsilon1: 0.04,
  epsilon2: 0.09,
  topologicalCleanup: true,
  minChevronAngle: 200.0,
  globalSmoothing: true,
  COINCTOL: 0.01,
  MOVETOLERANCE: 0.01,
  OBSTOL: 0.1,
  DELTAFACTOR: 1.0e-5,
  MYMIN: 0.05,
  THETAMAX: 200.0,
  TOL: 1.0e-5,
  GAMMA: 0.8,
  MAXITER: 5
}

const parameters = reactive({ ...defaultParameters })

const handleSetDefaults = () => {
  Object.assign(parameters, defaultParameters)
}

const handleRun = () => {
  // TODO: 实现运行逻辑
  console.log('Running QMorph with parameters:', parameters)
  dialogVisible.value = false
}

// 确保打开对话框时使用默认值
const show = () => {
  Object.assign(parameters, defaultParameters)
  dialogVisible.value = true
}

// 导出方法供父组件调用
defineExpose({
  show
})
</script>

<style scoped>
.parameters-form {
  padding: 20px;
}

.form-section {
  margin-bottom: 24px;
}

.checkbox-item {
  margin-bottom: 16px;
  display: block;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.input-row label {
  min-width: 280px;
  color: #606266;
  font-size: 14px;
}

.param-input {
  width: 200px;
}

.parameters-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid-row {
  display: flex;
  gap: 24px;
  justify-content: space-between;
}

.grid-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grid-item label {
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

:deep(.el-dialog) {
  max-height: 90vh;
}

:deep(.el-dialog__body) {
  padding: 0;
  overflow-y: auto;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-input__wrapper) {
  padding: 1px 12px;
}

:deep(.el-input__inner) {
  font-family: monospace;
}
</style> 