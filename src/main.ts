import { createApp } from 'vue'
import 'vant/lib/index.css'
import './less/common.less'
import './style.css'
import App from './App.vue'
import router from '@/router/index'

createApp(App).use(router).mount('#app')
