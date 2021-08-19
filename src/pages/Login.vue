<template>
    <div>
        Login
        <q-btn label="Prihlásiť sa" color="primary" @click="authenticate"/>
    </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {

    }
  },

  methods: {
    authenticate () {
      this.$axios.get('http://eshop-project.test/sanctum/csrf-cookie')
        .then((response) => {
          console.log(response)
          this.login()
        })
        .catch((error) => {
          console.log(error)
        })
    },

    login () {
      axios.post('http://eshop-project.test/login', {
        email: 'martinbudinsky3@gmail.com',
        password: '12345678'
      }).then((response) => {
        console.log(response)
        this.logout()
      })
    },

    logout () {
      axios.post('http://eshop-project.test/logout').then((response) => {
        console.log(response)
      })
    }
  },

  computed: {

  }
}
</script>
