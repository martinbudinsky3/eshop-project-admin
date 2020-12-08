<template>
<div class="q-my-xl">
    <q-card>
        <q-card-section>Create new product</q-card-section>
        <q-card-section>
            <q-input label="Názov" v-model="productName" />
            <q-input
              type="number"
              label="Cena"
              v-model="productPrice"
              step="any"
              min=0 />
            <q-select
              option-value="id"
              option-label="name"
              v-model="selectedMainCategory"
              :options="mainCategories"
              label="Hlavná kategória"
              @input="setSubcategory()"/>
            <q-select
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="selectedSubcategory"
              :options="selectedMainCategory.child_categories"
              label="Podkategória" />
            <q-select
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="productBrand"
              :options="brands"
              label="Značka" />
            <q-input label="Materiál" v-model="productMaterial" />
            <q-input
              type="textarea"
              label="Popis"
              v-model="productDescription"
              :max-height="100"
              rows="7"
            />
            <q-btn class="q-mt-lg q-mb-sm" label="Pridať farbu a veľkosti" color="primary" @click="modal = true" />
            <q-dialog v-model="modal" persistent>
              <q-card style="min-width: 350px">
                <q-card-section>
                  <div class="text-h6">Farba a veľkosti</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <q-select
                    option-value="id"
                    option-label="name"
                    v-model="productDesignColor"
                    :options="colors"
                    label="Farba"/>
                  <q-select
                    v-model="productDesignSize"
                    :options="sizes"
                    label="Veľkosti" />
                  <q-input
                    type="number"
                    label="Množstvo"
                    v-model="productDesignQuantity"
                    min=0 />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                  <q-btn flat label="Späť" v-close-popup />
                  <q-btn color="primary" label="Pridať" v-close-popup @click="addDesign()"/>
                </q-card-actions>
              </q-card>
            </q-dialog>

            <ul class="ls-none">
              <li v-for="(design, index) in productDesigns" :key="index">
                <q-chip removable  color="white" @remove="removeDesign(design)">
                  {{ design.color.name }} - {{ design.size }} - {{ design.quantity }}ks
                </q-chip>
              </li>
            </ul>

            <q-uploader
              class="q-mt-lg"
              url="http://localhost:8000/upload"
              max-total-size="307200"
              label="Images"
              multiple
              accept=".jpg"/>
        </q-card-section>
        <q-card-actions class="q-mt-md">
            <div class="row justify-end full-width docs-btn">
                <q-btn label="Zrušiť" flat to="/products/index"/>
                <q-btn label="Pridať" color="primary" @click="createProduct"/>
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
import axios from 'axios'

export default {
  data () {
    return {
      productName: '',
      selectedMainCategory: null,
      selectedSubcategory: null,
      productDescription: '',
      productPrice: '',
      productMaterial: '',
      productBrand: null,
      productDesignColor: null,
      productDesignSize: '',
      productDesignQuantity: '',
      mainCategories: [],
      productDesigns: [],
      brands: [],
      colors: [],
      sizes: [],
      modal: false
    }
  },
  methods: {
    createProduct () {
      axios
        .post('http://wtech-eshop.test/products', this.productData)
        .then(response => {
          this.$q.notify({ type: 'positive', timeout: 2000, message: 'Produkt bol úspešne vytvorený.' })
          this.$router.push({ path: '/products/' + response.data.id + '/edit' })
        })
        .catch(error => {
          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Vyskytla sa chyba.' })
          console.log(error)
        })
    },

    setSubcategory () {
      this.selectedSubcategory = this.selectedMainCategory.child_categories[0]
    },

    addDesign () {
      this.productDesigns.push({
        color: this.productDesignColor,
        size: this.productDesignSize,
        quantity: this.productDesignQuantity
      })

      this.productDesignColor = null
      this.productDesignSizes = []
      this.productDesignQuantity = ''
    },

    removeDesign (design) {
      this.productDesigns = this.productDesigns.filter(item => item !== design)
    }
  },
  mounted () {
    axios
      .get('http://wtech-eshop.test/category')
      .then(response => {
        this.mainCategories = response.data
        this.selectedMainCategory = this.mainCategories[0]
        this.selectedSubcategory = this.selectedMainCategory.child_categories[0]
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní kategórií.' })
        console.log(error)
      })

    axios
      .get('http://wtech-eshop.test/brand')
      .then(response => {
        this.brands = response.data
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní značiek.' })
        console.log(error)
      })

    axios
      .get('http://wtech-eshop.test/color')
      .then(response => {
        this.colors = response.data
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní farieb.' })
        console.log(error)
      })

    axios
      .get('http://wtech-eshop.test/size')
      .then(response => {
        this.sizes = response.data
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní veľkostí.' })
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
