<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  PlusCircle,
  Upload,
  Link,
  Clipboard,
  Table,
  Bot,
  Code,
  HardDriveDownload,
  HardDriveUpload,
  GitMerge,
  User,
} from 'lucide-vue-next';
</script>

<template>
  <aside class="bg-sidebar text-sidebar-foreground p-4 flex flex-col border-r border-sidebar-border h-full">
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold text-sidebar-primary-foreground">DASHBOT</h2>
      <p class="text-sm text-sidebar-foreground">by Kali System</p>
    </div>

    <nav class="flex-1 space-y-2">
      <RouterLink to="/admin">
        <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LayoutDashboard class="w-4 h-4 mr-2" />
          Tables
        </Button>
      </RouterLink>

      <Separator class="my-4 bg-sidebar-border" />

      <h3 class="text-xs font-semibold uppercase text-sidebar-foreground mb-2">Data Actions</h3>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <PlusCircle class="w-4 h-4 mr-2" />
        New Table
      </Button>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Upload class="w-4 h-4 mr-2" />
        File Upload
      </Button>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Link class="w-4 h-4 mr-2" />
        Fetch from URL
      </Button>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Clipboard class="w-4 h-4 mr-2" />
        Paste CSV (or JSON)
      </Button>

      <Separator class="my-4 bg-sidebar-border" />

      <h3 class="text-xs font-semibold uppercase text-sidebar-foreground mb-2">Bot Management</h3>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Bot class="w-4 h-4 mr-2" />
        Bot Flows
      </Button>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Code class="w-4 h-4 mr-2" />
        Inline Mode Schemes
      </Button>

      <Separator class="my-4 bg-sidebar-border" />

      <h3 class="text-xs font-semibold uppercase text-sidebar-foreground mb-2">Utilities</h3>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <HardDriveDownload class="w-4 h-4 mr-2" />
        Backup
      </Button>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <HardDriveUpload class="w-4 h-4 mr-2" />
        Restore
      </Button>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <GitMerge class="w-4 h-4 mr-2" />
        Merge
      </Button>

      <Separator class="my-4 bg-sidebar-border" />

      <h3 class="text-xs font-semibold uppercase text-sidebar-foreground mb-2">User Space</h3>
      <Button variant="ghost" class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <User class="w-4 h-4 mr-2" />
        My Files
      </Button>
    </nav>
  </aside>
</template>

<style scoped>
/* No specific styles needed here, Tailwind handles it */
</style>