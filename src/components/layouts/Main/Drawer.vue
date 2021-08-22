<template>
    <div class="bg-grey-1 full-height q-px-md q-py-lg">
        <div class="q-subheading q-mb-sm">Produkty</div>
        <q-list link class="no-border">
            <q-item class="q-body-1" to="/products/index">
                <q-item-label>Zoznam</q-item-label>
            </q-item>
            <q-item class="q-body-1" to="/products/create">
                <q-item-label>Vytvorenie</q-item-label>
            </q-item>
        </q-list>
        <div class="q-subheading q-mb-sm">Ankety</div>
        <q-list link class="no-border">
            <q-item class="q-body-1" to="/questions/index">
                <q-item-label>Zoznam</q-item-label>
            </q-item>
            <q-item class="q-body-1" to="/questions/create">
                <q-item-label>Vytvorenie</q-item-label>
            </q-item>
        </q-list>
        <q-item class="q-body-1">
            <q-item-label @click="logout">Odhlásenie</q-item-label>
        </q-item>
    </div>
</template>

<script>
export default {
  methods: {
    logout () {
      this.$api
        .post('/api/admin/logout')
        .then(() => {
          // TODO save flag to localStorage
          this.$store.commit('auth/updateLoginFlag', false)
          this.$router.push({ path: '/login' })
        })
    }
  }
}
</script>
