<template>
<div class="q-my-xl">
    <q-card>
        <q-card-section class="text-h6">Vytvorenie nového produktu</q-card-section>
        <q-card-section>
            <q-input class="q-mb-sm" label="Názov" v-model="productName" />
            <q-input
              class="q-mb-sm"
              type="number"
              label="Cena"
              v-model="productPrice"
              step="any"
              min=0 />
            <q-select
              class="q-mb-sm"
              option-value="id"
              option-label="name"
              v-model="selectedMainCategory"
              :options="mainCategories"
              label="Hlavná kategória"
              @input="setSubcategory()"/>
            <q-select
              class="q-mb-sm"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="selectedSubcategory"
              :options="selectedMainCategory.child_categories"
              label="Podkategória" />
            <q-select
              class="q-mb-sm"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="productBrand"
              :options="brands"
              label="Značka" />
            <q-input class="q-mb-sm" label="Materiál" v-model="productMaterial" />
            <q-input
              class="q-mb-sm"
              type="textarea"
              label="Popis"
              v-model="productDescription"
              :max-height="100"
              rows="7"
            />
            <q-btn class="q-mt-lg q-mb-sm" label="Pridať prevedenie" color="primary" @click="createDesign()" />
            <q-dialog v-model="modal" persistent>
              <q-card style="min-width: 320px">
                <q-card-section>
                  <div class="text-h6">Prevedenie produktu</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <q-select
                    class="q-mb-sm"
                    option-value="id"
                    option-label="name"
                    v-model="productDesignColor"
                    :options="colors"
                    label="Farba"/>
                  <q-select
                    class="q-mb-sm"
                    v-model="productDesignSize"
                    :options="sizes"
                    label="Veľkost" />
                  <q-input
                    type="number"
                    label="Množstvo"
                    v-model="productDesignQuantity"
                    min=0 />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                  <q-btn flat label="Späť" v-close-popup />
                  <q-btn color="primary" label="Pridať" v-close-popup @click="saveDesign()"/>
                </q-card-actions>
              </q-card>
            </q-dialog>

            <ul class="ls-none">
              <li class="cursor-pointer" v-for="(design, index) in productDesigns" :key="index" @click="editDesign(index)">
                <q-chip removable  color="white" @remove="removeDesign(design)">
                  {{ design.color.name }} - {{ design.size }} - {{ design.quantity }}ks
                </q-chip>
              </li>
            </ul>
            <q-uploader
              class="q-mt-lg"
              url=""
              max-total-size="307200"
              label="Images"
              accept=".jpg"
              hide-upload-btn
              multiple
              batch
              ref="uploader"
              />
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
      selectedMainCategory: { id: 1, name: '', child_categories: null },
      selectedSubcategory: null,
      productDescription: '',
      productPrice: '',
      productMaterial: '',
      productBrand: '',
      productDesignColor: null,
      productDesignSize: '',
      productDesignQuantity: '',
      updatedProductDesignIndex: '',
      mainCategories: [],
      productDesigns: [],
      brands: [],
      colors: [],
      sizes: [],
      modal: false,
      productId: 2
    }
  },

  methods: {
    createProduct () {
      axios
        .post('http://wtech-eshop.test/products', this.productData)
        .then(response => {
          this.productId = response.data.id
        })
        .then(() => {
          return this.uploadImages()
        })
        .then(() => {
          this.$q.notify({ type: 'positive', timeout: 2000, message: 'Produkt bol úspešne vytvorený.' })
          this.$router.push({ path: '/products/' + this.productId + '/edit' })
        })
        .catch(error => {
          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Vyskytla sa chyba - nie je možné vytvoriť produkt.' })
          console.log(error)
        })
    },

    uploadImages () {
      const config = { headers: { contentType: 'multipart/form-data' } }
      const uploadData = new FormData()
      const images = this.$refs.uploader.files

      uploadData.append('productId', this.productId)
      for (let i = 0; i < images.length; i++) {
        uploadData.append(`image[${i}]`, images[i])
      }

      return axios.post('http://wtech-eshop.test/image', uploadData, config)
    },

    setSubcategory () {
      this.selectedSubcategory = this.selectedMainCategory.child_categories[0].id
    },

    createDesign () {
      this.modal = true
      this.updatedProductDesignIndex = ''
      this.productDesignColor = null
      this.productDesignSize = ''
      this.productDesignQuantity = ''
    },

    saveDesign () {
      if (this.updatedProductDesignIndex === '') {
        this.productDesigns.push({
          color: this.productDesignColor,
          size: this.productDesignSize,
          quantity: this.productDesignQuantity
        })
      } else {
        this.productDesigns[this.updatedProductDesignIndex].color = this.productDesignColor
        this.productDesigns[this.updatedProductDesignIndex].size = this.productDesignSize
        this.productDesigns[this.updatedProductDesignIndex].quantity = this.productDesignQuantity
      }
    },

    removeDesign (design) {
      this.productDesigns = this.productDesigns.filter(item => item !== design)
    },

    editDesign (index) {
      this.modal = true
      this.updatedProductDesignIndex = index
      this.productDesignColor = this.productDesigns[index].color
      this.productDesignSize = this.productDesigns[index].size
      this.productDesignQuantity = this.productDesigns[index].quantity
    }
  },
  mounted () {
    axios
      .get('http://wtech-eshop.test/category')
      .then(response => {
        this.mainCategories = response.data
        this.selectedMainCategory = this.mainCategories[0]
        this.selectedSubcategory = this.selectedMainCategory.child_categories[0].id
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
      return {
        name: this.productName,
        description: this.productDescription,
        price: this.productPrice,
        category_id: this.selectedSubcategory,
        brand_id: this.productBrand,
        material: this.productMaterial,
        product_designs: this.productDesigns
      }
    }
  }
}
</script>
