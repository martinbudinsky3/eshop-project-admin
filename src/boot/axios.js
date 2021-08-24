import Vue from 'vue'
import axios from 'axios'
import { LocalStorage } from 'quasar'

export default ({ app, router, store }) => {
  const api = axios.create({
    baseURL: `${process.env.baseUrl}`,
    withCredentials: true
  })

  api.interceptors.response.use((response) => response, (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 419) &&
      router.currentRoute.path !== '/login'
    ) {
      LocalStorage.set('isLoggedIn', false)
      router.push({ path: '/login' })
    } else {
      throw error
    }
  })

  Vue.prototype.$api = api
}
