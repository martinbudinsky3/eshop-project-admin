<template>
<div class="q-my-xl">
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
            <h2 class="text-h6">Varianty produktu</h2>
            <q-btn class="q-mb-sm" label="Pridať variant" color="primary" @click="createDesign()" />
            <q-dialog v-model="modal" persistent>
              <q-card class="design-modal">
                <q-card-section class="q-pt-none">
                  <h2 class="text-h6">Variant produktu</h2>
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
                <q-chip removable  color="white" class="q-pl-none q-ml-none" @remove="removeDesign(design)">
                  {{ design.color.name }} - {{ design.size }} - {{ design.quantity }}ks
                </q-chip>
                <div class="errors" :ref="'design'+index"></div>
              </li>
            </ul>
            <p class="errors" :class="{'hidden': !designError}">{{ designErrorMessage }}</p>
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
      deletedDesigns: [],
      mainCategories: [],
      productDesigns: [],
      brands: [],
      colors: [],
      sizes: [],
      modal: false,
      productId: '',
      originalImages: [],
      deletedImages: [],

      // error flags
      nameError: false,
      priceError: false,
      brandError: false,
      materialError: false,
      descriptionError: false,
      designError: false,
      imageError: false,

      nameErrorMessage: '',
      priceErrorMessage: '',
      brandErrorMessage: '',
      materialErrorMessage: '',
      descriptionErrorMessage: '',
      designErrorMessage: '',
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

      // append new or edited product designs
      for (let i = 0; i < this.productDesigns.length; i++) {
        if (this.productDesigns[i].id !== undefined) {
          uploadData.append(`product_designs[${i}][id]`, this.productDesigns[i].id)
        }
        uploadData.append(`product_designs[${i}][color]`, this.productDesigns[i].color.id)
        uploadData.append(`product_designs[${i}][size]`, this.productDesigns[i].size)
        uploadData.append(`product_designs[${i}][quantity]`, this.productDesigns[i].quantity)
      }

      // append deleted product designs
      for (let i = 0; i < this.deletedDesigns.length; i++) {
        uploadData.append(`deleted_designs[${i}][id]`, this.deletedDesigns[i].id)
      }

      // append new images
      for (let i = 0; i < images.length; i++) {
        uploadData.append(`images[${i}]`, images[i])
      }

      // append deleted images
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

      if (errors.product_designs) {
        this.showDesignsErrors(errors.product_designs)
      }

      if (errors.deleted_images) {
        this.imageErrorMessage = errors.deleted_images[0]
        this.imageError = true
      }
    },

    showDesignsErrors (designErrors) {
      for (const [key, value] of Object.entries(designErrors)) {
        if (typeof value === 'object') {
          for (const message of Object.values(value)) {
            const div = this.$refs['design' + key][0]
            div.innerHTML += `<p class="text-red-9">${message[0]}</p>`
          }
        } else {
          this.designErrorMessage = designErrors[0]
          this.designError = true
        }
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
      this.hideDesignErrors()
    },

    hideDesignErrors () {
      for (let i = 0; i < this.productDesigns.length; i++) {
        const div = this.$refs['design' + i][0]
        div.innerHTML = ''
      }
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
      if (this.updatedProductDesignIndex === '') { // create design
        this.productDesigns.push({
          color: this.productDesignColor,
          size: this.productDesignSize,
          quantity: this.productDesignQuantity
        })
      } else { // update design
        this.productDesigns[this.updatedProductDesignIndex].color = this.productDesignColor
        this.productDesigns[this.updatedProductDesignIndex].size = this.productDesignSize
        this.productDesigns[this.updatedProductDesignIndex].quantity = this.productDesignQuantity
      }
    },

    removeDesign (design) {
      this.productDesigns = this.productDesigns.filter(item => item !== design)
      if (design.id) {
        this.deletedDesigns.push(design)
      }
    },

    editDesign (index) {
      this.modal = true
      this.updatedProductDesignIndex = index
      this.productDesignColor = this.productDesigns[index].color
      this.productDesignSize = this.productDesigns[index].size
      this.productDesignQuantity = this.productDesigns[index].quantity
    },

    removeImage (image) {
      this.originalImages = this.originalImages.filter(item => item !== image)
      this.deletedImages.push(image)
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
      .get(process.env.API + '/color')
      .then(response => {
        this.colors = response.data
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní farieb.' })
        console.log(error)
      })

    axios
      .get(process.env.API + '/size')
      .then(response => {
        this.sizes = response.data
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní veľkostí.' })
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
        product_designs: this.productDesigns,
        deleted_designs: this.deletedDesigns,
        deleted_images: this.deletedImages
      }
    }
  }
}
</script>
