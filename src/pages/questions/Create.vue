<template>
  <div class="q-my-xl">
    <q-card>
        <q-card-section>
          <h1 class="text-h5">
            Vytvorenie novej ankety
          </h1>
        </q-card-section>
        <q-card-section>
          <q-input
            class="q-mb-sm"
            type="textarea"
            label="Text otázky"
            counter
            autogrow
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
            <q-btn label="Pridať" color="primary" @click="createQuestion"/>
          </div>
        </q-card-actions>
      </q-card>
  </div>
</template>

<style lang="stylus">
  .docs-btn .q-btn
      padding 15px 20px
</style>

<script>
export default {
  data () {
    return {
      questionText: '',
      dateFrom: null,
      dateTo: null,
      questionId: 1,

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
    createQuestion () {
      this.hideErrors()

      this.$api
        .post('/api/questions', this.questionData)
        .then(response => {
          this.questionId = response.data.id
        })
        .then(() => {
          this.$q.notify({ type: 'positive', timeout: 2000, message: 'Anketa bola úspešne vytvorená.' })
          this.$router.push({ path: '/questions/' + this.questionId + '/edit' })
        })
        .catch(error => {
          if (error.response.data.errors) {
            console.log(error.response.data.errors)
            this.showErrors(error.response.data.errors)
          }

          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Vyskytla sa chyba - nie je možné vytvoriť anketu.' })
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
    }
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
