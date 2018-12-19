import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import TdValidate from './directives/validate'
Vue.config.productionTip = false

Vue.use(TdValidate)
Vue.use(ElementUI)

new Vue({
  render: h => h(App),
}).$mount('#app')
