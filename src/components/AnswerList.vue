<template>
  <div class="q-my-xl">
    <q-table
        :data="answers"
        row-key="id"
        :loading="loading"
        @request="fetchAnswers"
        :columns="columns"
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

    <q-dialog v-model="modal" persistent>
      <q-card class="design-modal">
        <q-card-section>
          <h2 v-show="creatingAnswer" class="text-h6">Pridanie možnej odpovedi ankety</h2>
          <h2 v-show="!creatingAnswer" class="text-h6">Upravenie možnej odpovedi ankety</h2>
          <q-input
            type="text"
            label="Text odpovedi"
            v-model="answerText"/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Späť" v-close-popup />
          <q-btn
            v-show="creatingAnswer"
            color="primary"
            label="Pridať"
            v-close-popup @click="createAnswer()"/>
          <q-btn
            v-show="!creatingAnswer"
            color="primary"
            label="Upraviť"
            v-close-popup @click="editAnswer()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      columns: [
        { name: 'text', label: 'Možná odpoveď', field: 'text', sortable: false, align: 'left' },
        { name: 'actions', label: 'Akcie', sortable: false, align: 'right' }
      ],
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
      // QTable to "loading" state
      this.loading = true
      // fetch data
      axios
        .get(`${process.env.API}/questions/${this.filter}/answers`)
        .then(({ data }) => {
          // we update the rows with the fetched ones
          this.questions = data.answers

          // finally we tell QTable to exit the "loading" state
          this.loading = false
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Nepodarilo sa načítať zoznam odpovedí.'
          })

          // we tell QTable to exit the "loading" state
          this.loading = false
        })
    },

    createAnswer () {
      axios
        .post(process.env.API + '/products', this.answerData)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Odpoveď bola úspešne pridaná.'
          })
          this.clearAnswerForm()
        })
        .catch(error => {
          // if (error.response.data.errors) {
          //  this.showErrors(error.response.data.errors)
          // }
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Vyskytla sa chyba - nie je možné vytvoriť odpoveď.'
          })
          console.log(error)
        })
    },

    editAnswer () {
      axios
        .put(`${process.env.API}/questions/${this.editedAnswerId}`, this.answerData)
        .then(() => {
          this.fetchAnswers()
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Odpoveď bola úspešne upravená.'
          })
        })
        .catch(error => {
          // if (error.response.data.errors) {
          //  this.showErrors(error.response.data.errors)
          // }
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
      this.creatingAnswer = true
      this.modal = true
      this.answerText = ''
    },

    showEditAnswerModal (answer) {
      this.creatingAnswer = false
      this.modal = true
      this.answerText = answer.text
      this.editedAnswerId = answer.id
    },

    deleteAnswer (id) {
      axios
        .delete(`${process.env.API}/answers/${id}`)
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
            message: 'Nastala chyba.'
          })
          console.log(error)
        })
    },

    clearAnswerForm () {
      this.modal = false
      this.answerText = ''
    },

    showErrors (errors) {
      this.answerTextErrorMessage = errors.text[0]
      this.answerTextError = true
    }
  },

  mounted () {
    // once mounted, we need to trigger the initial server data fetch
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
