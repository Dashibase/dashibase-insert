<template>
  <Loading :loading="loading" />
  <PoweredBy />
  <!-- Ask for password if required -->
  <div v-if="!loading && locked" class="max-w-sm mx-auto my-36 space-y-4">
    <div class="text-4xl font-semibold">
      A password is required to view this
    </div>
    <div>
      <div class="text-sm font-semibold py-1">
        Password
      </div>
      <input v-model="password" type="password" class="border rounded shadow px-2 py-1 w-full max-w-sm text-gray-700 truncate focus:overflow-auto mb-2"
        @keyup.enter="_confirm" />
    </div>
    <div v-if="passwordWarning" class="text-red-600 pb-1">
      {{ passwordWarning }}
    </div>
    <button class="relative bg-neutral-800 text-neutral-100 rounded shadow px-3 py-1 text-base font-semibold" @click="_confirm">
      Enter
    </button>
  </div>
  <!-- Actual form -->
  <div v-if="!locked" class="max-w-prose mx-auto my-36 space-y-4">
    <h1 class="text-5xl font-bold mb-12">
      {{ title }}
    </h1>
    <div>
      <div v-for="block in blocks" class="space-y-4 pb-4">
        <div>
          <div v-if="block.details.hasLabel" class="text-sm font-semibold py-1">
            {{ block.details.label }}<span v-if="block.details.required">&nbsp;*</span>
          </div>
          <!-- Text -->
          <div v-if="block.type === BlockType.Text" class="py-1">
            {{ block.details.value }}
          </div>
          <!-- Heading 1 -->
          <div v-if="block.type === BlockType.H1" class="py-1 text-4xl font-semibold">
            {{ block.details.value }}
          </div>
          <!-- Heading 2 -->
          <div v-if="block.type === BlockType.H2" class="py-1 text-3xl font-medium">
            {{ block.details.value }}
          </div>
          <!-- Divider -->
          <div v-else-if="block.type === BlockType.Divider" class="h-[1px] w-full bg-neutral-300 my-[1.2rem]" />
          <!-- Short Answer -->
          <div v-else-if="block.type === BlockType.ShortAnswer">
            <input :id="block.details.attributeId"
              class="focus:outline-none focus-visible:outline-none border rounded shadow px-2 py-1 w-full max-w-sm truncate focus:overflow-auto mb-2"
              :placeholder="block.details.value" :required="block.details.required"
              :value="inputs[block.details.attributeId as string]"
              @input="inputs[block.details.attributeId as string] = ($event.target as HTMLInputElement).value" />
          </div>
          <!-- Long Answer -->
          <div v-else-if="block.type === BlockType.LongAnswer">
            <textarea :id="block.details.attributeId" rows="3"
              class="focus:outline-none focus-visible:outline-none border rounded shadow px-2 py-1 w-full mb-2"
              :placeholder="block.details.value" :required="block.details.required"
              :value="inputs[block.details.attributeId as string]"
              @input="inputs[block.details.attributeId as string] = ($event.target as HTMLInputElement).value" />
          </div>
          <!-- Date -->
          <div v-else-if="block.type === BlockType.Date" class="relative">
            <div class="absolute py-[0.45rem] h-9 w-full pointer-events-none px-2 max-w-sm text-gray-400">
              <CalendarIcon class="w-5 absolute right-2 z-10 bg-white" />
            </div>
            <input :id="block.details.attributeId"
              type="date"
              class="focus:outline-none focus-visible:outline-none border rounded shadow px-2 py-1 w-full max-w-sm truncate focus:overflow-auto mb-2"
              :placeholder="block.details.value" :required="block.details.required"
              :value="inputs[block.details.attributeId as string]"
              @input="inputs[block.details.attributeId as string] = ($event.target as HTMLInputElement).value" />
          </div>
          <!-- Time -->
          <div v-else-if="block.type === BlockType.Time" class="relative">
            <div class="absolute py-[0.45rem] h-9 w-full pointer-events-none px-2 max-w-sm text-gray-400">
              <ClockIcon class="w-5 absolute right-2 z-10 bg-white" />
            </div>
            <input :id="block.details.attributeId"
              type="time"
              class="focus:outline-none focus-visible:outline-none border rounded shadow px-2 py-1 w-full max-w-sm truncate focus:overflow-auto mb-2"
              :placeholder="block.details.value" :required="block.details.required"
              :value="inputs[block.details.attributeId as string]"
              @input="inputs[block.details.attributeId as string] = ($event.target as HTMLInputElement).value" />
          </div>
          <!-- Datetime -->
          <div v-else-if="block.type === BlockType.Datetime" class="relative">
            <div class="absolute py-[0.45rem] h-9 w-full pointer-events-none px-2 max-w-sm text-gray-400">
              <div class="absolute right-2 z-10 bg-white flex gap-1">
                <CalendarIcon class="w-5" />
                <ClockIcon class="w-5" />
              </div>
            </div>
            <input :id="block.details.attributeId"
              type="datetime-local"
              class="focus:outline-none focus-visible:outline-none border rounded shadow px-2 py-1 w-full max-w-sm truncate focus:overflow-auto mb-2"
              :placeholder="block.details.value" :required="block.details.required"
              :value="inputs[block.details.attributeId as string]"
              @input="inputs[block.details.attributeId as string] = ($event.target as HTMLInputElement).value" />
          </div>
          <!-- Dropdown -->
          <DropDown v-else-if="block.type === BlockType.Dropdown"
            :id="block.details.attributeId"
            :options="block.details.options ? block.details.options.map(i => { return { label: i, value: i } }) : []"
            :modelValue="inputs[block.details.attributeId as string]"
            @update:modelValue="value => inputs[block.details.attributeId as string] = value" />
          <!-- Bool -->
          <Toggle v-else-if="block.type === BlockType.Bool"
            :id="block.details.attributeId"
            :modelValue="inputs[block.details.attributeId as string]"
            @update:modelValue="value => inputs[block.details.attributeId as string] = value" />
        </div>
      </div>
    </div>
    <!-- Message in case of error -->
    <div v-if="warning" class="text-red-600">
      {{ warning }}
    </div>
    <button v-if="!!supabaseUrl" :disabled="submitted" class="relative bg-neutral-800 text-neutral-100 rounded shadow px-3 py-1 text-base font-semibold" @click="submit">
      <span :class="submitting ? 'opacity-0' : ''">{{ submitted ? 'Submitted!' : buttonLabel }}</span>
      <v-icon v-if="submitting" name="ri-loader-4-fill" class="absolute left-1/2 -ml-3 w-6 h-6 animate-spin" />
    </button>
    <!-- Thank you message after submission -->
    <div v-if="submitted" class="text-sm text-neutral-700">
      Thank you! Refresh to submit another entry.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { CalendarIcon, ClockIcon } from '@heroicons/vue/outline'
import { Block, BlockType } from '@/utils/types'
import DropDown from './elements/DropDown.vue'
import Toggle from './elements/Toggle.vue'
import PoweredBy from './branding/PoweredBy.vue'
import Loading from './Loading.vue'
import { supabase } from '@/utils/supabase'

// Form metadata and details
const supabaseUrl = ref('')
const supabaseAnonKey = ref('')
const tableId = ref('')
const title = ref('')
const blocks = ref([] as Block[])
const buttonLabel = ref('Submit')

// User's inputs
const inputs = ref({} as any)

// Overall page state
const locked = ref(true)
const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const warning = ref('')

const props = defineProps({
  formId: {
    type: String,
    required: true,
  },
})

/*
Check if required fields are filled
*/
function checkRequired () {
  const unfilledRequired = blocks.value
    .filter(block => block.details.required)
    .map(block => {
      const attributeId = block.details.attributeId as string
      if (block.type === BlockType.Bool) return null
      else if (!inputs.value[attributeId]) return block.details.label || block.details.attributeId
      else return null
    })
    .filter(attributeId => attributeId !== null)
  return unfilledRequired
}

async function submit () {
  warning.value = ''
  const unfilledRequired = checkRequired()
  if (unfilledRequired.length) {
    warning.value = `${unfilledRequired.join(', ')} need${unfilledRequired.length > 1 ? '' : 's'} to be filled.`
    return
  }
  submitting.value = true
  const supabase = createClient(supabaseUrl.value, supabaseAnonKey.value)
  // Submit as anonymous user
  supabase.auth.session = () => null
  const { error } = await supabase.from(tableId.value)
    .insert(inputs.value)
  submitting.value = false
  if (!error) submitted.value = true
  else warning.value = error.message
}

// Handle locked forms
const password = ref('')
const passwordWarning = ref('')
const resolvePromise = ref<Function|undefined>(undefined)
const rejectPromise = ref<Function|undefined>(undefined)
async function passwordIsCorrect () {
  const response = await fetch(import.meta.env.VITE_LAMBDA_URL, {
    method: 'POST',
    body: JSON.stringify({
      form_id: props.formId,
      password: password.value,
    })
  })
  if (response.ok) {
    return await response.json()
  }
}
async function _confirm () {
  passwordWarning.value = ''
  const result = await passwordIsCorrect()
  if (result && resolvePromise.value) resolvePromise.value(result)
  else passwordWarning.value = 'Incorrect password. Try again?'
}
function _cancel () {
  if (resolvePromise.value) resolvePromise.value(false)
}
function unlock () {
  return new Promise((resolve, reject) => {
    resolvePromise.value = resolve
    rejectPromise.value = reject
  })
}

function initForm (data:any) {
  supabaseUrl.value = data.supabase_url
  supabaseAnonKey.value = data.supabase_anon_key
  tableId.value = data.table_id
  title.value = data.title || ''
  blocks.value = data.blocks || []
  buttonLabel.value = data.button_label || 'Submit'
  const firstInputAttribute = blocks.value.filter(block => block.details.attributeId)
    .map(block => block.details.attributeId)[0] as string

  // Focus on first input
  setTimeout(() => {
    const firstInputElement = document.getElementById(firstInputAttribute)
    if (firstInputElement) firstInputElement.focus()
  }, 100)

  // Initialize inputs variable
  blocks.value.forEach(block => {
    if (block.details.attributeId) {
      if (block.type === BlockType.Dropdown) {
        inputs.value[block.details.attributeId] = block.details.options ? block.details.options[0] : null
      } else if (block.type === BlockType.Bool) {
        inputs.value[block.details.attributeId] = false
      }
    }
  })
}

onMounted(async () => {
  if (import.meta.env.VITE_ENABLE_PASSWORD === 'true') {
    // If password setting is enabled, we move password validation and form retrieval to an external server
    const response = await fetch(import.meta.env.VITE_LAMBDA_URL, {
      method: 'POST',
      body: JSON.stringify({
        form_id: props.formId,
      })
    })
    const json = await response.json()
    loading.value = false
    
    if (json === 'Password required') {
      // Check for password
      const data = await unlock()
      if (data) {
        locked.value = false
        initForm(data)
      }
    } else {
      locked.value = false
      initForm(json)
    }
  } else {
    // Get form directly from supabase table
    const { data, error } = await supabase.from(import.meta.env.VITE_TABLE_ID)
      .select('supabase_url,supabase_anon_key,title,blocks,button_label,table_id')
      .eq('id', props.formId)
      .single()
    if (error) console.error(error.message)
    else {
      locked.value = false
      loading.value = false
      initForm(data)
    }
  }
})
</script>