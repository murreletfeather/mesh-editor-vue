import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './style.css'
import VueKonva from 'vue-konva'

// 创建Vue应用
const app = createApp(App)

// 使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 使用Element Plus
app.use(ElementPlus)

// 使用Vue Konva
app.use(VueKonva)

// 挂载应用
app.mount('#app')
