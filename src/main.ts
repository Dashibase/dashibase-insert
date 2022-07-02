import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from './router'
import { OhVueIcon, addIcons } from "oh-vue-icons"
import {
  MdDragindicator,
  FaRegularPaperPlane,
  HiSolidLockOpen,
  HiSolidLockClosed,
  RiLoader4Fill,
  BiTextLeft,
  BiTypeH1,
  BiTypeH2,
  LaToggleOnSolid,
  LaToggleOffSolid,
  BiHr,
  IoText,
  Bi123,
  RiBracesLine,
  HiCreditCard,
  MdAccesstime,
  HiCalendar,
  RiToggleLine,
  MdSubject,
  MdShorttext,
  MdArrowdropdown,
  HiCode,
} from "oh-vue-icons/icons"
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

addIcons(
  MdDragindicator,
  FaRegularPaperPlane,
  HiSolidLockOpen,
  HiSolidLockClosed,
  RiLoader4Fill,
  BiTextLeft,
  BiTypeH1,
  BiTypeH2,
  LaToggleOnSolid,
  LaToggleOffSolid,
  BiHr,
  IoText,
  Bi123,
  RiBracesLine,
  HiCreditCard,
  MdAccesstime,
  HiCalendar,
  RiToggleLine,
  MdSubject,
  MdShorttext,
  MdArrowdropdown,
  HiCode,
)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.component("v-icon", OhVueIcon)
app.use(pinia)
app.use(router)
app.mount('#app')
