<template>
  <div>
    Storages <SWTag class="bg-blue-100 ml-[5px]">{{ list.length }}</SWTag>
  </div>
  <SWCard class="w-full">
    <Loading :isLoading="isViewAllFetching || isActionFetching">
      <div
        v-for="item of list"
        v-if="!isViewAllFetching"
        :key="item.id"
        class="storage-item flex justify-between items-center flex-nowrap has-[.form]:flex-wrap w-full hover:bg-gray-100 has-[.form]:bg-gray-100 rounded-sm pl-2 pr-2 pt-3 pb-3"
      >
        <div>{{ item.path }} <SWTag class="bg-blue-100">{{ getStorageType(item) }}</SWTag></div>
        <ButtonGroup v-if="currentEditId !== item.id" class="justify-end">
          <ActionButton @click="currentEditId = item.id">Edit</ActionButton>
          <DangerButton @click="() => deleteStorage()">Delete</DangerButton>
        </ButtonGroup>
        <div v-else class="basis-full form">
          <div>
            Mount Path:
            <input v-model="item.path" />
          </div>
          <ButtonGroup class="justify-end">
            <ActionButton @click="() => saveStorage()">Save</ActionButton>
            <GeneralButton @click="() => cancel()">Cancel</GeneralButton>
          </ButtonGroup>
        </div>
      </div>
    </Loading>
  </SWCard>
</template>
<script setup lang="ts">
import { computed, MaybeRefOrGetter, ref, unref } from 'vue'
import SWCard from './components/SWCard.vue'
import Loading from './components/Loading.vue'
import ButtonGroup from './components/ButtonGroup.vue'
import GeneralButton from './components/GeneralButton.vue'
import ActionButton from './components/ActionButton.vue'
import DangerButton from './components/DangerButton.vue'
import { useFetch } from '@vueuse/core'
import { match } from 'ts-pattern'
import SWTag from './components/SWTag.vue'

const apiRef = (val?: MaybeRefOrGetter) => computed(() => `/-/storages${val ? `/${unref(val)}` : ''}`)

const getStorageType = (item) => {
  return match(item.device)
    .with({ type: 'local' }, () => 'Local Storage')
    .otherwise(() => 'Unknown Storage')
}

const currentEditId = ref(null)
const viewAllUrl = apiRef()
const { data, isFetching: isViewAllFetching, execute: queryViewAll } = useFetch(viewAllUrl)
  .get()
  .json()
const list = computed(() => unref(data).data)
const cancel = () => {
  currentEditId.value = null
  return queryViewAll()
}
const deleteStorageUrl = apiRef(currentEditId)
const { isFetching: isDeleteFetching, execute: queryDelete } = useFetch(deleteStorageUrl, { immediate: false })
  .delete()
const deleteStorage = async () => {
  await queryDelete()
  return cancel()
}

const saveStorage = async () => {
  return cancel()
}

const isActionFetching = computed(() => isDeleteFetching.value)
</script>
