<template>
  <Loading :loading="loading" />
  <Navbar
    :disableOptions="!supabaseUrl"
    :haveUnsavedChanges="true"
    :passwordHash="passwordHash"
    :formId="props.formId"
    @publish="publish"
    @updatePassword="value => passwordHash=value"
    @setLock="setLock"
    @removeLock="removeLock" />
  <SidePanel ref="sidePanel" />
  <div class="w-full overflow-hidden overflow-y-visible grow">
    <div :class="[store.sidepanelIsOpen ? 'translate-x-32' : '', 'transition']">
      <Editor v-if="supabaseUrl"
        :formId="props.formId"
        :supabaseUrl="supabaseUrl"
        :supabaseAnonKey="supabaseAnonKey"
        :tableId="tableId"
        />
      <NewForm v-else @submit="metadata => initForm(metadata)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BlockType } from '@/utils/types'
import { useStore } from '@/utils/store'
import { supabase } from '@/utils/supabase'
import router from '@/router'
import NewForm from './editor/NewForm.vue'
import Editor from './editor/Editor.vue'
import Navbar from './panels/Navbar.vue'
import SidePanel from './panels/SidePanel.vue'
import Loading from './Loading.vue'

const store = useStore()

const supabaseUrl = ref('')
const supabaseAnonKey = ref('')
const tableId = ref('')
const passwordHash = ref('')

const sidePanel = ref<any>(null)
const loading = ref(false)

const props = defineProps({
  formId: {
    type: String,
    required: true,
  },
})

async function setLock (password:string) {
  passwordHash.value = password
}

async function removeLock () {
  passwordHash.value = ''
}

function initForm (metadata:any) {
  supabaseUrl.value = metadata.supabase_url
  supabaseAnonKey.value = metadata.supabase_anon_key
  tableId.value = metadata.table_id
  store.schema = metadata.schema
  store.title = ''
  const requiredFields = Object.keys(store.schema.properties)
    // Exclude primary key
    .filter(key => !(store.schema.properties[key].description && store.schema.properties[key].description.includes('<pk/>')))
    // Exclude non-required attributes
    .filter(key => (store.schema.required.includes(key) && !store.schema.properties[key].default && (!store.schema.properties[key].description || !store.schema.properties[key].description.includes('<pk/>'))))
  
  if (requiredFields.length) {
    store.blocks = [{
      type: BlockType.Text,
      details: {
        value: 'We\'ve populated your form with the required fields. Edit this text or insert more inputs to get started. Have fun!',
      }
    }]
    requiredFields.forEach(key => {
      store.blocks.push({
        type: BlockType.ShortAnswer,
        details: {
          attributeId: key,
          hasLabel: true,
          label: key.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
          value: '',
          required: true,
        }
      })
    })
  } else {
    store.blocks = [{
      type: BlockType.Text,
      details: {
        value: 'We\'ve populated your form with the first attribute we found. Edit this text or insert more inputs to get started. Enjoy!',
      }
    }]
    const optionalField = Object.keys(store.schema.properties)
      // Exclude primary key
      .filter(key => !(store.schema.properties[key].description && store.schema.properties[key].description.includes('<pk/>')))
      [0] // Get first field
    store.blocks.push({
      type: BlockType.ShortAnswer,
      details: {
        attributeId: optionalField,
        hasLabel: true,
        label: optionalField.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
        value: '',
        required: true,
      }
    })
  }
  setTimeout(() => {
    const title = document.getElementById('title')
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(title as Node)
    range.collapse()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, 10)
}

async function publish () {
  if (!supabaseUrl.value) return
  loading.value = true
  const item = {
    id: props.formId,
    title: store.title,
    blocks: store.blocks,
    button_label: store.buttonLabel,
    supabase_url: supabaseUrl.value,
    supabase_anon_key: supabaseAnonKey.value,
    table_id: tableId.value,
    user: supabase.auth.user()?.id,
  }
  if (import.meta.env.VITE_ENABLE_PASSWORD === 'true') (item as any).password_hash = passwordHash.value
  await supabase.from(import.meta.env.VITE_TABLE_ID)
    .upsert(item)
  router.push(`/edit/${props.formId}`)
  if (sidePanel.value) sidePanel.value.getUserForms()
  loading.value = false
}
</script>