<script setup>
import { useThemeConfig } from '@core/composable/useThemeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavbarI18n from '@/layouts/components/NavBarI18n.vue'
import tagView from '@/layouts/components/AppTagView.vue'
import NavBarFullScreen from '@/layouts/components/NavBarFullScreen.vue'
import NavBarBookmark from '@/layouts/components/NavBarBookmark.vue'
import AppBarSearchPC from '@core/components/AppBarSearchPC.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'
import { useMenuStore } from '@hiway/stores/menu'
import { useTagsStore } from '@hiway/stores/tags'
import { storeToRefs } from 'pinia'

const { treeMenus, myMenus } = storeToRefs(useMenuStore())
const tagsStore = useTagsStore()

const { appRouteTransition, isLessThanOverlayNavBreakpoint } = useThemeConfig()
const { width: windowWidth } = useWindowSize()
</script>

<template>
  <VerticalNavLayout
    :nav-items="treeMenus"
    :nav-my-menu-items="myMenus"
  >    
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <VBtn
          v-if="isLessThanOverlayNavBreakpoint(windowWidth)"
          icon
          variant="text"
          color="default"
          class="ms-n3"
          size="small"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            icon="mdi-menu"
            size="24"
          />
        </VBtn>

        <VSpacer />                     <!--  공백         -->
        <AppBarSearchPC class="me-2" /> <!--  검색         -->
        <NavBarBookmark />              <!--  북마크       -->
        <NavbarI18n />                  <!--  다국어       -->
        <NavbarThemeSwitcher />         <!--  테마변경     -->
        <NavBarFullScreen />            <!--  전체화면     --> 
        <UserProfile />                 <!--  사용자계정   --> 
      </div>
    </template>
    <template #tagview>
      <tagView />                       <!--  방문탭 상단   -->
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
  </VerticalNavLayout>
</template>
