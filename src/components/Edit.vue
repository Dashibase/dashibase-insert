<template>
  <Loading :loading="loading" />
  <Navbar :haveUnsavedChanges="haveUnsavedChanges"
    :passwordHash="passwordHash"
    :formId="props.formId"
    @publish="publish"
    @updatePassword="value => passwordHash=value"
    @setLock="setLock"
    @removeLock="removeLock" />
  <SidePanel ref="sidePanel" :currentFormId="props.formId" />
  <PublishedTo :formId="props.formId" />
  <div class="w-full overflow-x-hidden overflow-y-visible grow">
    <div :class="[store.sidepanelIsOpen ? 'translate-x-32' : '', 'transition']">
      <Editor
        :formId="props.formId"
        :supabaseUrl="supabaseUrl"
        :supabaseAnonKey="supabaseAnonKey"
        :tableId="tableId"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/utils/store'
import { supabase } from '@/utils/supabase'
import { Block } from '@/utils/types'
import Editor from './editor/Editor.vue'
import Navbar from './panels/Navbar.vue'
import SidePanel from './panels/SidePanel.vue'
import PublishedTo from './panels/PublishedTo.vue'
import Loading from './Loading.vue'

const store = useStore()

const supabaseUrl = ref('')
const supabaseAnonKey = ref('')
const tableId = ref('')
const passwordHash = ref('')

const publishedTitle = ref('')
const publishedBlocks = ref([] as Block[])
const publishedButtonLabel = ref('')

const sidePanel = ref<any>(null)
const loading = ref(false)

const props = defineProps({
  formId: {
    type: String,
    required: true,
  },
})

const haveUnsavedChanges = computed(() => {
  const titleChanged = publishedTitle.value !== store.title
  const blocksChanged = JSON.stringify(publishedBlocks.value) !== JSON.stringify(store.blocks)
  const buttonLabelChanged = publishedButtonLabel.value !== store.buttonLabel
  return titleChanged || blocksChanged || buttonLabelChanged
})

async function setLock (password:string) {
  loading.value = true
  await supabase.from(import.meta.env.VITE_TABLE_ID)
    .update({ password_hash: password })
    .match({ id: props.formId })
  passwordHash.value = password
  loading.value = false
}

async function removeLock () {
  loading.value = true
  await supabase.from(import.meta.env.VITE_TABLE_ID)
    .update({ password_hash: null })
    .match({ id: props.formId })
  passwordHash.value = ''
  loading.value = false
}

async function publish () {
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
  await supabase.from(import.meta.env.VITE_TABLE_ID)
    .upsert(item)
  publishedTitle.value = store.title
  publishedBlocks.value = JSON.parse(JSON.stringify(store.blocks))
  publishedButtonLabel.value = store.buttonLabel
  if (sidePanel.value) sidePanel.value.getUserForms()
  loading.value = false
}

onMounted(async () => {
  store.schema = null
  const { data, error } = await supabase.from(import.meta.env.VITE_TABLE_ID)
    .select('supabase_url,supabase_anon_key,title,blocks,button_label,table_id' + (import.meta.env.VITE_ENABLE_PASSWORD === 'true' ? ',password_hash' : ''))
    .eq('id', props.formId)
    .single()
  if (error) {
    console.error(error.message)
    return
  } else {
    supabaseUrl.value = data.supabase_url
    supabaseAnonKey.value = data.supabase_anon_key
    tableId.value = data.table_id
    store.title = data.title || ''
    publishedTitle.value = data.title || ''
    store.blocks = data.blocks || []
    publishedBlocks.value = JSON.parse(JSON.stringify(data.blocks)) || []
    store.buttonLabel = data.button_label || 'Submit'
    publishedButtonLabel.value = data.button_label || 'Submit'
    passwordHash.value = data.password_hash || ''
  }

  const response = await fetch(`${supabaseUrl.value}/rest/v1/?apikey=${supabaseAnonKey.value}`)
  store.schema = (await (await response.json()).definitions)[tableId.value]
})
</script>