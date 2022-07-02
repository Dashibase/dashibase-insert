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
          <h2 class="mt-6 text-left text-4xl font-extrabold text-primary dark:text-primary-dark">Sign up</h2>
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
                  class="border bg-transparent w-full px-3 py-2 shadow-sm sm:text-sm border-neutral-300 focus:border-neutral-300" @keyup.enter="signUp" />
              </div>
            </div>
            <!-- Warning -->
            <div v-if="warning" class="text-sm text-red-500">
              {{ warning }}
            </div>
            <!-- Button -->
            <div>
              <button class="w-full h-10 bg-neutral-700 rounded-md text-white text-sm font-medium" @click="signUp">
                {{ loading ? 'Loading...' : (success ? (confirmEmail ? 'Check your email!' : 'Redirecting...') : 'Create account') }}
              </button>
            </div>
          </div>
          <div class="text-xs flex justify-between">
            <div>
              Already have a Dashibase account?
              <router-link to="/login" class="font-semibold hover:underline">
                Log in
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

<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router'
import { supabase } from '@/utils/supabase'

const loading = ref(false)
const success = ref(false)
const email = ref('')
const password = ref('')
const warning = ref('')
const minPasswordLength = ref(6)
const confirmEmail = ref(true)

async function signUp () {
  warning.value = ''
  if (!email.value) {
    warning.value = 'Please enter an email'
    return
  }
  if (!password.value) {
    warning.value = 'Please enter a password'
    return
  }
  loading.value = true
  if (password.value.length < minPasswordLength.value) {
    warning.value = `Password needs to be at least ${minPasswordLength.value} characters`
  } else {
    const checkUserResponse = await supabase.from('profiles').select('id').eq('email', email.value).single()
    if (!checkUserResponse.error) {
      loading.value = false
      warning.value = 'You\'ve already registered. Try logging in with your existing Dashibase account?'
      return
    }
    const { user, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    }, {
      redirectTo: 'https://insert.dashibase.com'
    })
    loading.value = false
    if (error) {
      if (error.message === 'User already registered') warning.value = 'You\'ve already registered. Try logging in with your existing Dashibase account?'
      else warning.value = error.message
    } else {
      success.value = true
      fetch('https://1zgvejiu04.execute-api.us-east-1.amazonaws.com/prod/dashibase-signup-mailchimp', {
        method: 'POST',
        body: JSON.stringify({
          email: email.value,
        })
      })
      if (!confirmEmail.value) {
        // Redirect user if confirmEmail is false
        router.push('/')
      }
    }
  }
}
</script>
