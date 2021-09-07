<template>
    <div class="bg-grey-1 full-height q-px-md q-py-lg">
        <q-list link class="no-border">
            <q-expansion-item
                icon="inventory"
                label="Produkty"
                >
                <q-list link class="no-border">
                    <q-item class="q-body-1" to="/products/index">
                        <q-item-label>Zoznam</q-item-label>
                    </q-item>
                    <q-item class="q-body-1" to="/products/create">
                        <q-item-label>Vytvorenie</q-item-label>
                    </q-item>
                </q-list>
            </q-expansion-item>
            <q-expansion-item
                icon="poll"
                label="Ankety"
                >
                <q-list link class="no-border">
                    <q-item class="q-body-1" to="/questions/index">
                        <q-item-label>Zoznam</q-item-label>
                    </q-item>
                    <q-item class="q-body-1" to="/questions/create">
                        <q-item-label>Vytvorenie</q-item-label>
                    </q-item>
                </q-list>
            </q-expansion-item>
            <q-item clickable v-ripple class="q-body-1">
                <q-item-section avatar>
                    <q-icon name="logout" />
                </q-item-section>

                <q-item-section>
                    <q-item-label @click="logout">Odhlásenie</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>

<script>
export default {
  methods: {
    logout () {
      this.$api
        .post('/api/admin/logout')
        .then(() => {
          this.$q.localStorage.set('isLoggedIn', false)
          this.$store.commit('moduleUI/updateDrawerState', false)
          this.$router.push({ path: '/login' })
        })
    }
  }
}
</script>
