import Vue from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: `${process.env.baseUrl}`,
  withCredentials: true
})

Vue.prototype.$api = api
