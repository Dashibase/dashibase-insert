<template>
  <div class="flex w-full hover:bg-neutral-50 cursor-pointer rounded" @click="focus"
    :class="{
      // Add top margin for headings
      'mt-12 group-first:mt-0': block.type === BlockType.H1,
      'mt-4 group-first:mt-0': block.type === BlockType.H2,
    }">
    <div class="h-full py-1.5 px-2 pl-4 text-center cursor-pointer transition-all duration-150 text-neutral-300 flex">
      <TrashIcon @click="emit('deleteBlock', i)"
        class="w-6 h-6 hover:bg-neutral-100 hover:text-neutral-400 p-0.5 rounded group-hover:opacity-100 opacity-0" />
      <PlusIcon @click="plusHelper($event, i)"
        class="w-6 h-6 hover:bg-neutral-100 hover:text-neutral-400 p-0.5 rounded group-hover:opacity-100 opacity-0" />
      <BlockMenu
        @closeMenu="menuIsOpen=false"
        @openMenu="menuIsOpen=true"
        @setBlockType="setBlockType"
        @setAttribute="setAttribute"
        @editLabel="editLabel"
        @toggleLabel="block.details.hasLabel = !block.details.hasLabel"
        @toggleRequired="block.details.required = !block.details.required"
        :block="block"
        :tableId="props.tableId"
        :open="menuIsOpen"
        :required="block.details.required" />
    </div>
    <div class="w-full relative">
      <!-- Label if any -->
      <div class="w-full flex">
        <div v-if="block.details.hasLabel" contenteditable spellcheck="false"
          ref="label"
          @click="$event.stopPropagation()"
          @blur="updateLabel($event, i)"
          class="focus:outline-none focus-visible:outline-none text-sm font-semibold py-1">
          {{ block.details.label || '' }}
        </div>
        <div v-if="block.details.hasLabel && block.details.required"
          class="focus:outline-none focus-visible:outline-none text-sm font-semibold py-1">
          &nbsp;*
        </div>
      </div>
      <!-- Hack to overlay input icons like Calendar -->
      <div class="absolute py-[0.55rem] h-9 w-full pointer-events-none"
        :class="{
          'px-2 max-w-sm text-neutral-400': [BlockType.Date, BlockType.Time, BlockType.Datetime, BlockType.Dropdown].includes(block.type),
          'px-2 w-12': block.type === BlockType.Bool,
        }">
        <CalendarIcon v-if="block.type === BlockType.Date" class="w-5 absolute right-2" />
        <ClockIcon v-else-if="block.type === BlockType.Time" class="w-5 absolute right-2" />
        <div v-else-if="block.type === BlockType.Datetime" class="absolute right-2 flex gap-1">
          <CalendarIcon class="w-5" />
          <ClockIcon class="w-5" />
        </div>
        <div v-else-if="block.type === BlockType.Bool" class="w-6 h-6 rounded-full border absolute top-1.5 left-0.5 bg-white" />
        <ChevronDownIcon v-else-if="block.type === BlockType.Dropdown" class="w-5 absolute right-2" />
      </div>
      <!-- Actual content -->
      <div ref="content"
        :id="`${id}-content`"
        :contenteditable="![BlockType.Divider, BlockType.Bool].includes(block.type)" spellcheck="false"
        @blur="update($event, i)"
        @keydown.enter="handleEnter"
        @keydown.backspace="handleBackspace"
        @keydown.left="handleMoveLeft"
        @keydown.right="handleMoveRight"
        @keydown.up="handleMoveUp"
        @keydown.down="handleMoveDown"
        @keyup="keyUpHandler"
        @keydown="keyDownHandler"
        class="focus:outline-none focus-visible:outline-none w-full"
        :class="{
          'py-1.5 ': block.type === BlockType.Text,
          'py-1.5 text-4xl font-semibold': block.type === BlockType.H1,
          'py-1.5 text-3xl font-medium': block.type === BlockType.H2,
          'py-0 h-[1px] bg-neutral-300 mt-[1.2rem]': block.type === BlockType.Divider,
          'py-1.5 border rounded shadow px-2 max-w-sm text-neutral-400 truncate focus:overflow-auto mb-2': block.type === BlockType.ShortAnswer,
          'py-1.5 border rounded shadow px-2 text-neutral-400 min-h-[6rem] mb-2': block.type === BlockType.LongAnswer,
          'py-1.5 border rounded shadow px-2 max-w-sm text-neutral-400 truncate focus:overflow-auto pr-8 mb-2': [BlockType.Date, BlockType.Time, BlockType.Datetime].includes(block.type),
          'py-1.5 mt-1 rounded-full px-2 w-12 h-7 mb-2 bg-neutral-200': block.type === BlockType.Bool,
          'py-1.5 border rounded shadow px-2 max-w-sm truncate mb-2 z-20 bg-white h-[2.1rem] focus:overflow-visible focus:h-auto flex flex-col gap-2': block.type === BlockType.Dropdown,
        }"
        :block-type="block.type"
        :data-ph="placeholder">
        {{ [BlockType.Divider, BlockType.Bool, BlockType.Dropdown].includes(block.type) ? '' : block.details.value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Placeholder text */
[contenteditable='true']:empty:focus:before{
  content:attr(data-ph);
  color:#BBBBBB;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, PropType, onMounted } from 'vue'
import { TrashIcon, PlusIcon, CalendarIcon, ClockIcon, ChevronDownIcon } from '@heroicons/vue/outline'
import { v4 as uuidv4 } from 'uuid'
import { Block, BlockType } from '@/utils/types'
import { useStore } from '@/utils/store'
import BlockMenu from './BlockMenu.vue'

const id = uuidv4()
const store = useStore()

const props = defineProps({
  block: {
    type: Object as PropType<Block>,
    default: '',
  },
  tableId: {
    type: String,
    default: '',
  },
  i: {
    type: Number,
    default: 0,
  }
})

const emit = defineEmits([
  'update',
  'updateLabel',
  'appendBlock',
  'deleteBlock',
  'setBlockType',
  'setAttribute',
  'setBlockValue',
  'moveToTitle',
])

const content = ref<any>(null)
const menuIsOpen = ref(false)

const placeholder = computed(() => {
  if (props.block.type === BlockType.Dropdown) return 'Enter each option on a new line'
  else if (props.block.type === BlockType.H1) return 'Heading 1'
  else if (props.block.type === BlockType.H2) return 'Heading 2'
  else if (props.block.type === BlockType.Text) return 'Type \'/\' for commands'
  else if ([BlockType.Divider, BlockType.Bool].includes(props.block.type)) return ''
  else if ([BlockType.ShortAnswer, BlockType.LongAnswer].includes(props.block.type)) return 'Add a placeholder'
  else return 'Type \'/\' for commands'
})

function focus () {
  if (content.value) content.value.focus()
}

const label = ref<any>(null)
function editLabel () {
  if (label.value) label.value.focus()
}

function update (event:Event, i:number) {
  if ([BlockType.Time, BlockType.Date, BlockType.Datetime].includes(props.block.type)) {
    (event.target as HTMLDivElement).innerText = ''
  } else {
    emit('update', (event.target as HTMLDivElement).innerText, i)
  }
}

function updateLabel (event:Event, i:number) {
  emit('updateLabel', (event.target as HTMLDivElement).innerText, i)
}

function appendBlock (event:Event, i:number) {
  event.preventDefault()
  emit('appendBlock', i)
}

function handleBackspace (event:Event) {
  const selection = window.getSelection()
  if (['\n', ''].includes((event.target as HTMLElement).innerText)) {
    // Handle heading cases
    if ([BlockType.H1, BlockType.H2].includes(props.block.type)) {
      emit('setBlockType', BlockType.Text)
      return
    }
    emit('deleteBlock', props.i)
  } else if (selection && selection.focusOffset === 0) {
    if (store.blocks[props.i-1].type === BlockType.Text) {
      const suffix = (event.target as HTMLElement).innerText
      const prevBlock = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.previousElementSibling
      const prevBlockLength = (prevBlock as HTMLElement).innerText.length
      emit('deleteBlock', props.i)
      emit('update', store.blocks[props.i-1].details.value + suffix, props.i-1)
      // Move cursor to appropriate position in previous block
      setTimeout(() => {
        setCaretPosition(prevBlock?.lastElementChild?.lastElementChild?.lastElementChild?.firstChild as HTMLElement, prevBlockLength)
      }, 100)
    }
  }
}

function handleEnter (event:Event) {
  if (menuIsOpen.value) return
  else if (props.block.type === BlockType.Dropdown) return
  else if (props.block.type === BlockType.Text) {
    event.preventDefault()
    const selection = window.getSelection()
    const nextBlock = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.nextElementSibling
    // Split value at cursor and create new block with new value
    emit('appendBlock', props.i)
    const caretPos = selection?.anchorOffset
    emit('update', (event.target as HTMLDivElement).innerText.slice(0, caretPos), props.i)
    emit('update', (event.target as HTMLDivElement).innerText.slice(caretPos), props.i + 1)
    setTimeout(() => {
      setCaretPosition(nextBlock?.lastElementChild?.lastElementChild?.lastElementChild?.firstChild as HTMLElement, 0)
    }, 100)
  }
  else appendBlock(event, props.i)
}

function handleMoveLeft (event:Event) {
  const selection = window.getSelection()
  if (selection?.focusOffset === 0) {
    event.preventDefault()
    let prevBlock = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.previousElementSibling
    while (prevBlock?.lastElementChild?.lastElementChild?.lastElementChild && [BlockType.Divider, BlockType.Bool].includes(prevBlock.lastElementChild?.lastElementChild?.lastElementChild?.getAttribute('block-type') as BlockType)) {
      prevBlock = prevBlock.previousElementSibling
      if (!prevBlock) break
    }
    if (prevBlock) {
      if (prevBlock.lastElementChild?.lastElementChild?.lastElementChild?.firstChild) {
        const caretPos = (prevBlock.lastElementChild?.lastElementChild?.lastElementChild?.firstChild as Text).length
        setCaretPosition(prevBlock.lastElementChild?.lastElementChild?.lastElementChild as HTMLElement, caretPos)
      } else {
        setCaretPosition(prevBlock.lastElementChild?.lastElementChild?.lastElementChild as HTMLElement, 0)
      }
    }
  }
}

function handleMoveRight (event:Event) {
  const selection = window.getSelection()
  if (['', '\n'].includes((event.target as HTMLElement).innerText) || !(event.target as HTMLElement).firstChild || selection?.focusOffset === ((event.target as HTMLElement).firstChild as Text).length) {
    event.preventDefault()
    let nextBlock = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.nextElementSibling
    while (nextBlock?.lastElementChild?.lastElementChild?.lastElementChild && nextBlock.lastElementChild?.lastElementChild?.lastElementChild?.getAttribute('block-type') === 'DIVIDER') {
      nextBlock = nextBlock.nextElementSibling
      if (!nextBlock) break
    }
    if (nextBlock) {
      setCaretPosition(nextBlock.lastElementChild?.lastElementChild?.lastElementChild as HTMLElement, 0)
    }
  }
}

function handleMoveUp (event:Event) {
  event.preventDefault()
  // If menu is open, up/down should control menu
  if (menuIsOpen.value) return
  // Handle dropdown
  if (props.block.type === BlockType.Dropdown) {
    const prevOption = window.getSelection()?.getRangeAt(0).commonAncestorContainer.parentElement?.previousElementSibling
    if (prevOption) {
      const parentType = prevOption?.parentElement?.attributes.getNamedItem('block-type')
      if (parentType && parentType.nodeValue === BlockType.Dropdown) setCaretPosition(prevOption as HTMLElement, 0)
      else moveToPrevBlock(event)
    }
    else {
      moveToPrevBlock(event)
    }
    return
  }
  const selection = window.getSelection()
  const prevCoord = getCaretCoordinates()
  let prevDist = 99999
  let caretPos = selection?.focusOffset as number
  while (true) {
    if (caretPos <= 0) {
      moveToPrevBlock(event, prevCoord)
      break
    }
    setCaretPosition(event.target as HTMLElement, caretPos)
    const newCoord = getCaretCoordinates()
    const newDist = Math.abs(newCoord.x - prevCoord.x)
    if (newCoord.y === prevCoord.y) {
      caretPos -= 1
    } else {
      if (newDist > prevDist && newCoord.y < prevCoord.y) {
        if (caretPos > 0) setCaretPosition(event.target as HTMLElement, caretPos - 1)
        break
      }
      prevDist = newDist
      caretPos -= 1
    }
  }
}

function handleMoveDown (event:Event) {
  event.preventDefault()
  // If menu is open, up/down should control menu
  if (menuIsOpen.value) return
  // Handle dropdown
  if (props.block.type === BlockType.Dropdown) {
    const nextOption = window.getSelection()?.getRangeAt(0).commonAncestorContainer.parentElement?.nextElementSibling
    if (nextOption) setCaretPosition(nextOption as HTMLElement, 0)
    else moveToNextBlock(event)
    return
  }
  if (['', '\n'].includes((event.target as HTMLElement).innerText) || !(event.target as HTMLElement).firstChild) {
    moveToNextBlock(event)
    return
  }
  const selection = window.getSelection()
  const prevCoord = getCaretCoordinates()
  let prevDist = 99999
  let caretPos = selection?.focusOffset as number
  while (true) {
    if (caretPos > ((event.target as HTMLElement).firstChild as Text).length) {
      moveToNextBlock(event, prevCoord)
      break
    }
    setCaretPosition(event.target as HTMLElement, caretPos)
    const newCoord = getCaretCoordinates()
    const newDist = Math.abs(newCoord.x - prevCoord.x)
    if (newCoord.y === prevCoord.y) {
      caretPos += 1
    } else {
      if (newDist > prevDist && newCoord.y > prevCoord.y) {
        if (caretPos > 0) setCaretPosition(event.target as HTMLElement, caretPos - 1)
        break
      }
      prevDist = newDist
      caretPos += 1
    }
  }
}

function moveToPrevBlock (event:Event, prevCoord:any=null) {
  let prevBlock = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.previousElementSibling
  while (true) {
    if (!prevBlock) {
      emit('moveToTitle')
      return
    }
    const prevBlockType = prevBlock.lastElementChild?.lastElementChild?.lastElementChild?.attributes.getNamedItem('block-type')
    if (!prevBlockType || (![BlockType.Divider, BlockType.Bool].includes(prevBlockType.nodeValue as BlockType))) break
    prevBlock = prevBlock.previousElementSibling
  }
  if (!prevCoord) prevCoord = getCaretCoordinates()
  let prevDist = 99999
  let caretPos = 0
  let prevBlockText = prevBlock.lastElementChild?.lastElementChild?.lastElementChild
  if (prevBlockText?.firstChild) {
    caretPos = (prevBlockText.firstChild as Text).length || 0
    prevBlockText = prevBlockText.firstChild as Element
  }
  while (true) {
    if (caretPos < 0) break
    setCaretPosition(prevBlockText as HTMLElement, caretPos)
    const newCoord = getCaretCoordinates()
    const newDist = Math.abs(newCoord.x - prevCoord.x)
    if (newDist > prevDist) {
      if (caretPos > 0) setCaretPosition(prevBlockText as HTMLElement, caretPos - 1)
      break
    }
    prevDist = newDist
    caretPos -= 1
  }
}

function moveToNextBlock (event:Event, prevCoord:any=null) {
  let nextBlock = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.nextElementSibling
  while (true) {
    if (!nextBlock) return
    const nextBlockType = nextBlock.lastElementChild?.lastElementChild?.lastElementChild?.attributes.getNamedItem('block-type')
    if (!nextBlockType || (![BlockType.Divider, BlockType.Bool].includes(nextBlockType.nodeValue as BlockType))) break
    nextBlock = nextBlock.nextElementSibling
  }
  if (!prevCoord) prevCoord = getCaretCoordinates()
  let prevDist = 99999
  let caretPos = 0
  let nextBlockText = nextBlock.lastElementChild?.lastElementChild?.lastElementChild
  // Handle case where next block is a dropdown
  if (nextBlockText) {
    const nextBlockType = nextBlockText.attributes.getNamedItem('block-type')
    if (nextBlockType && nextBlockType.nodeValue === BlockType.Dropdown && nextBlockText.firstElementChild) nextBlockText = nextBlockText.firstElementChild
  }
  while (true) {
    if (nextBlockText?.firstChild && !(nextBlockText.firstChild as Text).length && caretPos > 0) break
    else if (!nextBlockText?.firstChild && caretPos > 0) break
    setCaretPosition(nextBlockText as HTMLElement, caretPos)
    const newCoord = getCaretCoordinates()
    const newDist = Math.abs(newCoord.x - prevCoord.x)
    if (newDist > prevDist) {
      if (caretPos > 0) setCaretPosition(nextBlockText as HTMLElement, caretPos - 1)
      break
    }
    prevDist = newDist
    caretPos += 1
    if (nextBlockText?.firstChild && caretPos > (nextBlockText?.firstChild as Text).length) break
    if (caretPos > 999) break // Hack to fix hanging
  }
}

function getCaretCoordinates() {
  let x = 0,
    y = 0
  const isSupported = typeof window.getSelection !== "undefined"
  if (isSupported) {
    const selection = window.getSelection()
    if (!selection) return { x, y }
    if (selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0).cloneRange()
      range.collapse(true);
      const rect = range.getClientRects()[0]
      if (rect) {
        x = rect.left
        y = rect.top
      }
    }
  }
  return { x, y }
}

function setCaretPosition(elem:HTMLElement|ChildNode, caretPos:number) {
  var range, selection;
  if (window.getSelection) {
    selection = window.getSelection()
    range = document.createRange()
    if (elem.firstChild) elem = elem.firstChild
    if (!(elem as Text).length && caretPos > 0) return
    range.setStart(elem, caretPos)
    range.setEnd(elem, caretPos)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

function plusHelper (event:Event, i:number) {
  emit('appendBlock', i)
  setTimeout(() => {
    const a = (event.target as HTMLElement).parentElement?.parentElement?.parentElement?.nextElementSibling?.lastElementChild?.lastElementChild?.lastElementChild
    if (a) (a as HTMLInputElement).focus()
  }, 0)
}

function keyDownHandler (event:KeyboardEvent) {
  if (event.key === 'Backspace' && (event.target as HTMLElement).innerText.endsWith('/')) menuIsOpen.value = false
}

function keyUpHandler (event:KeyboardEvent) {
  if (event.key === '/') {
    menuIsOpen.value = true
  } else if ((event.target as HTMLElement).innerText === '---') {
    emit('setBlockType', BlockType.Divider)
    emit('setBlockValue', '');
    (event.target as HTMLElement).innerText = ''
    emit('appendBlock', props.i)
    setTimeout(() => {
      const a = (content.value as HTMLElement).parentElement?.parentElement?.parentElement?.nextElementSibling?.lastElementChild?.lastElementChild?.lastElementChild
      if (a) (a as HTMLInputElement).focus()
    }, 0)
  } else if ((event.target as HTMLElement).innerText.match(/^#\s$/) && event.key === ' ') {
    emit('setBlockType', BlockType.H1)
    emit('setBlockValue', '');
    (event.target as HTMLElement).innerText = ''
  } else if ((event.target as HTMLElement).innerText.match(/^##\s$/) && event.key === ' ') {
    emit('setBlockType', BlockType.H2)
    emit('setBlockValue', '');
    (event.target as HTMLElement).innerText = ''
  }
}

async function setBlockType (blockType:BlockType) {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0 && ![BlockType.Divider, BlockType.Bool].includes(blockType)) {
    // Preserve cursor, otherwise it moves to the end
    const range = selection?.getRangeAt(0) as Range
    const command = content.value.innerText.split('/').slice(-1)[0]
    const startOffset = range.startOffset - command.length - 1
    const endOffset = range.endOffset - command.length - 1
    emit('setBlockType', blockType)
    content.value.innerText = content.value.innerText.split('/')[0]
    const startContainer = range.startContainer.lastChild as Node || range.startContainer
    const endContainer = range.endContainer.lastChild as Node || range.endContainer
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    selection.removeAllRanges()
    selection.addRange(range as Range)
  } else if ([BlockType.Divider, BlockType.Bool].includes(blockType)) {
    // If it's a Divider or Bool, automatically create an empty block after that so users can stay on the keyboard
    content.value.innerText = ''
    emit('setBlockType', blockType)
    emit('appendBlock', props.i)
    setTimeout(() => {
      const a = (content.value as HTMLElement).parentElement?.parentElement?.parentElement?.nextElementSibling?.lastElementChild?.lastElementChild?.lastElementChild
      if (a) (a as HTMLInputElement).focus()
    }, 0)
  } else if (props.block.type === BlockType.Dropdown && blockType !== BlockType.Dropdown) {
    content.value.innerText = ''
    emit('setBlockType', blockType)
  } else {
    emit('setBlockType', blockType)
  }
}

function setAttribute (attribute:string) {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    // Preserve cursor position, otherwise it moves to the end
    const range = selection?.getRangeAt(0) as Range
    const command = content.value.innerText.split('/').slice(-1)[0]
    const startOffset = range.startOffset - command.length - 1
    const endOffset = range.endOffset - command.length - 1
    emit('setAttribute', attribute)
    content.value.innerText = content.value.innerText.split('/')[0]
    const startContainer = range.startContainer.lastChild as Node || range.startContainer
    const endContainer = range.endContainer.lastChild as Node || range.endContainer
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    selection.removeAllRanges()
    selection.addRange(range as Range)
  } else {
    emit('setAttribute', attribute)
  }
}

const currentBlock = ref(props.block)
watch(props, (newProps) => {
  if (currentBlock.value.type === BlockType.Dropdown) {
    // If previous blocktype is Dropdown, clear innerHTML of content, otherwise it stays there
    content.value.innerHTML = ''
  }
  if (newProps.block.type === BlockType.Dropdown) {
    // For Dropdowns, append dropdown options
    setTimeout(() => {
      const contentDiv = document.getElementById(`${id}-content`)
      if (contentDiv) {
        contentDiv.innerHTML = ''
        if (newProps.block.details.options) newProps.block.details.options?.forEach(option => {
          const node = document.createElement("div")
          node.innerText = option
          contentDiv.appendChild(node)
        })
      }
    }, 10)
  }
  currentBlock.value = newProps.block
})

onMounted(() => {
  if (props.block.type === BlockType.Dropdown) {
    // For Dropdowns, append dropdown options
    if (content.value) {
      props.block.details.options?.forEach(option => {
        const node = document.createElement("div")
        node.innerText = option
        content.value.appendChild(node)
      })
    }
  }
})
</script>
