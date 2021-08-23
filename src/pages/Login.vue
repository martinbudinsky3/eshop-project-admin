<template>
<div class="q-my-xl row justify-center items-center root">
    <q-card class="login-form">
        <q-card-section>
            <h1 class="text-h5">
              Prihlásenie
            </h1>
        </q-card-section>
        <q-card-section>
            <q-input
              class="q-mb-sm"
              label="Email"
              maxlength="255"
              v-model="email"
            />
            <q-input
              class="q-mb-sm"
              type="password"
              label="Heslo"
              v-model="password"
              :error-message="loginErrorMessage"
              :error="loginError"
              />
        </q-card-section>
        <q-card-actions class="q-mt-md">
            <div class="row justify-end full-width docs-btn">
                <q-btn label="Prihlásiť sa" color="primary" @click="login"/>
            </div>
        </q-card-actions>
    </q-card>
</div>
</template>

<style lang="stylus" scoped>
  .login-form
    width 100%
    max-width 600px

  .root
    height 500px
</style>

<script>
export default {
  data () {
    return {
      email: 'admin@example.com',
      password: '12345678',

      loginError: false,
      loginErrorMessage: ''
    }
  },

  methods: {
    login () {
      this.hideErrors()

      this.$api.get('/sanctum/csrf-cookie')
        .then(() => {
          this.$api
            .post('/api/admin/login', this.credentials)
            .then(() => {
              this.$q.localStorage.set('isLoggedIn', true)
              this.$router.push({ path: '/' })
            })
            .catch(error => {
              if (error.response && error.response.status === 401) {
                this.loginError = true
                this.loginErrorMessage = error.response.data.message
              }
              this.showErrorDialog()
            })
        })
        .catch(error => {
          console.log(error)
          this.showErrorDialog()
        })
    },

    hideErrors () {
      this.loginError = false
    },

    showErrorDialog () {
      this.$q.notify({ type: 'negative', timeout: 2000, message: 'Nepodarilo sa prihlásiť.' })
    }
  },

  computed: {
    credentials: function () {
      return {
        email: this.email,
        password: this.password
      }
    }
  }
}
</script>
