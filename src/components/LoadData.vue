<template>
<!-- Component used to asynchronously run database queries on every page navigation -->
</template>

<script setup lang="ts">
import { User } from '@supabase/supabase-js'
import { useRoute } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/utils/supabase'
import { useStore } from '@/utils/store'
import router from '@/router'

const store = useStore()
const route = useRoute()

const user = supabase.auth.user()
if (user) store.user = user
supabase.auth.onAuthStateChange((_, session) => {
  store.user = session?.user as User
})

setTimeout(() => {
  if (route.path.includes('/f/')) {
  } else if (!store.user || !store.user.id) {
    if (!['/login', '/signup'].includes(route.path)) router.push('/login')
  } else if (route.path === '/') {
    getUserForms()
  }
}, 100)

async function getUserForms () {
  const { data, error } = await supabase.from(import.meta.env.VITE_TABLE_ID)
    .select()
    .eq('user', store.user.id)
  if (error) console.error(error.message)
  else {
    if (data.length) {
      router.push(`/edit/${data[0].id}`)
    } else {
      const formId = uuidv4()
      router.push(`/new/${formId}`)
    }
  }
}
</script>
