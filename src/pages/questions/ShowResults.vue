<template>
  <div class="q-my-sm">
    <h1 class="small-h1 q-my-xs">Detail ankety</h1>
    <table class="q-mb-lg">
        <tr>
            <th>Otázka: </th>
            <td>{{question.text}}</td>
        </tr>
        <tr>
            <th>Dátum od: </th>
            <td>{{question.date_from}}</td>
        </tr>
        <tr>
            <th>Dátum do: </th>
            <td>{{question.date_to}}</td>
        </tr>
    </table>
    <q-table
      :data="answers"
      row-key="id"
      :pagination.sync="pagination"
      :loading="loading"
      @request="fetchResults"
      :columns="columns"
      :hide-pagination="true"
      title="Výsledky ankety"
      binary-state-sort
      >
      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td key="id" :props="props">
          <span>{{ props.row.id }}</span>
        </q-td>
        <q-td key="text" :props="props">
          <span>{{ props.row.text }}</span>
        </q-td>
        <q-td key="votings_count" :props="props">
          <span>{{ props.row.votings_count }}</span>
        </q-td>
      </q-tr>
    </q-table>
  </div>
</template>

<style lang="stylus">
  .small-h1
    font-size 2.5rem
  th
    text-align left
  td
    padding-left 1rem
</style>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      columns: [
        { name: 'text', label: 'Odpoveď', field: 'text', sortable: false, align: 'left' },
        { name: 'votings_count', label: 'Počet hlasov', field: 'votings_count', sortable: true, align: 'left' }
      ],
      selected: [],
      loading: false,
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      question: null,
      answers: []
    }
  },
  methods: {
    fetchQuestion () {
      this.loading = true
      axios
        .get(process.env.API + `/questions/${this.$route.params.id}`)
        .then(({ data }) => {
          this.question = data
          this.loading = false
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Nepodarilo sa načítať výsledky ankety.'
          })
          this.loading = false
        })
    },
    fetchResults () {
      this.loading = true
      axios
        .get(process.env.API + `/questions/${this.$route.params.id}/results`)
        .then(({ data }) => {
          this.answers = data.answers
          this.loading = false
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Nepodarilo sa načítať výsledky ankety.'
          })
          this.loading = false
        })
    }
  },
  mounted () {
    this.fetchQuestion()
    this.fetchResults()
  }
}
</script>
