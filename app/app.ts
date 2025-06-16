import 'ant-design-vue/dist/reset.css';
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import Dashboard from './Dashboard.vue';

createApp(Dashboard).use(Antd).mount('#app');
