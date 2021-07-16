<template>
<div class="q-my-xl">
    <div v-if="productDesignsCount < 1" class="q-pa-md q-mb-md alert-warning">
      <p>Aby sa produkt zobrazil v klientskej časti musí mať aspoň 1 variant (farba, veľkosť).</p>
      <q-btn label="Pridať varianty" color="primary" @click="scrollToProductDesignList"/>
    </div>
    <q-card>
        <q-card-section>
          <h1 class="text-h5">
            Editovanie {{ productName }}
          </h1>
        </q-card-section>
         <q-card-section>
            <q-input
              class="q-mb-sm"
              label="Názov"
              maxlength="255"
              counter
              v-model="productName"
              error-message="Pole názov je povinné."
              :error="nameError"
            />
            <q-input
              class="q-mb-sm"
              type="number"
              label="Cena"
              v-model="productPrice"
              step="any"
              min=0
              error-message="Pole cena je povinné."
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
              label="Podkategória" />
            <q-select
              class="q-mb-sm"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              v-model="productBrand"
              :options="brands"
              label="Značka"
              error-message="Pole značka je povinné."
              :error="brandError"
            />
            <q-input
              class="q-mb-sm"
              label="Materiál"
              maxlength="100"
              counter
              v-model="productMaterial"
              error-message="Pole materiál je povinné."
              :error="materialError"
            />
            <q-input
              class="q-mb-sm"
              type="textarea"
              label="Popis"
              v-model="productDescription"
              :max-height="100"
              rows="7"
              error-message="Pole popis je povinné."
              :error="descriptionError"
            />
          </q-card-section>
          <q-card-section>
            <h2 class="text-h6">Obrázky</h2>
            <ul class="ls-none">
              <li class="cursor-pointer q-px-sm d-inline" v-for="(image, index) in originalImages" :key="index">
                <q-img
                  :src="'http://eshop-project.test/' + image.path"
                  spinner-color="grey"
                  class="image-item"
                >
                  <q-btn icon="close" class="absolute all-pointer-events close-btn" unelevated color="grey-6" round @click="removeImage(image)"/>
                </q-img>
              </li>
            </ul>
            <q-uploader
              class="q-mt-sm"
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
                <q-btn label="Editovať" color="primary" @click="updateProduct"/>
            </div>
        </q-card-actions>
    </q-card>
    <product-design-list
      ref="productDesignList"
      @product-designs-fetched="saveProductDesignsCount"/>
</div>
</template>

<style lang="stylus">
  .d-inline
    display inline

  .image-item
    max-width 200px

  .close-btn
    top 8px
    right 8px

  .docs-btn .q-btn
      padding 15px 20px
</style>

<script>
import axios from 'axios'
import ProductDesignList from 'src/components/ProductDesignList.vue'

export default {
  components: { ProductDesignList },
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
      productId: '',
      originalImages: [],
      deletedImages: [],

      productDesignsCount: 2,

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
    updateProduct () {
      this.hideErrors()

      const config = { headers: { contentType: 'multipart/form-data' } }
      const uploadData = this.createFormData()

      axios
        .post(process.env.API + '/products/' + this.$route.params.id, uploadData, config)
        .then((response) => {
          console.log(response)
          this.$q.notify({ type: 'positive', timeout: 2000, message: response.data.success })
        })
        .catch(error => {
          if (error.response.data.errors) {
            console.log(error.response.data.errors)
            this.showErrors(error.response.data.errors)
          }
          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Nastala chyba.' })
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

      // append new images
      for (let i = 0; i < images.length; i++) {
        uploadData.append(`images[${i}]`, images[i])
      }

      // append deleted images
      // TODO send only IDs
      uploadData.append('deleted_images', [])
      for (let i = 0; i < this.deletedImages.length; i++) {
        uploadData.append(`deleted_images[${i}][id]`, this.deletedImages[i].id)
        uploadData.append(`deleted_images[${i}][path]`, this.deletedImages[i].path)
      }

      uploadData.append('_method', 'put')

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

      if (errors.deleted_images) {
        this.imageErrorMessage = errors.deleted_images[0]
        this.imageError = true
      }
    },

    hideErrors () {
      this.nameError = false
      this.priceError = false
      this.brandError = false
      this.materialError = false
      this.descriptionError = false
      this.imageError = false
    },

    setSubcategory () {
      this.selectedSubcategory = this.selectedMainCategory.child_categories[0].id
    },

    removeImage (image) {
      this.originalImages = this.originalImages.filter(item => item !== image)
      this.deletedImages.push(image)
    },

    saveProductDesignsCount (productDesignsCount) {
      this.productDesignsCount = productDesignsCount
    },

    scrollToProductDesignList () {
      const el = this.$refs.productDesignList.$el
      el.scrollIntoView({ behavior: 'smooth' })
    }
  },
  mounted () {
    axios
      .get(process.env.API + '/brand')
      .then(response => {
        this.brands = response.data
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní značiek.' })
        console.log(error)
      })

    axios
      .get(process.env.API + '/category')
      .then(response => {
        this.mainCategories = response.data
      })
      .then(data => {
        axios
          .get(process.env.API + '/products/' + this.$route.params.id + '/edit')
          .then(response => {
            const product = response.data.product

            this.productName = product.name
            this.productPrice = product.price
            this.productMaterial = product.material
            this.productDescription = product.description
            this.selectedMainCategory = this.mainCategories.find(category => category.id === product.categories[0].parent_categories[0].id)
            this.selectedSubcategory = this.selectedMainCategory.child_categories.find(category => category.id === product.categories[0].id).id
            this.productBrand = product.brand.id
            this.productDesigns = product.product_designs

            this.originalImages = response.data.images
          })
          .catch(error => {
            this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní produktu.' })
            console.log(error)
          })
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní kategórií.' })
        console.log(error)
      })
  }
}
</script>
