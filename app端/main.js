import { createSSRApp } from 'vue'
import App from './App.vue'
import config from './config/index.js'

export function createApp() {
    const app = createSSRApp(App)

    // 全局配置
    app.config.globalProperties.$baseUrl = config.baseUrl

    return {
        app
    }
}
