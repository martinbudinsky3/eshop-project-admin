<template>
<div class="q-my-xl">
    <q-card>
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
      this.$api.get('/sanctum/csrf-cookie')
        .then((response) => {
          console.log(response)
          this.$api
            .post('/api/admin/login', this.credentials)
            .then(() => {
              // TODO save flag to localStorage
              this.$q.localStorage.set('isLoggedIn', true)
              this.$router.push({ path: '/' })
            })
            .catch(error => {
              console.log(error)
              if (error.code === 401) {
                this.loginErrorMessage = error.data.message
              }
            })
        })
        .catch(error => console.log(error))
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
