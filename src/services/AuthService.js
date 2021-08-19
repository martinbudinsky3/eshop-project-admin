import axios from 'axios'
import { Cookies } from 'quasar'
import router from 'src/router'

export default {
  login (email, password) {
    // hit /login endpoint
    // on success store response values to cookies
    // on failure throw error
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
