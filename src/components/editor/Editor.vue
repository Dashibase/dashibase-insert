<template>
  <Loading :loading="!store.schema" />
  <div id="editor" v-show="store.schema" class="max-w-prose mx-auto mt-[5.35rem] mb-96 list-group transition space-y-4">
    <h1 id="title" class="focus:outline-none focus-visible:outline-none text-5xl font-bold mb-12" contenteditable="true" spellcheck="false"
      :class="store.title ? '' : 'empty'"
      @blur="updateTitle($event)"
      @keydown.enter="$event.preventDefault(); appendBlock(-1);"
      @keydown.down="moveToBlocks"
      data-ph="Untitled">
      {{ store.title || '' }}
    </h1>
    <draggable id="blocks" tag="div" :list="store.blocks"
      v-bind="dragOptions" class="-ml-24 space-y-2 pb-4">
      <transition-group type="transition" name="flip-list">
        <div class="list-group-item relative group flex rounded-lg"
          v-for="block, i in store.blocks" :key="i">
          <Block
            :block="block" :i="i" :tableId="props.tableId"
            @moveToTitle="moveToTitle"
            @update="update"
            @updateLabel="updateLabel"
            @appendBlock="appendBlock"
            @deleteBlock="deleteBlock"
            @setBlockType="blockType => setBlockType(blockType, i)"
            @setAttribute="attribute => setAttribute(attribute, i)"
            @setBlockValue="value => setBlockValue(value, i)"
            />
        </div>
      </transition-group>
    </draggable>
    <button id="submitButton" class="bg-neutral-800 text-neutral-100 rounded shadow px-3 py-1 text-base font-semibold">Submit</button>
  </div>
</template>

<style>
#title.empty[contenteditable='true']:empty:before{
  content:attr(data-ph);
  color:#BBBBBB;
}

.button {
  margin-top: 35px;
}
/* .flip-list-move {
  transition: transform 0.5s;
} */
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 1;
  background: #F5F5F5;
}
.list-group {
  min-height: 20px;
}
</style>

<script setup lang="ts">
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { BlockType, formatToType, typeToInput } from '@/utils/types'
import { useStore } from '@/utils/store'
import Block from './Block.vue'
import Loading from '../Loading.vue'

const store = useStore()

const dragOptions = {
  animation: 150,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
}

const props = defineProps({
  formId: {
    type: String,
    required: true,
  },
  supabaseUrl: {
    type: String,
    required: true,
  },
  supabaseAnonKey: {
    type: String,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
})

document.addEventListener('click', (event:MouseEvent) => {
  // Automatically focus on nearest block on click
  const editor = document.getElementById('editor')
  const blocks = document.getElementById('blocks')
  const title = document.getElementById('title')
  const editorRect = editor?.getClientRects()[0]
  // Check that click is outside Editor
  if ((event.clientX < ((editorRect as DOMRect).left || -1)) || (event.clientX > (editorRect?.right || window.innerWidth))) {
    // Focus on title
    const titleRect = title?.getClientRects()[0]
    if (event.clientY > (titleRect?.top || window.innerHeight) && event.clientY < (titleRect?.bottom || 0)) {
      // Check if click is on left or right side
      const rect = title?.getClientRects()[0]
      let moveToStart = true
      if (event.x > (rect as DOMRect).right) moveToStart = false 
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(title as Node)
      range.collapse(moveToStart)
      selection?.removeAllRanges()
      selection?.addRange(range)
      return
    }
    // or nearest block
    const blockRects = Array.from(blocks?.children as HTMLCollection)
    const block = blockRects.find(child => {
      const rect = child.getClientRects()[0]
      return event.clientY > rect.top && event.clientY < rect.bottom
    })
    if (block) {
      // Check if click is on left or right side
      const rect = block.getClientRects()[0]
      let moveToStart = true
      if (event.x > rect.right) moveToStart = false 
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(block.lastElementChild?.lastElementChild?.lastElementChild as Node)
      range.collapse(moveToStart)
      selection?.removeAllRanges()
      selection?.addRange(range)
      return
    }
  }
  // If cursor is between Submit button and last block, insert block there 
  const lastBlockRect = blocks?.lastElementChild?.getClientRects()[0]
  const submitButtonRect = document.getElementById('submitButton')?.getClientRects()[0]
  if (!lastBlockRect) return
  if (!submitButtonRect) return
  if (event.clientX > (lastBlockRect as DOMRect).left && event.clientX < (lastBlockRect as DOMRect).right
    && event.clientY > (lastBlockRect as DOMRect).bottom && event.clientY < (submitButtonRect as DOMRect).top) {
      appendBlock(store.blocks.length-1)
    }
})

function moveToTitle () {
  const title = document.getElementById('title')
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(title as Node)
  range.collapse()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function moveToBlocks () {
  const blocks = document.getElementById('blocks')
  const selection = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(blocks?.firstElementChild?.lastElementChild?.lastElementChild?.lastElementChild as Node)
  range.collapse(true)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function update (value:any, i:number) {
  if (store.blocks[i].type === BlockType.Dropdown) {
    const options = value.split('\n').filter((i:string) => i)
    store.blocks[i].details.options = options
  } else if ([BlockType.Time, BlockType.Date, BlockType.Datetime].includes(store.blocks[i].type)) {
    store.blocks[i].details.value = ''
  } else {
    store.blocks[i].details.value = value
  }
}

function updateTitle (event:Event) {
  let newTitle = (event.target as HTMLDivElement).innerText
  if (newTitle === '\n') {
    newTitle = '';
    (event.target as HTMLElement).innerHTML = ''
  }
  store.title = newTitle
}

function updateLabel (value:string, i:number) {
  store.blocks[i].details.hasLabel = true
  store.blocks[i].details.label = value
}

function appendBlock (i:number) {
  // Append block and move cursor to new block
  store.blocks.splice(i + 1, 0, {
    type: BlockType.Text,
    details: {
      value: '',
    },
  })
  setTimeout(() => {
    const blocks = document.getElementById('blocks')
    const newBlock = blocks?.children[i+1].lastElementChild?.lastElementChild?.lastElementChild
    if (newBlock) (newBlock as HTMLInputElement).focus()
  }, 50)
}

function deleteBlock (i:number) {
  // Delete block and move cursor to previous block
  store.blocks.splice(i, 1)
  setTimeout(() => {
    if (i === 0) {
      moveToTitle()
    } else {
      const blocks = document.getElementById('blocks')
      const newBlock = blocks?.children[i-1].lastElementChild?.lastElementChild?.lastElementChild
      if (newBlock && newBlock.firstChild) setCaretPosition(newBlock as HTMLElement, (newBlock.firstChild as Text).length)
      else setCaretPosition((newBlock as HTMLElement), 0)
    }
  }, 50)
}

function setBlockType (blockType:BlockType, i:number) {
  store.blocks[i].type = blockType
  if ([BlockType.Text, BlockType.Divider].includes(blockType)) {
    store.blocks[i].details.hasLabel = false
  }
}

function setAttribute (attribute:string, i:number) {
  store.blocks[i].type = (typeToInput as {[k:string]:BlockType[]})[formatToType[store.schema.properties[attribute].format]][0]
  store.blocks[i].details = {
    attributeId: attribute,
    hasLabel: true,
    label: attribute.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
    value: store.blocks[i].details.value,
    required: store.schema.required.includes(attribute),
  }
  if (store.blocks[i].type === BlockType.Bool) {
    appendBlock(i)
    setTimeout(() => {
      const blocks = document.getElementById('blocks')
      const newBlock = blocks?.children[i+1].lastElementChild?.lastElementChild?.lastElementChild
      if (newBlock) (newBlock as HTMLInputElement).focus()
    }, 50)
  }
}

function setBlockValue (value:string, i:number) {
  store.blocks[i].details.value = value
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
</script>
