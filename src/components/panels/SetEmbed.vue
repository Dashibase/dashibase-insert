<template>
  <div id="set-embed" class="fixed top-28 right-4 max-w-sm border rounded shadow bg-white transition z-10 text-neutral-800 text-sm"
    :class="props.open ? '' : 'translate-x-full right-0'"
    @click="$event.stopPropagation()">
    <XIcon class="w-4 absolute top-2 right-2 cursor-pointer" @click="emit('close')" />
    <div class="space-y-4 p-6">
      <div class="font-semibold text-xl">
        Embed
      </div>
      <div>
        Paste these two lines of code in the <span class="font-mono">&lt;body></span>, where you want your form to appear.
      </div>
      <div class="overflow-x-auto">
        <div class="font-mono whitespace-nowrap bg-neutral-50 p-4 rounded text-black w-max">
          &lt;div id="dashibase-insert" style="width: 100%; height: 800px; margin: auto;" />
          <br/>
          &lt;script src="https://embed.dashibase.com/insert/embed.js" dashibase-key="{{ formId }}"{{ auth ? ' auth="true"' : ''}} />
        </div>
      </div>
      <div class="text-neutral-600">
        If you are embedding this on a logged-in page, the form will be submitted with the user's ID and will work with your RLS policy.
      </div>
      <div class="flex justify-end">
        <button class="px-4 py-1 bg-neutral-900 rounded text-white font-semibold disabled:bg-neutral-300"
          @click="copy">
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { XIcon } from '@heroicons/vue/outline'
import { copyToClipboard } from '@/utils/utils'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  formId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const copied = ref(false)
const auth = ref(false)

function copy () {
  copyToClipboard(`<div id="dashibase-insert" style="width: 800px; height: 800px; margin: auto;" />
<script src="https://embed.dashibase.com/insert/embed.js" dashibase-key="${props.formId}" />`)
  copied.value = true
  setTimeout(() => copied.value = false, 1000)
}
</script>
