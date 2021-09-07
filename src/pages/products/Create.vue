<template>
<div class="q-my-xl">
    <q-card>
        <q-card-section>
          <h1 class="text-h5">
            Vytvorenie nového produktu
          </h1>
        </q-card-section>
        <q-card-section>
            <q-input
              class="q-mb-sm"
              label="Názov"
              maxlength="255"
              autogrow
              v-model="productName"
              :error-message="nameErrorMessage"
              :error="nameError"
            />
            <q-input
              class="q-mb-sm"
              type="number"
              label="Cena"
              v-model="productPrice"
              step="any"
              min=0
              :error-message="priceErrorMessage"
              :error="priceError"
              />
            <q-select
              class="q-mb-sm"
              option-value="id"
              option-label="name"
              v-model="selectedMainCategory"
              :options="mainCategories"
              label="Hlavná kategória"
              @input="setSubcategory()"
              />
            <q-select
              class="q-mb-sm"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="selectedSubcategory"
              :options="selectedMainCategory.child_categories"
              label="Podkategória"
              />
            <q-select
              class="q-mb-sm"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="productBrand"
              :options="brands"
              label="Značka"
              :error-message="brandErrorMessage"
              :error="brandError"
              />
            <q-input
              class="q-mb-sm"
              label="Materiál"
              maxlength="100"
              counter
              v-model="productMaterial"
              :error-message="materialErrorMessage"
              :error="materialError"
              />
            <q-input
              class="q-mb-sm"
              type="textarea"
              label="Popis"
              v-model="productDescription"
              :max-height="100"
              rows="7"
              :error-message="descriptionErrorMessage"
              :error="descriptionError"
            />
          </q-card-section>
          <q-card-section>
            <h2 class="text-h6">Obrázky</h2>
            <q-uploader
              url=""
              max-file-size="307200"
              label="Podporovaný formát: JPG, max. veľkosť: 300KiB"
              accept=".jpg"
              hide-upload-btn
              multiple
              batch
              ref="uploader"
              />
            <p class="errors" :class="{'hidden': !imageError}">{{ imageErrorMessage }}</p>
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
      mainCategories: [],
      brands: [],
      productId: 0,

      // error flags
      nameError: false,
      priceError: false,
      brandError: false,
      materialError: false,
      descriptionError: false,
      imageError: false,

      nameErrorMessage: '',
      priceErrorMessage: '',
      brandErrorMessage: '',
      materialErrorMessage: '',
      descriptionErrorMessage: '',
      imageErrorMessage: ''
    }
  },

  methods: {
    createProduct () {
      this.hideErrors()

      const config = { headers: { contentType: 'multipart/form-data' } }
      const uploadData = this.createFormData()

      this.$api
        .post('/api/products', uploadData, config)
        .then(response => {
          this.productId = response.data.id
        })
        .then(() => {
          this.$q.notify({ type: 'positive', timeout: 2000, message: 'Produkt bol úspešne vytvorený.' })
          this.$router.push({ path: '/products/' + this.productId + '/edit' })
        })
        .catch(error => {
          if (error.response.data.errors) {
            this.showErrors(error.response.data.errors)
          }

          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Vyskytla sa chyba - nie je možné vytvoriť produkt.' })
          console.log(error)
        })
    },

    createFormData () {
      const uploadData = new FormData()
      const images = this.$refs.uploader.files

      uploadData.append('name', this.productName)
      uploadData.append('description', this.productDescription)
      uploadData.append('price', this.productPrice)
      uploadData.append('category', this.selectedSubcategory)
      uploadData.append('brand', this.productBrand)
      uploadData.append('material', this.productMaterial)

      // append images
      for (let i = 0; i < images.length; i++) {
        uploadData.append(`images[${i}]`, images[i])
      }

      return uploadData
    },

    showErrors (errors) {
      if (errors.brand) {
        this.brandErrorMessage = errors.brand[0]
        this.brandError = true
      }

      if (errors.description) {
        this.descriptionErrorMessage = errors.description[0]
        this.descriptionError = true
      }

      if (errors.material) {
        this.materialErrorMessage = errors.material[0]
        this.materialError = true
      }

      if (errors.name) {
        this.nameErrorMessage = errors.name[0]
        this.nameError = true
      }

      if (errors.price) {
        this.priceErrorMessage = errors.price[0]
        this.priceError = true
      }

      if (errors.images) {
        this.imageErrorMessage = errors.images[0]
        this.imageError = true
      }
    },

    hideErrors () {
      this.nameError = false
      this.priceError = false
      this.brandError = false
      this.materialError = false
      this.descriptionError = false
      this.designError = false
      this.imageError = false
    },

    setSubcategory () {
      this.selectedSubcategory = this.selectedMainCategory.child_categories[0].id
    }
  },
  mounted () {
    this.$api
      .get('/api/categories')
      .then(response => {
        this.mainCategories = response.data
        this.selectedMainCategory = this.mainCategories[0]
        this.selectedSubcategory = this.selectedMainCategory.child_categories[0].id
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní kategórií.' })
        console.log(error)
      })

    this.$api
      .get('/api/brands')
      .then(response => {
        this.brands = response.data
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní značiek.' })
        console.log(error)
      })
  }
}
</script>
