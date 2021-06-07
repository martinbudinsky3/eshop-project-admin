<template>
<div class="q-my-xl">
<q-table
      :data="questions"
      row-key="id"
      :pagination.sync="serverPagination"
      :loading="loading"
      @request="fetchQuestions"
      :filter="filter"
      :columns="columns"
      title="Zoznam ankiet"
      binary-state-sort
      >
      <!--template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template-->
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td key="id" :props="props">
          <span>{{ props.row.id }}</span>
        </q-td>
        <q-td key="text" :props="props">
          <span>{{ props.row.text }}</span>
        </q-td>
        <q-td key="date_from" :props="props">
          <span>{{ props.row.date_from }}</span>
        </q-td>
        <q-td key="date_to" :props="props">
          <span>{{ props.row.date_to }}</span>
        </q-td>
        <q-td class="text-right">
          <div>
            <q-btn round icon="visibility" class="q-mr-xs" @click="$router.push('/questions/' + props.row.id)" />
            <q-btn round icon="edit" class="q-mr-xs" @click="$router.push('/questions/' + props.row.id + '/edit')" />
            <q-btn round icon="delete" @click="showDeleteDialog(props.row.id)"/>
          </div>
        </q-td>
      </q-tr>
    </q-table>
</div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      columns: [
        { name: 'text', label: 'Otázka ankety', field: 'text', sortable: false, align: 'left' },
        { name: 'date_from', label: 'Platnosť dátum od', field: 'date_from', sortable: true, align: 'left' },
        { name: 'date_to', label: 'Platnosť dátum do', field: 'date_to', sortable: false, align: 'left' },
        { name: 'actions', label: 'Akcie', sortable: false, align: 'right' }
      ],
      selected: [],
      loading: false,
      serverPagination: {
        page: 1,
        rowsNumber: 10, // the number of total rows in DB
        rowsPerPage: 5,
        sortBy: 'date_from',
        descending: false
      },
      filter: '',
      questions: []
    }
  },
  methods: {
    fetchQuestions ({ pagination }) {
      // QTable to "loading" state
      this.loading = true
      // fetch data
      axios
        .get(process.env.API + `/questions?page=${pagination.page}&recordsPerPage=${pagination.rowsPerPage}&sortBy=${pagination.sortBy}&descending=${pagination.descending}&filter=${this.filter}`)
        .then(({ data }) => {
          // updating pagination to reflect in the UI
          this.serverPagination = pagination

          // we also set (or update) rowsNumber
          this.serverPagination.rowsNumber = data.count

          // then we update the rows with the fetched ones
          this.questions = data.questions

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

    showDeleteDialog (id) {
      this.$q.dialog({
        title: 'Odstránenie',
        message: 'Naozaj chcete odstrániť anketu?',
        color: 'primary',
        ok: true,
        cancel: true
      }).onOk(() => {
        axios
          .delete(process.env.API + `/questions/${id}`)
          .then(() => {
            this.fetchQuestions(this.requestParams)
            this.$q.notify({ type: 'positive', timeout: 2000, message: 'Anketa bola odstránená.' })
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
    this.fetchQuestions(this.requestParams)
  },
  computed: {
    requestParams: function () {
      return {
        pagination: this.serverPagination
      }
    }
  }
}
</script>
