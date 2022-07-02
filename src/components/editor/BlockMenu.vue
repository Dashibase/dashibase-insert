<template>
  <div :id="id" as="div" class="relative w-max h-max" ref="container">
    <div @click="props.open ? emit('closeMenu') : emit('openMenu')">
      <v-icon name="md-dragindicator" @mousedown="$event.stopPropagation()"
        class="w-6 h-6 hover:bg-neutral-100 hover:text-neutral-400 p-0.5 rounded group-hover:opacity-100 opacity-0"
        :class="props.open ? 'opacity-100' : ''" />
    </div>
    <div v-show="props.open">
      <div static
        :id="`${id}-menu`"
        class="w-[10rem] lg:w-[12rem] xl:w-[16rem] absolute z-10 shadow-block rounded py-1 text-neutral-700 text-sm right-full bg-white max-h-[24rem] overflow-auto focus-visible:outline-none top-0"
        :style="{transform: `translateX(${translateX}px)`}">
        <div class="text-left divide-y">
          <!-- Linked to (column ID if this is an input) -->
          <div v-if="block.details.attributeId" class="px-2 py-2 w-full">
            <div class="px-2 pb-2 font-semibold uppercase text-xs text-neutral-400">Linked to</div>
            <div class="px-2 py-1 truncate">
              {{ props.tableId ? props.tableId + '.' : '' }}{{ block.details.attributeId }}
            </div>
          </div>
          <!-- Search term -->
          <div v-if="searchTerm" class="px-2 py-2 flex gap-2 w-full">
            <SearchIcon class="w-4 shrink-0" />
            <div class="truncate">
              {{ searchTerm }}
            </div>
          </div>
          <!-- Settings like "Required" or "Show label" -->
          <div class="px-2 py-2" v-if="options.filter(option => option.type === 'Settings').length">
            <div class="px-2 pb-2 font-semibold uppercase text-xs text-neutral-400">Settings</div>
            <div v-for="option, i in options.filter(option => option.type === 'Settings')"
              :id="`${id}-option-${i}`"
              class="px-2 py-1 rounded flex justify-between items-center"
              :class="[active === i ? 'bg-neutral-100' : '']"
              @click="$event => { $event.stopPropagation(); if (option.callback) option.callback();}"
              @mouseover="active = i">
              <span class="truncate">{{ option.label }}</span>
              <div v-if="option.label === 'Show label'">
                <v-icon v-if="block.details.hasLabel" name="la-toggle-on-solid" class="w-5 h-5" />
                <v-icon v-else name="la-toggle-off-solid" class="w-5 h-5" />
              </div>
              <div v-else-if="option.label === 'Required'">
                <v-icon v-if="block.details.required" name="la-toggle-on-solid" class="w-5 h-5" />
                <v-icon v-else name="la-toggle-off-solid" class="w-5 h-5" />
              </div>
            </div>
          </div>
          <!-- Turn into (another input block)  -->
          <div class="px-2 py-2" v-if="options.filter(option => option.type === 'Turn into input').length">
            <div class="px-2 pb-2 font-semibold uppercase text-xs text-neutral-400">Turn into</div>
            <div v-for="option, i in options.filter(option => option.type === 'Turn into input')"
              :id="`${id}-option-${i + options.filter(option => option.type === 'Settings').length}`"
              class="px-2 py-1 rounded flex items-center gap-2"
              :class="[active === (i + options.filter(option => option.type === 'Settings').length) ? 'bg-neutral-100' : '']"
              @click="option.callback"
              @mouseover="active = (i + options.filter(option => option.type === 'Settings').length)">
              <v-icon v-if="option.icon"
                :name="option.icon" class="w-5 h-5"/>
              <span class="truncate">{{ option.label }}</span>
            </div>
          </div>
          <!-- "Link column" or "Change linked column"  -->
          <div class="px-2 py-2" v-if="options.filter(option => option.type === 'Link column').length">
            <div class="px-2 pb-2 font-semibold uppercase text-xs text-neutral-400">{{ props.block.details.attributeId ? 'Change linked column' : 'Link column' }}</div>
            <div v-for="option, i in options.filter(option => option.type === 'Link column')"
              :id="`${id}-option-${i + options.filter(option => ['Settings', 'Turn into input'].includes(option.type)).length}`"
              class="px-2 py-1 rounded flex items-center gap-2"
              :class="[active === (i + options.filter(option => ['Settings', 'Turn into input'].includes(option.type)).length) ? 'bg-neutral-100' : '']"
              @click="option.callback"
              @mouseover="active = (i + options.filter(option => ['Settings', 'Turn into input'].includes(option.type)).length)">
              <v-icon v-if="option.icon"
                :name="option.icon" class="w-5 h-5"/>
              <span class="truncate">{{ option.label }}</span>
            </div>
          </div>
          <!-- Turn into (another read-only block like Text, Heading or Divider) -->
          <div class="px-2 py-2" v-if="options.filter(option => option.type === 'Turn into').length">
            <div class="px-2 pb-2 font-semibold uppercase text-xs text-neutral-400">Turn into</div>
            <div v-for="option, i in options.filter(option => option.type === 'Turn into')"
              :id="`${id}-option-${i + options.filter(option => option.type !== 'Turn into').length}`"
              class="px-2 py-1 rounded flex items-center gap-2"
              :class="[active === (i + options.filter(option => option.type !== 'Turn into').length) ? 'bg-neutral-100' : '']"
              @click="option.callback"
              @mouseover="active = (i + options.filter(option => option.type !== 'Turn into').length)">
              <v-icon v-if="option.icon"
                :name="option.icon" class="w-5 h-5"/>
              <span class="truncate">{{ option.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, PropType } from 'vue'
import { SearchIcon } from '@heroicons/vue/solid'
import { v4 as uuidv4 } from 'uuid'
import { 
  Block,
  BlockType,
  Option,
  formatToType,
  typeToIcon,
  typeToInput,
} from '@/utils/types'
import { useStore } from '@/utils/store'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  tableId: {
    type: String,
    default: '',
  },
  block: {
    type: Object as PropType<Block>,
    required: true,
  },
  // If required, don't allow switching of attributes
  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'closeMenu',
  'openMenu',
  'setBlockType',
  'setAttribute',
  'editLabel',
  'toggleLabel',
  'toggleRequired',
])

const id = uuidv4()
const store = useStore()

document.addEventListener('click', (event:Event) => {
  // Close menu on click outside of menu
  if (!props.open) return
  const menu = document.getElementById(id)
  if (!(menu && menu.contains(event.target as Node))) {
    emit('closeMenu')
  }
})

/*
Support keyboard navigation
*/
const active = ref(0)
const searchTerm = ref('')
document.addEventListener('keydown', (event:KeyboardEvent) => {
  if (!props.open) return
  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    // Support up/down navigation with keyboard
    if (event.key === 'ArrowUp') {
      // Move up
      active.value = Math.max(active.value - 1, 0)
    } else {
      //  Move down
      active.value = Math.min(active.value + 1, options.value.length - 1)
    }
    const option = document.getElementById(`${id}-option-${active.value}`)
    option?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    // Left/right will exit menu
    if (searchTerm.value.length === 0) emit('closeMenu')
  } else if (event.key === 'Enter') {
    // Enter selects menu option
    event.preventDefault()
    const callback = options.value[active.value].callback
    if (callback) callback()
    // Don't close menu for Settings like toggling "Show label" or "Required"
    if (options.value[active.value].type !== 'Settings') emit('closeMenu')
    else if (options.value[active.value].label === 'Edit label') emit('closeMenu')
  } else if (event.key === 'Escape') {
    // Escape closes menu
    emit('closeMenu')
  } else if (event.key.match(/^([a-zA-Z]|[0-9])$/)) {
    // Alphanumeric searches menu
    searchTerm.value += event.key
  } else if (event.key === 'Backspace') {
    // Backspace closes menu if searchTerm is empty
    if (searchTerm.value.length === 0) emit('closeMenu')
    else searchTerm.value = searchTerm.value.slice(0, -1)
  }
})

/*
Translate menu horizontally if it overflows to the left
*/
const translateX = ref(0)
window.addEventListener('resize', () => {
  const menuElement = document.getElementById(`${id}-menu`)
  if (!menuElement) return
  const rect = menuElement.getClientRects()[0] as DOMRect
  if (!rect) return
  translateX.value = Math.max(0, translateX.value - rect.x)
})
watch(props, newProps => {
  if (newProps.open) {
    setTimeout(() => {
      document.getElementById(`${id}-menu`)?.scroll(0, 0)
      const rect = document.getElementById(`${id}-menu`)?.getClientRects()[0] as DOMRect
      translateX.value = Math.max(0, translateX.value - rect.x)
    }, 0)
  } else {
    active.value = 0
    searchTerm.value = ''
  }
})

/*
Menu options
*/

const options = computed(() => {
  const options = [] as Option[]
  // Settings like "Show label" or "Required"
  if (props.block.details.attributeId) {
    // TODO add "Edit label"
    // if (props.block.details.hasLabel) {
    //   options.push({
    //     type: 'Settings',
    //     label: 'Edit label',
    //     callback: () => emit('editLabel'),
    //   })
    // }
    options.push({
      type: 'Settings',
      label: 'Show label',
      callback: () => emit('toggleLabel')
    })
    options.push({
      type: 'Settings',
      label: 'Required',
      callback: () => emit('toggleRequired')
    })
  }
  // Turn into (another input block)
  let turnIntoInput = [] as Option[]
  if (store.schema && props.block.details.attributeId) {
    const format = (store.schema.properties as {[k:string]: { format:string }})[props.block.details.attributeId as string].format
    turnIntoInput = (typeToInput as {[k:string]: BlockType[]})[(formatToType as {[k:string]: string})[format]]
      .map(blockType => {
        return (blockTypeToOption as {[k:string]: Option})[blockType as string]
      })
  }
  // "Link column" or "Change linked column"
  const tableAttributes = store.schema ? Object.keys(store.schema.properties) : []
  const availableAttributes = tableAttributes
    .filter(attr => !store.blocks.map(block => block.details.attributeId).includes(attr))
  let linkColumns = [] as Option[]
  if (!props.block.details.required) {
    linkColumns = availableAttributes.map(attr => {
      const format = (store.schema.properties as {[k:string]: { format:string }})[attr].format
      return {
        icon: (typeToIcon as {[k:string]: string})[(formatToType as {[k:string]: string})[format]],
        type: 'Link column',
        label: attr,
        callback: () => setAttribute(attr)
      }
    })
  }
  // Turn into (another read-only block like Text, Heading or Divider)
  let turnInto = [] as Option[]
  if (!props.block.details.required && !props.block.details.attributeId) {
    turnInto = [
      {
        type: 'Turn into',
        icon: 'bi-text-left',
        label: 'Text',
        callback: () => setBlockType(BlockType.Text),
      }, {
        type: 'Turn into',
        icon: 'bi-type-h1',
        label: 'Heading 1',
        callback: () => setBlockType(BlockType.H1),
      }, {
        type: 'Turn into',
        icon: 'bi-type-h2',
        label: 'Heading 2',
        callback: () => setBlockType(BlockType.H2),
      }, {
        type: 'Turn into',
        icon: 'bi-hr',
        label: 'Divider',
        callback: () => setBlockType(BlockType.Divider),
      },
    ]
  }
  // Concat all options
  return options.concat(turnIntoInput).concat(linkColumns).concat(turnInto)
    .filter(option => option.label.toLowerCase().startsWith(searchTerm.value))
})

// List of input block types
const blockTypeToOption = {
  'SHORT_ANSWER': {
    type: 'Turn into input',
    icon: 'md-shorttext',
    label: 'Short answer',
    callback: () => setBlockType(BlockType.ShortAnswer),
  },
  'LONG_ANSWER': {
    type: 'Turn into input',
    icon: 'md-subject',
    label: 'Long answer',
    callback: () => setBlockType(BlockType.LongAnswer),
  },
  'DATE': {
    type: 'Turn into input',
    icon: 'hi-calendar',
    label: 'Date',
    callback: () => setBlockType(BlockType.Date),
  },
  'TIME': {
    type: 'Turn into input',
    icon: 'md-accesstime',
    label: 'Time',
    callback: () => setBlockType(BlockType.Time),
  },
  'DATETIME': {
    type: 'Turn into input',
    icon: 'md-accesstime',
    label: 'Date & time',
    callback: () => setBlockType(BlockType.Datetime),
  },
  'BOOL': {
    type: 'Turn into input',
    icon: 'ri-toggle-line',
    label: 'Bool',
    callback: () => setBlockType(BlockType.Bool),
  },
  'DROPDOWN': {
    type: 'Turn into input',
    icon: 'md-arrowdropdown',
    label: 'Dropdown',
    callback: () => setBlockType(BlockType.Dropdown),
  },
}

function setBlockType (blockType:BlockType) {
  emit('setBlockType', blockType)
  emit('closeMenu')
}

function setAttribute (attribute:string) {
  emit('setAttribute', attribute)
  emit('closeMenu')
}
</script>