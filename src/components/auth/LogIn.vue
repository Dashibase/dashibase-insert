<template>
  <div class="h-screen min-h-full grid lg:grid-cols-2 bg-white text-[#454545]">
    <div class="flex flex-col justify-center items-center">
      <div class="w-96 max-w-xl">
        <div class="flex gap-2 transition duration-1000 items-center">
          <img src="@/assets/dashibase.svg" class="w-8" />
          <h1 class="font-bold text-2xl font-logo">dashibase</h1>
          <div class="px-2 py-0.5 rounded-md bg-neutral-600 text-white font-semibold uppercase text-xs h-max">insert</div>
        </div>
        <div class="space-y-6">
          <h2 class="mt-6 text-left text-4xl font-extrabold">Log in</h2>
          <!-- Inputs -->
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium">Email address</label>
              <div class="mt-1">
                <input id="email" :disabled="loading" v-model="email" name="email" type="email" autocomplete="email" required
                  class="border bg-transparent w-full px-3 py-2 shadow-sm sm:text-sm border-neutral-300 focus:border-neutral-300" />
              </div>
            </div>
            <div>
              <label for="password" class="block text-sm font-medium">Password</label>
              <div class="mt-1">
                <input id="password" :disabled="loading" v-model="password" name="password" type="password" autocomplete="current-password" required
                  class="border bg-transparent w-full px-3 py-2 shadow-sm sm:text-sm border-neutral-300 focus:border-neutral-300"
                  @keyup.enter="signIn"  />
              </div>
            </div>
            <!-- Warning -->
            <div v-if="warning" class="text-sm text-red-500">
              {{ warning }}
            </div>
            <!-- Button -->
            <div>
              <button class="w-full h-10 bg-neutral-700 rounded-md text-white text-sm font-medium" @click="signIn">
                {{ loading ? 'Loading...' : (success ? 'Redirecting...' : 'Log in') }}
              </button>
            </div>
          </div>
          <div class="text-xs flex justify-between">
            <div>
              Don't have an account?
              <router-link to="/signup" class="font-semibold hover:underline">
                Sign up
              </router-link>
            </div>
            <div>
              <a class="font-medium" href="https://dashibase.com">Powered by Dashibase</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="hidden lg:block bank-note dark:bank-note-dark bg-neutral-100" />
  </div>
</template>

<style>
.bank-note {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23FFFFFF' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
}
.bank-note-dark {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23F5F5F5' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'
import { supabase } from '@/utils/supabase'

const loading = ref(false)
const success = ref(false)
const email = ref('')
const password = ref('')
const warning = ref('')

function signInWithProvider (provider:string) {
}

async function signIn () {
  if (!email.value) {
    warning.value = 'Please enter an email'
    return
  }
  if (!password.value) {
    warning.value = 'Please enter a password'
    return
  }
  loading.value = true
  const { error } = await supabase.auth.signIn({
    email: email.value,
    password: password.value,
  })
  if (error) {
    loading.value = false
    warning.value = error.message
  } else if (import.meta.env.VITE_HOSTED_BY_DASHIBASE) {
    const { data, error } = await supabase.from('profiles').select('dashibase_insert').eq('id', supabase.auth.user()?.id).single()
    loading.value = false
    if (error) warning.value = error.message
    if (data['dashibase_insert'] !== 'user') warning.value = 'Account does not exist. Try signing up?'
    else {
      success.value = true
      // Redirect to dashboard
      router.push('/')
    }
  } else {
    success.value = true
    // Redirect to dashboard
    router.push('/')
  }
}
</script>
