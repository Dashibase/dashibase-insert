<template>
  <TransitionRoot as="template" :show="props.loading">
    <Dialog as="div" class="fixed z-50 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-neutral-50 bg-opacity-75 transition-opacity" />
        </TransitionChild>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&nbsp;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="relative inline-block align-bottom bg-transparent rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div class="flex items-center justify-center">
              <img :src="Logo" class="w-14 animate-metronome" />
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>
.animate-metronome {
  animation: metronome 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes metronome {
  0% {
    transform: translateX(-35%) rotate(0deg);
  }
  50% {
    transform: translateX(35%) rotate(90deg);
  }
  100% {
    transform: translateX(-35%) rotate(0deg);
  }
}
</style>

<script setup lang="ts">
import { Dialog, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'
import Logo from '@/assets/dashibase.svg'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  }
})
</script>