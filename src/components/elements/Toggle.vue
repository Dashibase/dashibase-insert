<template>
  <Switch v-model="selected" :disabled="disabled" :class="[selected ? 'bg-neutral-500' : 'bg-neutral-200', 'mt-1 disabled:cursor-default relative inline-flex flex-shrink-0 h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition focus:outline-none focus:ring-0']">
    <span aria-hidden="true" :class="[selected ? 'translate-x-5' : 'translate-x-0', 'bg-white border pointer-events-none inline-block h-6 w-6 rounded-full transition']" />
  </Switch>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@headlessui/vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  }
})

const emits = defineEmits(['update:modelValue'])

const selected = computed({
  get () {
    return props.modelValue
  },
  set (newValue:boolean) {
    emits('update:modelValue', newValue)
  }
})
</script>
