<template>
  <Listbox as="div" v-model="selected" class="inline-block">
    <div class="relative">
      <ListboxButton class="relative w-96 border shadow rounded py-1 text-left focus:outline-none focus:ring-0 px-2 mb-2">
        <div class="block truncate flex gap-2" :class="props.options.find(option => option.value === selected) ? '' : 'text-neutral-300 dark:text-neutral-600'">
          <img v-if="props.options.find(option => option.value === selected) && props.options.find(option => option.value === selected)?.img" :src="props.options.find(option => option.value === selected)?.img" class="w-5" />
          <span class="truncate">{{ selectedLabel }}</span>
        </div>
        <span class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
          <ChevronDownIcon class="h-5 w-5 text-neutral-400" aria-hidden="true" />
        </span>
      </ListboxButton>
      <transition enter-active-class="transition ease-in duration-150" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0" enter-from-class="opacity-0" enter-to-class="opacity-100">
        <ListboxOptions class="z-20 absolute pb-24 focus:outline-none pointer-events-none bg-transparent w-full">
        <div class="w-max max-w-xl min-w-full shadow-lg max-h-60 rounded py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none pointer-events-auto bg-white">
          <ListboxOption as="template" v-for="option, i in options" :key="i" :value="option.value" v-slot="{ active, selected }">
            <li :class="[active ? 'bg-neutral-100' : '', 'cursor-pointer select-none relative py-2 pl-2 pr-6 flex gap-2']">
              <img v-if="option.img" :src="option.img" class="w-5" />
              <span :class="['block truncate']">
                {{ option.label }}
              </span>
            </li>
          </ListboxOption>
          </div>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/outline'

interface Option {
  label: string;
  value: string | boolean | number;
  img?: string;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  modelValue: {
    type: [String, Boolean, Number],
    required: true,
  },
})

const emits = defineEmits(['update:modelValue'])

const selected = computed({
  get () {
    return props.modelValue
  },
  set (newValue:string | boolean | number) {
    emits('update:modelValue', newValue)
  }
})

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(option => option.value === selected.value)
  if (selectedOption) return selectedOption.label
  else return 'Select'
})
</script>