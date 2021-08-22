<template>
  <div class="q-my-xl">
    <q-table
        :data="answers"
        row-key="id"
        :loading="loading"
        @request="fetchAnswers"
        :columns="columns"
        :pagination.sync="pagination"
        :hide-pagination="true"
        title="Zoznam možných odpovedí"
        binary-state-sort
        >
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="id" :props="props">
            <span>{{ props.row.id }}</span>
          </q-td>
          <q-td key="text" :props="props">
            <span>{{ props.row.text }}</span>
          </q-td>
          <q-td class="text-right">
            <div>
              <q-btn round icon="edit" class="q-mr-xs" @click="showEditAnswerModal(props.row)" />
              <q-btn round icon="delete" @click="showDeleteAnswerDialog(props.row.id)"/>
            </div>
          </q-td>
        </q-tr>
    </q-table>

    <div class="row justify-end full-width docs-btn q-mt-md">
      <q-btn label="Pridať odpoveď" color="primary" @click="showCreateAnswerModal"/>
    </div>

    <q-dialog v-model="modal" persistent>
      <q-card class="design-modal">
        <q-card-section>
          <h2 v-show="creatingAnswer" class="text-h6">Pridanie možnej odpovedi ankety</h2>
          <h2 v-show="!creatingAnswer" class="text-h6">Upravenie možnej odpovedi ankety</h2>
          <q-input
            type="text"
            label="Text odpovedi"
            v-model="answerText"
            autogrow
            :error-message="answerTextErrorMessage"
            :error="answerTextError"/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Späť" v-close-popup />
          <q-btn
            v-show="creatingAnswer"
            color="primary"
            label="Pridať"
            @click="createAnswer()"/>
          <q-btn
            v-show="!creatingAnswer"
            color="primary"
            label="Upraviť"
            @click="editAnswer()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      columns: [
        { name: 'text', label: 'Možná odpoveď', field: 'text', sortable: false, align: 'left' },
        { name: 'actions', label: 'Akcie', sortable: false, align: 'right' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      loading: false,
      selected: [],
      answers: [],

      modal: false,
      creatingAnswer: true,
      answerText: '',
      editedAnswerId: 0,

      answerTextError: false,
      answerTextErrorMessage: ''
    }
  },
  methods: {
    fetchAnswers () {
      this.loading = true

      this.$api
        .get(`/api/questions/${this.$route.params.id}/answers`)
        .then(({ data }) => {
          this.answers = data.answers
          this.$emit('answers-fetched', this.answers.length)
          this.loading = false
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Nepodarilo sa načítať zoznam odpovedí.'
          })

          this.loading = false
        })
    },

    createAnswer () {
      this.$api
        .post(`/api/questions/${this.$route.params.id}/answers`, this.answerData)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Odpoveď bola úspešne pridaná.'
          })
          this.clearAnswerForm()
          this.fetchAnswers()
        })
        .catch(error => {
          if (error.response.data.errors) {
            this.showErrors(error.response.data.errors)
          }
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Vyskytla sa chyba - nie je možné vytvoriť odpoveď.'
          })
          console.log(error)
        })
    },

    editAnswer () {
      this.$api
        .put(`/api/answers/${this.editedAnswerId}`, this.answerData)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Odpoveď bola úspešne upravená.'
          })
          this.clearAnswerForm()
          this.fetchAnswers()
        })
        .catch(error => {
          if (error.response.data.errors) {
            this.showErrors(error.response.data.errors)
          }
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Vyskytla sa chyba - nie je možné upraviť anketu.'
          })
          console.log(error)
        })
    },

    showDeleteAnswerDialog (id) {
      this.$q.dialog({
        title: 'Odstránenie odpovedi',
        message: 'Naozaj chcete odstrániť odpoveď?',
        color: 'primary',
        ok: true,
        cancel: true
      }).onOk(() => {
        this.deleteAnswer(id)
      })
    },

    showCreateAnswerModal () {
      this.hideErrors()
      this.creatingAnswer = true
      this.modal = true
      this.answerText = ''
    },

    showEditAnswerModal (answer) {
      this.hideErrors()
      this.creatingAnswer = false
      this.modal = true
      this.answerText = answer.text
      this.editedAnswerId = answer.id
    },

    deleteAnswer (id) {
      this.$api
        .delete(`/api/answers/${id}`)
        .then(() => {
          this.fetchAnswers()
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Odpoveď bola odstránená.'
          })
        })
        .catch(error => {
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Nepodarilo sa odstrániť odpoveď.'
          })
          console.log(error)
        })
    },

    clearAnswerForm () {
      this.hideErrors()
      this.modal = false
      this.answerText = ''
    },

    showErrors (errors) {
      this.answerTextErrorMessage = errors.text[0]
      this.answerTextError = true
    },

    hideErrors () {
      this.answerTextError = false
    }
  },

  mounted () {
    this.fetchAnswers()
  },

  computed: {
    answerData: function () {
      return {
        text: this.answerText
      }
    }
  }
}
</script>
