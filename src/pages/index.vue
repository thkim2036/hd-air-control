<script setup>
import todayNotice from '@/components/TodayNotice.vue'

defineOptions({
  name: 'index',
})

const openDevelops = () => {
  window.open("https://xbuilder.hd.com/#/develop/guide?category=DEVELOP_WEB")
}
</script>

<template>  
  <v-container>
    <todayNotice/>
    <!-- Header -->
    <v-row>
      <v-col class="text-center">        
        <h1 class="display-1 font-weight-bold">
          Welcome to HDxBuilder Web
        </h1>        
      </v-col>
    </v-row>

    <!-- Features Section -->
    <v-row class="mt-8">
      <v-col
        cols="12"
        md="4"
        class="text-center"
      >
        <v-icon size="48">
          mdi-vuejs
        </v-icon>
        <h3 class="headline">
          Vue 3 Basics
        </h3>
        <p>Understand the fundamentals of Vue 3, the progressive JavaScript framework.</p>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="text-center"
      >
        <v-icon size="48">
          mdi-layers
        </v-icon>
        <h3 class="headline">
          Vuetify Components
        </h3>
        <p>Learn to create beautiful, responsive UIs using Vuetify's extensive library of components.</p>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="text-center"
      >
        <v-icon size="48">
          mdi-code-tags
        </v-icon>
        <h3 class="headline">
          Advanced Topics
        </h3>
        <p>Dive deeper into advanced topics like state management, routing, and more.</p>
      </v-col>
    </v-row>

    <!-- Call to Action -->
    <v-row class="mt-12">
      <v-col class="text-center">
        <v-btn          
          color="primary"
          large
          @click="openDevelops"
        >
          Get Started
        </v-btn>
      </v-col>
    </v-row>
  </v-container>  
</template>

<route lang="yaml">
meta:    
  noAuth: true
</route>
