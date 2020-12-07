<template>
<div class="q-my-xl">
    <q-card>
        <q-card-title>Edit {{ productName }}</q-card-title>
        <q-card-main>
            <q-field :count="250">
                <q-input float-label="Name" v-model="productName" max-length="250" />
            </q-field>
            <q-field :count="5000">
                <q-input
                    type="textarea"
                    float-label="Description"
                    v-model="productDescription"
                    :max-height="100"
                    rows="7"
                />
            </q-field>
        </q-card-main>
        <q-card-actions class="q-mt-md">
            <div class="row justify-end full-width docs-btn">
                <q-btn label="Cancel" flat to="/products/index"/>
                <q-btn label="Update" color="primary" @click="updateProduct"/>
            </div>
        </q-card-actions>
    </q-card>
</div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      productName: '',
      productDescription: ''
    }
  },
  methods: {
    updateProduct () {
      axios
        .put(`http://wtech-eshop.test/products/` + this.$route.params.id, this.productData)
        .then(response => {
          this.$q.notify({ type: 'positive', timeout: 2000, message: 'The product has been updated.' })
        })
        .catch(error => {
          this.$q.notify({ type: 'negative', timeout: 2000, message: 'An error has been occured.' })
          console.log(error)
        })
    }
  },
  mounted () {
    axios
      .get(`http://wtech-eshop.test/products/` + this.$route.params.id + '/edit')
      .then(response => {
        this.productName = response.data.name
        this.productDescription = response.data.description
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Loading product: an error has been occured.' })
        console.log(error)
      })
  },
  computed: {
    productData: function () {
      return { name: this.productName, description: this.productDescription }
    }
  }
}
</script>
