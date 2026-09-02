<script setup>
defineProps({
  size: {
    type: String,
    default: 'md' // sm, md, lg
  }
});

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20'
};
</script>

<template>
  <div :class="[sizeClasses[size], 'flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 shadow-lg shadow-slate-700/50']">
    <svg viewBox="0 0 100 100" class="h-3/4 w-3/4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Bank building main structure -->
      <defs>
        <linearGradient id="bankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
        </linearGradient>
      </defs>
      
      <!-- Main building body -->
      <rect x="18" y="35" width="64" height="38" rx="2" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
      
      <!-- Building roof/pediment -->
      <path d="M18 35L50 15L82 35" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linejoin="round"/>
      
      <!-- Columns at base -->
      <rect x="25" y="67" width="6" height="8" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="45" y="67" width="6" height="8" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="65" y="67" width="6" height="8" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      
      <!-- Upper windows row -->
      <rect x="26" y="42" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="38" y="42" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="50" y="42" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="62" y="42" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      
      <!-- Lower windows row -->
      <rect x="26" y="54" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="38" y="54" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="50" y="54" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      <rect x="62" y="54" width="8" height="8" rx="1" fill="rgba(59,130,246,0.3)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
      
      <!-- Centered money symbol on building -->
      <circle cx="50" cy="48" r="10" fill="none" stroke="rgba(34,197,94,0.3)" stroke-width="1.5"/>
      <text x="50" y="52" text-anchor="middle" font-size="14" font-weight="bold" fill="rgba(34,197,94,0.8)">$</text>
      
      <!-- Base line/foundation -->
      <line x1="18" y1="73" x2="82" y2="73" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
      
      <!-- Shine effect on top -->
      <path d="M20 36Q50 30 80 36" fill="url(#bankGradient)" opacity="0.6"/>
    </svg>
  </div>
</template>

<style scoped>
</style>
