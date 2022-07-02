<template>
  <Menu as="div" class="relative flex" v-slot="{ open }">
    <MenuButton>
      <slot name="button">
        <DotsHorizontalIcon class="-mr-1 w-6 p-1 rounded text-neutral-600 opacity-0 group-hover:opacity-100 hover:bg-neutral-300"
          :class="open ? 'opacity-100 bg-neutral-300' : ''" />
      </slot>
    </MenuButton>
    <MenuItems class="absolute top-full left-0 bg-white z-10 px-2 py-2 shadow rounded text-sm w-36 text-neutral-700">
      <slot>
        <MenuItem v-for="option in options" v-slot="{ active }">
          <button class="px-1 py-1 rounded w-full text-left flex gap-2 items-center"
            @click="option.callback"
            :class='{ "bg-neutral-100": active }'>
            <component :is="option.icon" class="h-4 w-4 text-neutral-500" aria-hidden="true" />
            {{ option.label }}
          </button>
        </MenuItem>
      </slot>
    </MenuItems>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { DotsHorizontalIcon, TrashIcon } from '@heroicons/vue/outline'

const emit = defineEmits(['deleteForm'])

const options = [
  {
    icon: TrashIcon,
    label: 'Delete',
    callback: (event:Event) => deleteForm(event)
  }, 
]

async function deleteForm(event:Event) {
  event.preventDefault()
  emit('deleteForm')
}
</script>
