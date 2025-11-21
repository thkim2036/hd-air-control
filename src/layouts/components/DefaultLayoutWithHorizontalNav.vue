<script setup>
import { useThemeConfig } from '@core/composable/useThemeConfig'
import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import { HorizontalNavLayout } from '@layouts'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'

import { storeToRefs } from 'pinia'

import { useMenuStore } from '@hiway/stores/menu'
import { useTagsStore } from '@hiway/stores/tags'

import NavbarI18n from '@/layouts/components/NavBarI18n.vue'
import NavBarFullScreen from '@/layouts/components/NavBarFullScreen.vue'
import tagView from '@/layouts/components/AppTagView.vue'
import NavBarBookmark from '@/layouts/components/NavBarBookmark.vue'
import AppBarSearchPC from '@core/components/AppBarSearchPC.vue'
import TheCustomizer from '@core/components/TheCustomizer.vue'

const { appRouteTransition } = useThemeConfig()

const { treeMenus, myMenus } = storeToRefs(useMenuStore())

const tagsStore = useTagsStore()
</script>

<template>
  <HorizontalNavLayout
    :nav-items="treeMenus"
    :nav-my-menu-items="myMenus"
  >
    <template #tagview>
      <tagView />
    </template>
    <!-- 👉 navbar -->
    <template #navbar>
      <RouterLink
        to="/"
        class="d-flex align-center gap-x-3"
      >
        <!-- <VNodeRenderer :nodes="themeConfig.app.logo" /> -->
        <img :src="themeConfig.app.logo">

        <h1 class="font-weight-medium leading-normal text-xl">
          {{ themeConfig.app.title }}
        </h1>
      </RouterLink>
      <VSpacer />

      <AppBarSearchPC class="me-2" />
      <NavBarBookmark />
      <NavbarI18n />            
      <NavbarThemeSwitcher />
      <NavBarFullScreen />      
      <UserProfile />
    </template>

    <!-- 👉 Pages -->
    <RouterView
      v-slot="{ Component }"      
    >            
      <Transition
        :name="appRouteTransition"
        mode="out-in"
      >
        <KeepAlive :include="tagsStore.cachedViews">           
          <Component :is="Component" />
        </KeepAlive>
      </Transition>
    </RouterView>    

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <TheCustomizer />
  </HorizontalNavLayout>
</template>
