<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Task } from '../models/Task';
import { userManager } from '../auth/UserManager';
import { taskRepository } from '../repository/TaskRepository';

const props = defineProps<{
  storyId: string;
  editingTaskId?: string | null;
}>();

const emit = defineEmits<{
  save: [task: Task];
  cancel: [];
}>();

const name = ref('');
const description = ref('');
const realizedHours = ref(0);
const startDate = ref('');
const assigneeId = ref('');
const state = ref<'todo' | 'doing' | 'done'>('todo');

const users = userManager.getAllUsers();
const isLoading = ref(false);

async function load() {
  if (props.editingTaskId) {
    const task = await taskRepository.getById(props.editingTaskId);
    if (task) {
      name.value = task.name;
      description.value = task.description || '';
      realizedHours.value = task.realizedHours || 0;
      startDate.value = task.startDate ? task.startDate.slice(0, 16) : '';
      assigneeId.value = task.assigneeId || '';
      state.value = task.state;
    }
  } else {
    realizedHours.value = 0;
    startDate.value = new Date().toISOString().slice(0, 16);
    state.value = 'todo';
  }
}

async function save() {
  if (!name.value.trim()) return;
  isLoading.value = true;
  
  const formattedDate = startDate.value ? new Date(startDate.value).toISOString() : undefined;
  let savedTask: Task;

  if (props.editingTaskId) {
    const task = await taskRepository.getById(props.editingTaskId);
    if (task) {
      task.name = name.value.trim();
      task.description = description.value.trim();
      task.realizedHours = realizedHours.value;
      task.startDate = formattedDate;
      task.assigneeId = assigneeId.value || null;
      task.state = state.value;
      savedTask = await taskRepository.update(task);
    } else {
      isLoading.value = false;
      return;
    }
  } else {
    savedTask = await taskRepository.create({
      name: name.value.trim(),
      description: description.value.trim(),
      storyId: props.storyId,
      realizedHours: realizedHours.value,
      startDate: formattedDate,
      assigneeId: assigneeId.value || null,
      state: state.value
    });
  }
  
  isLoading.value = false;
  emit('save', savedTask);
}

onMounted(load);
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm" @click.self="emit('cancel')">
    <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ editingTaskId ? 'Edytuj zadanie' : 'Nowe zadanie' }}
        </h2>
        <button @click="emit('cancel')" class="text-slate-400 hover:text-slate-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nazwa zadania *</label>
          <input v-model="name" type="text" placeholder="Przeanalizować wymagania..." class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opis</label>
          <textarea v-model="description" rows="3" placeholder="Szczegóły zadania..." class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stan</label>
            <select v-model="state" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50">
              <option value="todo">Do zrobienia</option>
              <option value="doing">W trakcie</option>
              <option value="done">Zrobione</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Przypisana osoba</label>
            <select v-model="assigneeId" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50">
              <option value="">Brak</option>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data startu (opcjonalna)</label>
            <input v-model="startDate" type="datetime-local" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Zrealizowane godziny</label>
            <input v-model="realizedHours" type="number" min="0" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
        <button @click="emit('cancel')" class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
        <button @click="save" :disabled="isLoading || !name.trim()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 transition-colors">
          Zapisz
        </button>
      </div>
    </div>
  </div>
</template>
