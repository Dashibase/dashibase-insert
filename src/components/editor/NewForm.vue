<template>
  <div class="max-w-prose mx-auto mt-[5.35rem] mb-36 list-group transition space-y-4">
    <h1 class="focus-visible:outline-none text-5xl font-bold mb-12">
      New Form
    </h1>
    <div>
      <div v-for="block in blocks" class="space-y-4 pb-4">
        <div>
          <div v-if="block.details.hasLabel" class="text-sm font-semibold py-1">
            {{ block.details.label }}<span v-if="block.details.required">&nbsp;*</span>
          </div>
          <div v-if="block.type === BlockType.Text" class="py-1">
            {{ block.details.value }}
          </div>
          <div v-else-if="block.type === BlockType.Divider" class="h-[1px] w-full bg-neutral-300 my-[1.2rem]" />
          <div v-else-if="block.type === BlockType.ShortAnswer">
            <input :id="block.details.attributeId"
              class="focus-visible:outline-none border rounded shadow px-2 py-1 w-full max-w-sm text-gray-700 truncate focus:overflow-auto"
              :placeholder="block.details.value"
              :value="inputs[block.details.attributeId as string]"
              @input="update(block.details.attributeId as string, ($event.target as HTMLInputElement).value)" />
          </div>
          <div v-else-if="block.type === BlockType.LongAnswer">
            <input :id="block.details.attributeId"
              class="focus-visible:outline-none border rounded shadow px-2 py-1 w-full text-gray-700"
              :placeholder="block.details.value"
              :value="inputs[block.details.attributeId as string]"
              @input="update(block.details.attributeId as string, ($event.target as HTMLInputElement).value)" />
          </div>
          <div v-else-if="block.type === BlockType.Dropdown">
            <DropDown :id="block.details.attributeId"
              :options="block.details.options ? block.details.options.map(i => { return { label: i, value: i } }) : []"
              :modelValue="inputs[block.details.attributeId as string]"
              @update:modelValue="value => update(block.details.attributeId as string, value)" />
          </div>
        </div>
      </div>
    </div>
    <div class="text-red-600" :class="warning ? 'visible' : 'invisible'">
      {{ warning }}
    </div>
    <button class="relative bg-neutral-800 text-neutral-100 rounded shadow px-3 py-1 text-base font-semibold" @click="submit">
      <span :class="loading ? 'opacity-0' : ''">Generate form</span>
      <v-icon v-if="loading" name="ri-loader-4-fill" class="absolute left-1/2 -ml-3 w-6 h-6 animate-spin" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BlockType } from '@/utils/types'
import DropDown from '../elements/DropDown.vue'

const blocks = ref([
  {
    type: BlockType.Text,
    details: {
      value: 'Enter your Supabase details to automagically generate your form!',
    },
  }, {
    type: BlockType.LongAnswer,
    details: {
      hasLabel: true,
      label: 'Supabase URL',
      required: true,
      value: 'Find this at Supabase Settings > API > Project URL',
      attributeId: 'supabase_url',
    },
  }, {
    type: BlockType.LongAnswer,
    details: {
      hasLabel: true,
      label: 'Supabase Anon Key',
      required: true,
      value: 'Find this at Supabase Settings > API > Project API keys',
      attributeId: 'supabase_anon_key',
    },
  }, {
    type: BlockType.Dropdown,
    details: {
      hasLabel: true,
      label: 'Table Name',
      required: true,
      value: 'Enter your table name',
      attributeId: 'table_id',
      options: [] as string[],
    },
  }, 
])

const warning = ref('')
const loading = ref(false)
const inputs = ref({
  supabase_url: '',
  supabase_anon_key: '',
  table_id: '',
} as {[k:string]: string})

const emit = defineEmits(['submit'])

function update (attributeId:string, value:string) {
  inputs.value[attributeId] = value
  if (['supabase_url', 'supabase_anon_key'].includes(attributeId) && inputs.value['supabase_url'] && inputs.value['supabase_anon_key']) {
    blocks.value[3].details.options = []
    checkSupabaseKeys(inputs.value['supabase_url'], inputs.value['supabase_anon_key'])
      .then((tables:string[]) => {
        warning.value = ''
        blocks.value[3].details.options = tables
      })
      .catch(error => {
        warning.value = error.message
      })
  }
} 

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

async function checkSupabaseKeys (supabaseUrl:string, supabaseAnonKey:string, tableId:string|null=null) {
  let response, json, definitions
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`)
    json = await response.json()
  } catch {
    throw Error('Supabase credentials do not match. Check your URL and Anon Key?')
  }
  try {
    definitions = (await json.definitions)
  } catch {
    throw Error('No tables found')
  }
  if (tableId) {
    if (!definitions || !Object.keys(definitions).includes(tableId)) throw Error('Table not found')
    return definitions[tableId]
  } else {
    return Object.keys(definitions)
  }
}

async function submit () {
  let item = {} as { [k:string]: any }
  const supabaseUrlInput = document.getElementById('supabase_url')
  if ((supabaseUrlInput as HTMLInputElement).value === 'test') {
    item = {
      supabase_url: 'https://cikahocszfogccapupzr.supabase.co',
      supabase_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpa2Fob2NzemZvZ2NjYXB1cHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTAxMjA4MTYsImV4cCI6MTk2NTY5NjgxNn0.vLOJy09FKJAuBvPpQdS00jxiQj6Psu506mf6Ltgy8rc',
      table_id: 'insert_test',
      schema: '',
    }
  } else {
    warning.value = ''
    const unfilledRequired = checkRequired()
    if (unfilledRequired.length) {
      warning.value = `${unfilledRequired.join(', ')} need${unfilledRequired.length > 1 ? '' : 's'} to be filled.`
      return
    }
    item = inputs.value
  }
  loading.value = true
  const schema = await checkSupabaseKeys(item.supabase_url, item.supabase_anon_key, item.table_id)
    .catch(error => {
      warning.value = error.message
      throw Error(error.message)
    })
  item['schema'] = schema
  emit('submit', item)
  loading.value = false
}
</script>
