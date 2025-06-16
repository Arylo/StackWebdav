<template>
  <ACard
    :title="`Storages`"
  >
    <ASpin :spinning="isLoading">
      <AEmpty v-if="list.length === 0">
        <template #description>
          <AButton type="primary" @click="() => addStorage()">Create Now</AButton>
        </template>
      </AEmpty>
      <AList
        v-else
        :data-source="list"
        item-layout="horizontal"
      >
        <template #renderItem="{ item }">
          <AListItem>
            <AForm :disabled="!isEditing(item)" :model="item">
              <AFormItem label="Mount Path">
                <AInput v-model:value="item.path" placeholder="/" />
              </AFormItem>
              <AFormItem label="Storage Device">
                <ARadioGroup v-model:value="item.device.type">
                  <ARadioButton value="local">Local Storage</ARadioButton>
                </ARadioGroup>
              </AFormItem>
              <template v-if="isEditing(item)">
                <AFormItem label="Target Path" v-if="item.device.type === 'local'">
                  <AInput v-model:value="item.device.path" placeholder="/" />
                </AFormItem>
              </template>
            </AForm>
            <template #actions>
              <template v-if="isEditing(item)">
                <AButton type="primary" @click="() => saveStorage(item)">Save</AButton>
                <AButton @click="() => cancelEdit()">Cancel</AButton>
              </template>
              <template v-else>
                <AButton type="primary" @click="() => startEditStorage(item)">Edit</AButton>
                <AButton @click="() => deleteStorage(item)" danger>Delete</AButton>
              </template>
            </template>
          </AListItem>
        </template>
        <template #footer v-if="!hasNewRecord">
          <AButton type="primary" @click="() => addStorage()">Create One</AButton>
        </template>
      </AList>
    </ASpin>
  </ACard>
</template>
<script setup lang="ts">
import { computed, MaybeRefOrGetter, ref, unref } from 'vue'
import { useArrayFind, useFetch, whenever } from '@vueuse/core'
import { logicOr } from '@vueuse/math'
import {
  Card as ACard,
  Empty as AEmpty,
  Input as AInput,
  Button as AButton,
  Spin as ASpin,
  List as AList,
  ListItem as AListItem,
  Form as AForm,
  FormItem as AFormItem,
  RadioGroup as ARadioGroup,
  RadioButton as ARadioButton,
} from 'ant-design-vue'

const newStorageId = Symbol()
const currentEditId = ref<string|typeof newStorageId|null>(null)
const apiRef = (val?: MaybeRefOrGetter) => computed(() => `/-/storages${typeof unref(val) === 'string' ? `/${unref(val)}` : ''}`)

const hasNewRecord = computed(() => {
  return currentEditId.value === newStorageId
})
const isEditing = (item: { id: string | symbol }) => {
  const [a, b] = [item.id, currentEditId.value]
  return (typeof a === typeof b) && a === b
}
const startEditStorage = (item) => {
  if (typeof item.id === 'string') {
    list.value = list.value.filter((item) => item.id !== newStorageId)
  }
  currentEditId.value = item.id
}
const addStorage = () => {
  const newStorage = {
    id: newStorageId,
    device: { type: 'local' },
  }
  list.value.push(newStorage)
  startEditStorage(newStorage)
}

const viewAllUrl = apiRef()
const { data, isFetching: isViewAllFetching, isFinished: isViewAllFinished, execute: queryViewAll } = useFetch(viewAllUrl)
  .get()
  .json()

const list = ref<any[]>([])
whenever(isViewAllFinished, () => {
  list.value = unref(data)?.data ?? []
  currentEditId.value = null
})
const cancelEdit = () => queryViewAll()
const toDeleteId = ref(null)
const deleteStorageUrl = apiRef(toDeleteId)
const { isFetching: isDeleteFetching, execute: queryDelete } = useFetch(deleteStorageUrl, { immediate: false })
  .delete()
const deleteStorage = async (item) => {
  toDeleteId.value = item.id
  await queryDelete()
  return cancelEdit()
}

const upsertUrl = apiRef(currentEditId)
const upsertPayload = useArrayFind(list, (item) => item.id === currentEditId.value)
const { isFetching: isUpdateFetching, execute: queryUpdate } = useFetch(upsertUrl, { immediate: false })
  .put(upsertPayload)
  .json()
const { isFetching: isCreateFetching, execute: queryCreate } = useFetch(upsertUrl, { immediate: false })
  .post(upsertPayload)
  .json()
const saveStorage = async (item) => {
  if (item.id === newStorageId) {
    await queryCreate()
  } else if (typeof item.id === 'string') {
    await queryUpdate()
  }
  return cancelEdit()
}

const isLoading = logicOr(isViewAllFetching, isUpdateFetching, isCreateFetching, isDeleteFetching)
</script>
