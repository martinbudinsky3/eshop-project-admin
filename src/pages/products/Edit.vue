<template>
<div class="q-my-xl">
    <q-card>
        <q-card-section class="text-h5">Editovanie {{ productName }}</q-card-section>
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
          </q-card-section>
          <q-card-section class=text-h6>Varianty produktu</q-card-section>
          <q-card-section>
            <q-btn class="q-mb-sm" label="Pridať variant" color="primary" @click="createDesign()" />
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
          </q-card-section>
          <q-card-section class="text-h6">Obrázky</q-card-section>
          <q-card-section>
            <ul class="ls-none">
              <li class="cursor-pointer q-px-sm" style="display: inline;" v-for="(image, index) in originalImages" :key="index">
                <q-img
                  :src="'http://wtech-eshop.test/' + image.path"
                  spinner-color="grey"
                  style="height: 280px; max-width: 200px"
                >
                  <q-btn icon="close" class="absolute all-pointer-events" unelevated color="grey-6" style="top: 8px; right: 8px" round @click="removeImage(image)"/>
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
      deletedImages: []
    }
  },
  methods: {
    updateProduct () {
      axios
        .put('http://wtech-eshop.test/products/' + this.$route.params.id, this.productData)
        .then(response => {
          return this.uploadImages()
        })
        .then(() => {
          this.$q.notify({ type: 'positive', timeout: 2000, message: 'The product has been updated.' })
        })
        .catch(error => {
          this.$q.notify({ type: 'negative', timeout: 2000, message: 'An error has been occured.' })
          console.log(error)
        })
    },

    uploadImages () {
      const config = { headers: { contentType: 'multipart/form-data' } }
      const uploadData = new FormData()
      const images = this.$refs.uploader.files

      uploadData.append('productId', this.$route.params.id)
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

    axios
      .get('http://wtech-eshop.test/image/' + this.$route.params.id)
      .then(response => {
        this.originalImages = response.data
        console.log(response.data)
      })
      .catch(error => {
        this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní obrázkov.' })
        console.log(error)
      })

    axios
      .get('http://wtech-eshop.test/category')
      .then(response => {
        this.mainCategories = response.data
      })
      .then(data => {
        axios
          .get('http://wtech-eshop.test/products/' + this.$route.params.id + '/edit')
          .then(response => {
            this.productName = response.data.name
            this.productPrice = response.data.price
            this.productMaterial = response.data.material
            this.productDescription = response.data.description
            this.selectedMainCategory = this.mainCategories.find(category => category.id === response.data.categories[0].parent_categories[0].id)
            this.selectedSubcategory = this.selectedMainCategory.child_categories.find(category => category.id === response.data.categories[0].id).id
            this.productBrand = response.data.brand.id
            this.productDesigns = response.data.product_designs
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
