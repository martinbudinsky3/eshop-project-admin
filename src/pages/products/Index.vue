<template>
<div class="q-my-xl">
<q-table
      :data="serverData"
      row-key="name"
      :pagination.sync="serverPagination"
      :loading="loading"
      @request="request"
      :filter="filter"
      :columns="columns"
      title="Zoznam produktov"
      binary-state-sort
      >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td key="id" :props="props">
          <span>{{ props.row.id }}</span>
        </q-td>
        <q-td key="name" :props="props">
          <span>{{ props.row.name }}</span>
        </q-td>
        <q-td key="price" :props="props">
          <span>{{ props.row.price }}</span>
        </q-td>
        <q-td class="text-right">
          <div>
            <q-btn round icon="edit" class="q-mr-xs" @click="$router.push('/products/' + props.row.id + '/edit')" />
            <q-btn round icon="delete" @click="destroy(props.row.id, props.row.name, props.row.__index)"/>
          </div>
        </q-td>
      </q-tr>
    </q-table>
</div>
</template>

<script>
export default {
  data () {
    return {
      columns: [
        { name: 'id', label: 'ID', field: 'id', sortable: false, align: 'left' },
        { name: 'name', label: 'Názov', field: 'name', sortable: true, align: 'left' },
        { name: 'price', label: 'Cena', field: 'price', sortable: false, align: 'left' },
        { name: 'actions', label: 'Akcie', sortable: false, align: 'right' }
      ],
      selected: [],
      loading: false,
      serverPagination: {
        page: 1,
        rowsNumber: 10, // the number of total rows in DB
        rowsPerPage: 5,
        sortBy: 'name',
        descending: false
      },
      filter: '',
      serverData: []
    }
  },
  methods: {
    request ({ pagination }) {
      // QTable to "loading" state
      this.loading = true
      // fetch data
      this.$api
        .get(`/api/products/list/${pagination.page}?rowsPerPage=${pagination.rowsPerPage}&sortBy=${pagination.sortBy}&descending=${pagination.descending}&filter=${this.filter}`)
        .then(({ data }) => {
          // updating pagination to reflect in the UI
          this.serverPagination = pagination

          // we also set (or update) rowsNumber
          this.serverPagination.rowsNumber = data.rowsNumber

          // then we update the rows with the fetched ones
          this.serverData = data.rows

          // finally we tell QTable to exit the "loading" state
          this.loading = false
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)

          // we tell QTable to exit the "loading" state
          this.loading = false
        })
    },

    destroy (id, name, rowIndex) {
      this.$q.dialog({
        title: 'Odstránenie',
        message: 'Naozaj chcete odstrániť ' + name + '?',
        color: 'primary',
        ok: true,
        cancel: true
      }).onOk(() => {
        this.$api
          .delete(`/products/${id}`)
          .then(() => {
            this.request(this.requestParams)
            this.$q.notify({ type: 'positive', timeout: 2000, message: 'Produkt bol odstránený.' })
          })
          .catch(error => {
            this.$q.notify({ type: 'negative', timeout: 2000, message: 'Nastala chyba.' })
            console.log(error)
          })
      })
    }
  },
  mounted () {
    // once mounted, we need to trigger the initial server data fetch
    this.request(this.requestParams)
  },
  computed: {
    requestParams: function () {
      return {
        pagination: this.serverPagination,
        filter: this.filter
      }
    }
  }
}
</script>
