import axios from 'axios'
import { Cookies } from 'quasar'
import router from 'src/router'

export default {
  login (credentials) {
    axios.post(process.env.API + '/login')
      .then(/* store response values to cookies */)
      .catch(/* on failure throw error */)
  },

  logout () {
    Cookies.remove('personal_access_token')
    Cookies.remove('expires_at')

    axios.post(process.env.API + '/logout')

    router.push('/')
  },

  isLoggedIn () {
    const expiresAt = Cookies.get('expires_at')

    return new Date().getTime < expiresAt
  }
}
