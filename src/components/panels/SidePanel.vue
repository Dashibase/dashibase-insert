<template>
  <div class="z-30 fixed top-0 left-0 h-screen bg-neutral-50 w-64 transition flex flex-col justify-between"
    :class="store.sidepanelIsOpen ? '' : '-translate-x-64'">
    <div>
      <div class="w-full flex justify-between items-center p-4">
        <img src="@/assets/dashibase.svg" class="w-8 pl-2" />
        <ChevronLeftIcon class="w-10 h-10 text-neutral-800 hover:bg-neutral-200 p-2 rounded-lg cursor-pointer" @click="store.sidepanelIsOpen = false" />
      </div>
      <div class="px-4">
        <div class="flex justify-between group px-2">
          <h3 class="text-xl font-semibold">Forms</h3>
          <FormOptions>
            <MenuItem v-slot="{ active }">
              <button class="px-1 py-1 rounded w-full text-left flex gap-2 items-center"
                @click="logout"
                :class='{ "bg-neutral-100": active }'>
                Log out
              </button>
            </MenuItem>
          </FormOptions>
        </div>
        <div class="space-y-1 py-4">
          <router-link v-for="form in forms" :to="`/edit/${form.id}`"
            class="group flex justify-between items-center block px-2 py-1 hover:bg-neutral-200 cursor-pointer rounded"
            :class="form.id === props.currentFormId ? 'bg-neutral-200' : ''">
            <div>{{ form.title || 'Untitled' }}</div>
            <FormOptions @deleteForm="deleteForm(form.id)" />
          </router-link>
          <div class="px-2 py-1 hover:bg-neutral-200 hover:text-neutral-900 cursor-pointer rounded flex justify-between text-neutral-400" @click="createForm">
            Create form
            <PlusIcon class="w-4" />
          </div>
        </div>
      </div>
    </div>
    <div class="px-4 py-4">
      <div class="text-neutral-700">
        <div class="border px-4 py-4 rounded-md text-sm flex flex-col gap-4 shadow bg-white">
          <div class="flex gap-2 font-semibold">
            <img src="@/assets/dashibase.svg" class="w-4" /> Check out Dashibase
          </div>
          Simplest way to set up an admin panel. Period.
          <a class="block bg-[#ff6069] font-medium rounded-md px-2 py-1 text-center text-white cursor-pointer hover:bg-[#ee6069]"
            href="https://dashibase.com">
            Sign up
          </a>
        </div>
      </div>
    </div>
    <Loading :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronLeftIcon, PlusIcon } from '@heroicons/vue/outline'
import { MenuItem } from '@headlessui/vue'
import { v4 as uuidv4 } from 'uuid'
import router from '@/router'
import { useStore } from '@/utils/store'
import { supabase } from '@/utils/supabase'
import FormOptions from './FormOptions.vue'
import Loading from '../Loading.vue'

const store = useStore()

const props = defineProps({
  currentFormId: {
    type: String,
    default: '',
  },
})

const forms = ref([] as { title:string, id:string, }[])

const loading = ref(false)

function createForm () {
  const formId = uuidv4()
  router.push(`/new/${formId}`)
}

async function getUserForms () {
  const { data, error } = await supabase.from(import.meta.env.VITE_TABLE_ID)
    .select()
    .eq('user', store.user.id)
    .not('table_id', 'is', null)
  if (error) console.error(error.message)
  else {
    forms.value = data.map(row => {
      return {
        title: row.title,
        id: row.id,
      }
    })
  }
}

async function logout () {
  loading.value = true
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  } else {
    router.push('/login')
  }
  loading.value = false
}

async function deleteForm(formId:string) {
  const { error } = await supabase.from(import.meta.env.VITE_TABLE_ID)
    .delete()
    .match({ id: formId })
  if (error) console.error(error)
  getUserForms()
  if (props.currentFormId === formId) {
    if (forms.value.length) {
      router.push(`/edit/${forms.value[0].id}`)
    } else {
      const formId = uuidv4()
      router.push(`/new/${formId}`)
    }
  }
}

getUserForms()

defineExpose({
  getUserForms
})
</script>