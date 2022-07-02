<template>
  <div id="set-password" class="fixed top-28 right-4 max-w-sm border rounded shadow bg-white transition z-10 text-neutral-800 text-sm"
    :class="props.open ? '' : 'translate-x-full right-0'"
    @click="$event.stopPropagation()">
    <XIcon class="w-4 absolute top-2 right-2 cursor-pointer" @click="emit('close')" />
    <div class="space-y-4 p-6">
      <div class="font-semibold text-xl">
        Password
      </div>
      <div>
        Add a password to secure your form.  
      </div>
      <div class="max-w-sm items-center gap-2 relative">
        <input v-model="password" :type="showPassword ? 'text' : 'password'" class="border rounded shadow px-2 py-1 pr-8 text-gray-700 truncate focus:overflow-auto" />
        <EyeOffIcon v-if="!showPassword" class="w-7 text-neutral-700 absolute right-1 top-1 hover:bg-neutral-100 rounded p-1 cursor-pointer" @click="showPassword=true" />
        <EyeIcon v-if="showPassword" class="w-7 text-neutral-700 absolute right-1 top-1 hover:bg-neutral-100 rounded p-1 cursor-pointer" @click="showPassword=false" />
      </div>
      <div class="flex gap-2 justify-end py-1">
        <button class="px-4 py-1 bg-white rounded text-neutral-900 font-semibold" @click="emit('removeLock'); emit('close');">Remove</button>
        <button :disabled="!password" class="px-4 py-1 bg-neutral-900 rounded text-white font-semibold disabled:bg-neutral-300"
          @click="emit('setLock', password); emit('close'); password='';">
          {{ passwordHash ? 'Update' : 'Lock' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { XIcon, EyeIcon, EyeOffIcon } from '@heroicons/vue/outline'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  passwordHash: {
    type: String,
    default: '',
  },
})

const password = ref('')

const emit = defineEmits(['close', 'updatePassword', 'setLock', 'removeLock'])

const showPassword = ref(false)
</script>
