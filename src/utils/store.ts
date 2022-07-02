import { ref } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@supabase/supabase-js'
import { Block } from '@/utils/types'

const latestVersion = '0.0.1'

export const useStore = defineStore(
  'main',
  () => {
    const version = ref(latestVersion)
    const schema = ref<any>(null)
    const title = ref('My form')
    const blocks = ref([] as Block[])
    const buttonLabel = ref('Submit')
    const user = ref({} as User)
    const sidepanelIsOpen = ref(false)
    return {
      version,
      schema,
      title,
      blocks,
      buttonLabel,
      user,
      sidepanelIsOpen
    }
  }, {
    persist: {
      // Remember whether user has sidepanel open
      paths: ['sidepanelIsOpen'],
    }
  }
)
