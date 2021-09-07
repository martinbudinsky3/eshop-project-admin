<template>
  <div class="q-my-xl">
    <q-table
        :data="productDesigns"
        row-key="id"
        :loading="loading"
        @request="fetchProductDesigns"
        :columns="columns"
        :pagination.sync="pagination"
        :hide-pagination="true"
        title="Zoznam variantov produktu"
        binary-state-sort
        >
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td key="color" :props="props">
            <span>{{ props.row.color.name }}</span>
          </q-td>
          <q-td key="size" :props="props">
            <span>{{ props.row.size }}</span>
          </q-td>
          <q-td key="quantity" :props="props">
            <span>{{ props.row.quantity }}</span>
          </q-td>
          <q-td class="text-right">
            <div>
              <q-btn round icon="edit" class="q-mr-xs" @click="showEditProductDesignModal(props.row)" />
              <q-btn round icon="delete" @click="showDeleteProductDesignDialog(props.row.id)"/>
            </div>
          </q-td>
        </q-tr>
    </q-table>

    <div class="row justify-end full-width docs-btn q-mt-md">
      <q-btn label="Pridať variant produktu" color="primary" @click="showCreateProductDesignModal"/>
    </div>

    <q-dialog v-model="modal" persistent>
      <q-card class="design-modal">
        <q-card-section>
          <h2 v-show="creatingProductDesign" class="text-h6">Pridanie variantu produktu</h2>
          <h2 v-show="!creatingProductDesign" class="text-h6">Upravenie variantu produktu</h2>
          <q-select
            class="q-mb-sm"
            option-value="id"
            option-label="name"
            v-model="productDesignColor"
            :options="colors"
            label="Farba"
            :error-message="colorErrorMessage"
            :error="colorError"/>
          <q-select
            class="q-mb-sm"
            v-model="productDesignSize"
            :options="sizes"
            label="Veľkost"
            :error-message="sizeErrorMessage"
            :error="sizeError" />
          <q-input
            type="number"
            label="Množstvo"
            v-model="productDesignQuantity"
            min=0
            :error-message="quantityErrorMessage"
            :error="quantityError"/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Späť" v-close-popup />
          <q-btn
            v-show="creatingProductDesign"
            color="primary"
            label="Pridať"
            @click="createProductDesign()"/>
          <q-btn
            v-show="!creatingProductDesign"
            color="primary"
            label="Upraviť"
            @click="editProductDesign()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      columns: [
        { name: 'color', label: 'Farba', sortable: false, align: 'left' },
        { name: 'size', label: 'Veľkosť', sortable: false, align: 'left' },
        { name: 'quantity', label: 'Množstvo', sortable: false, align: 'left' },
        { name: 'actions', label: 'Akcie', sortable: false, align: 'right' }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 0
      },
      loading: false,
      selected: [],

      productDesigns: [],
      colors: [],
      sizes: [],

      modal: false,
      creatingProductDesign: true,
      editedProductDesignId: 0,

      productDesignColor: null,
      productDesignSize: '',
      productDesignQuantity: 0,

      colorError: false,
      sizeError: false,
      quantityError: false,
      colorErrorMessage: '',
      sizeErrorMessage: '',
      quantityErrorMessage: ''
    }
  },
  methods: {
    fetchColors () {
      this.$api
        .get('/api/colors')
        .then(response => {
          this.colors = response.data
        })
        .catch(error => {
          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní farieb.' })
          console.log(error)
        })
    },

    fetchSizes () {
      this.$api
        .get('/api/sizes')
        .then(response => {
          this.sizes = response.data
        })
        .catch(error => {
          this.$q.notify({ type: 'negative', timeout: 2000, message: 'Chyba pri načítaní veľkostí.' })
          console.log(error)
        })
    },

    fetchProductDesigns () {
      this.loading = true

      this.$api
        .get(`/api/products/${this.$route.params.id}/product-designs`)
        .then(({ data }) => {
          this.productDesigns = data.productDesigns
          this.$emit('product-designs-fetched', this.productDesigns.length)
          this.loading = false
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Nepodarilo sa načítať zoznam variantov produktu.'
          })

          this.loading = false
        })
    },

    createProductDesign () {
      this.$api
        .post(
            `/api/products/${this.$route.params.id}/product-designs`,
            this.productDesignData
        )
        .then((id) => {
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Variant produktu bol úspešne pridaný.'
          })
          this.clearProductDesignForm()
          this.fetchProductDesigns()
        })
        .catch(error => {
          if (error.response.data.errors) {
            this.showErrors(error.response.data.errors)
          }
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Vyskytla sa chyba - nie je možné pridať variant produktu.'
          })
          console.log(error)
        })
    },

    editProductDesign () {
      this.$api
        .put(
            `/api/product-designs/${this.editedProductDesignId}`,
            this.productDesignData
        )
        .then(() => {
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Variant produktu bol úspešne upravený.'
          })
          this.clearProductDesignForm()
          this.fetchProductDesigns()
        })
        .catch(error => {
          if (error.response.data.errors) {
            this.showErrors(error.response.data.errors)
          }
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Vyskytla sa chyba - nie je možné upraviť variant produktu.'
          })
          console.log(error)
        })
    },

    showDeleteProductDesignDialog (id) {
      this.$q.dialog({
        title: 'Odstránenie variantu',
        message: 'Naozaj chcete odstrániť variant produktu?',
        color: 'primary',
        ok: true,
        cancel: true
      }).onOk(() => {
        this.deleteProductDesign(id)
      })
    },

    showCreateProductDesignModal () {
      this.hideErrors()
      this.creatingProductDesign = true
      this.modal = true
      this.productDesignColor = null
      this.productDesignSize = ''
      this.productDesignQuantity = 0
    },

    showEditProductDesignModal (productDesign) {
      this.hideErrors()
      this.creatingProductDesign = false
      this.modal = true
      this.editedProductDesignId = productDesign.id
      this.productDesignColor = productDesign.color
      this.productDesignSize = productDesign.size
      this.productDesignQuantity = productDesign.quantity
    },

    deleteProductDesign (id) {
      this.$api
        .delete(`/api/product-designs/${id}`)
        .then(() => {
          this.fetchProductDesigns()
          this.$q.notify({
            type: 'positive',
            timeout: 2000,
            message: 'Variant produktu bol odstránený.'
          })
        })
        .catch(error => {
          this.$q.notify({
            type: 'negative',
            timeout: 2000,
            message: 'Nepodarilo sa odstrániť variant produktu.'
          })
          console.log(error)
        })
    },

    clearProductDesignForm () {
      this.hideErrors()
      this.modal = false
      this.color = {}
      this.size = ''
      this.quantity = 0
    },

    showErrors (errors) {
      if (errors.color) {
        this.colorErrorMessage = errors.color[0]
        this.colorError = true
      }

      if (errors.size) {
        this.sizeErrorMessage = errors.size[0]
        this.sizeError = true
      }

      if (errors.quantity) {
        this.quantityErrorMessage = errors.quantity[0]
        this.quantityError = true
      }
    },

    hideErrors () {
      this.colorError = false
      this.sizeError = false
      this.quantityError = false
    }
  },

  mounted () {
    this.fetchProductDesigns()
    this.fetchColors()
    this.fetchSizes()
  },

  computed: {
    productDesignData: function () {
      return {
        color: this.productDesignColor && this.productDesignColor.id,
        size: this.productDesignSize,
        quantity: this.productDesignQuantity
      }
    }
  }
}
</script>
