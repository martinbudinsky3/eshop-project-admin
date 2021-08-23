import Vue from 'vue'
import axios from 'axios'

export default ({ app, router, store }) => {
  const api = axios.create({
    baseURL: `${process.env.baseUrl}`,
    withCredentials: true
  })

  api.interceptors.response.use((response) => response, (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 419) &&
      router.url !== '/login'
    ) {
      router.push({ path: '/login' })
    } else {
      throw error
    }
  })

  Vue.prototype.$api = api
}
