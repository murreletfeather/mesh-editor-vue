<template>
  <div class="qmorph-parameters">
    <el-form label-position="left" label-width="140px">
      <el-form-item label="Triangle to quad">
        <el-switch v-model="parameters.triangleToQuad" />
      </el-form-item>
      
      <el-form-item label="Epsilon1">
        <el-input-number v-model="parameters.epsilon1" :step="0.01" :precision="2" />
      </el-form-item>
      
      <el-form-item label="Epsilon2">
        <el-input-number v-model="parameters.epsilon2" :step="0.01" :precision="2" />
      </el-form-item>
      
      <el-form-item label="Topological clean-up">
        <el-switch v-model="parameters.topologicalCleanup" />
      </el-form-item>
      
      <el-form-item label="Min angle">
        <el-input-number v-model="parameters.minAngle" :step="1" />
      </el-form-item>
      
      <el-form-item label="Global smoothing">
        <el-switch v-model="parameters.globalSmoothing" />
      </el-form-item>
      
      <el-form-item label="COINCTOL">
        <el-input-number v-model="parameters.coinctol" :step="0.01" :precision="2" />
      </el-form-item>
      
      <el-form-item label="MOVETOLERANCE">
        <el-input-number v-model="parameters.movetolerance" :step="0.01" :precision="2" />
      </el-form-item>
      
      <el-form-item label="OBSTOL">
        <el-input-number v-model="parameters.obstol" :step="0.1" :precision="1" />
      </el-form-item>
      
      <el-form-item label="DELTAFACTOR">
        <el-input-number v-model="parameters.deltafactor" :step="0.00001" :precision="5" />
      </el-form-item>
      
      <el-form-item label="MYMIN">
        <el-input-number v-model="parameters.mymin" :step="0.01" :precision="2" />
      </el-form-item>
      
      <el-form-item label="THETAMAX">
        <el-input-number v-model="parameters.thetamax" :step="1" />
      </el-form-item>
      
      <el-form-item label="TOL">
        <el-input-number v-model="parameters.tol" :step="0.00001" :precision="5" />
      </el-form-item>
      
      <el-form-item label="GAMMA">
        <el-input-number v-model="parameters.gamma" :step="0.1" :precision="1" />
      </el-form-item>
      
      <el-form-item label="MAXITER">
        <el-input-number v-model="parameters.maxiter" :step="1" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { QMorphParameters } from '@/types/mesh'

const parameters = reactive<QMorphParameters>({
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

defineExpose({
  parameters
})
</script>

<style scoped>
.qmorph-parameters {
  padding: 20px;
}

.el-form-item {
  margin-bottom: 15px;
}
</style> 