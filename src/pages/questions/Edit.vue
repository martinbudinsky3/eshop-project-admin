<template>
  <div class="q-my-xl">
    <div v-if="answersCount < 2" class="q-pa-md q-mb-md alert-warning">
      <p>Aby sa anketa zobrazila v klientskej časti musí mať aspoň 2 možné odpovede.</p>
      <q-btn label="Pridať odpovede" color="primary" @click="scrollToAnswerList"/>
    </div>
    <q-card>
        <q-card-section>
          <h1 class="text-h5">
            Upravenie ankety
          </h1>
        </q-card-section>
        <q-card-section>
          <q-input
            class="q-mb-sm"
            type="textarea"
            label="Text otázky"
            counter
            v-model="questionText"
            :error-message="questionTextErrorMessage"
            :error="questionTextError"
          />
          <q-input
            class="q-mb-sm"
            filled type="date"
            stack-label
            label="Dátum od"
            v-model="dateFrom"
            :error-message="dateFromErrorMessage"
            :error="dateFromError"
            />
          <q-input
            class="q-mb-sm"
            filled type="date"
            stack-label
            label="Dátum do"
            v-model="dateTo"
            :error-message="dateToErrorMessage"
            :error="dateToError"
            />
        </q-card-section>
        <q-card-actions class="q-mt-md">
          <div class="row justify-end full-width docs-btn">
            <q-btn label="Zrušiť" flat to="/questions/index"/>
            <q-btn label="Upraviť" color="primary" @click="updateQuestion"/>
          </div>
        </q-card-actions>
      </q-card>

      <answer-list
        ref="answerList"
        @answers-fetched="saveAnswersCount"/>
  </div>
</template>

<style lang="stylus">
  .docs-btn .q-btn
      padding 15px 20px
</style>

<script>
import axios from 'axios'
import AnswerList from 'src/components/AnswerList.vue'

export default {
  components: { AnswerList },
  data () {
    return {
      questionText: '',
      dateFrom: null,
      dateTo: null,

      answersCount: 2,

      // error flags
      questionTextError: false,
      dateFromError: false,
      dateToError: false,

      questionTextErrorMessage: '',
      dateFromErrorMessage: '',
      dateToErrorMessage: ''
    }
  },

  methods: {
    updateQuestion () {
      this.hideErrors()

      axios
        .put(process.env.API + '/questions/' + this.$route.params.id, this.questionData)
        .then(() => {
          this.$q.notify({ type: 'positive', timeout: 2000, message: 'Anketa bola úspešne upravená.' })
          this.$router.push({ path: '/questions/index' })
        })
        .catch(error => {
          if (error.response.data.errors) {
            console.log(error.response.data.errors)
            this.showErrors(error.response.data.errors)
          }

          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Vyskytla sa chyba - nie je možné upraviť anketu.' })
          console.log(error)
        })
    },

    showErrors (errors) {
      if (errors.text) {
        this.questionTextErrorMessage = errors.text[0]
        this.questionTextError = true
      }

      if (errors.date_from) {
        this.dateFromErrorMessage = errors.date_from[0]
        this.dateFromError = true
      }

      if (errors.date_to) {
        this.dateToErrorMessage = errors.date_to[0]
        this.dateToError = true
      }
    },

    hideErrors () {
      this.questionTextError = false
      this.dateFromError = false
      this.dateToError = false
    },

    saveAnswersCount (answersCount) {
      this.answersCount = answersCount
    },

    scrollToAnswerList () {
      const el = this.$refs.answerList.$el
      el.scrollIntoView({ behavior: 'smooth' })
    }
  },

  mounted () {
    axios
      .get(process.env.API + '/questions/' + this.$route.params.id + '/edit')
      .then(response => {
        this.questionText = response.data.text
        this.dateFrom = response.data.date_from
        this.dateTo = response.data.date_to
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní ankety.' })
        console.log(error)
      })
  },
  computed: {
    questionData: function () {
      return {
        text: this.questionText,
        date_from: this.dateFrom,
        date_to: this.dateTo
      }
    }
  }
}
</script>
