<template>
  <div class="w-full p-4 flex justify-between sticky top-0 bg-white z-20">
    <Tooltip value="Menu" @click="store.sidepanelIsOpen=true">
      <MenuIcon class="w-10 h-10 text-neutral-800 hover:bg-neutral-100 p-2 rounded-lg cursor-pointer" />
    </Tooltip>
    <div class="flex" v-if="!disableOptions">
      <Tooltip value="Embed" v-if="enableEmbed">
        <v-icon name="hi-code"
          class="w-10 h-10 text-neutral-800 hover:bg-neutral-100 p-2 rounded-lg cursor-pointer"
          @click="showPasswordMenu=false; showEmbedMenu=!showEmbedMenu"
          />
      </Tooltip>
      <Tooltip v-if="enableSetPassword" value="Set password">
        <v-icon v-if="!props.passwordHash" name="hi-solid-lock-open"
          class="w-10 h-10 text-neutral-800 hover:bg-neutral-100 p-2 rounded-lg cursor-pointer"
          @click="showEmbedMenu=false; showPasswordMenu=!showPasswordMenu" />
        <v-icon v-else name="hi-solid-lock-closed"
          class="w-10 h-10 text-neutral-800 hover:bg-neutral-100 p-2 rounded-lg cursor-pointer"
          @click="showEmbedMenu=false; showPasswordMenu=!showPasswordMenu" />
      </Tooltip>
      <Tooltip value="Publish">
        <v-icon name="fa-regular-paper-plane"
          class="w-10 h-10 text-neutral-800 hover:bg-neutral-100 p-2 rounded-lg cursor-pointer"
          @click="emit('publish')" />
        <div v-if="props.haveUnsavedChanges" class="h-2 w-2 rounded-full bg-[#ff6069] absolute right-2 bottom-2 pointer-events-none" />
      </Tooltip>
    </div>
  </div>
  <SetPassword :open="showPasswordMenu"
    :passwordHash="props.passwordHash"
    @updatePassword="value => emit('updatePassword', value)"
    @close="showPasswordMenu=false"
    @setLock="password => emit('setLock', password)"
    @removeLock="emit('removeLock')" />
  <SetEmbed :open="showEmbedMenu"
    :formId="props.formId"
    @close="showEmbedMenu=false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MenuIcon } from '@heroicons/vue/solid'
import { useStore } from '@/utils/store'
import Tooltip from '../elements/Tooltip.vue'
import SetPassword from './SetPassword.vue'
import SetEmbed from './SetEmbed.vue'

const enableEmbed = import.meta.env.VITE_HOSTED_BY_DASHIBASE === 'true' || false
const enableSetPassword = import.meta.env.VITE_ENABLE_PASSWORD === 'true' || false

const store = useStore()

const props = defineProps({
  disableOptions: {
    type: Boolean,
    default: false,
  },
  haveUnsavedChanges: {
    type: Boolean,
    default: false,
  },
  formId: {
    type: String,
    default: '',
  },
  passwordHash: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['publish', 'setLock', 'removeLock', 'updatePassword'])

const showPasswordMenu = ref(false)
const showEmbedMenu = ref(false)
</script>
