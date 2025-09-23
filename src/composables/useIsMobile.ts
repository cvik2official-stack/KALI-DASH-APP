import { computed, onMounted, onUnmounted, ref } from 'vue';

const MOBILE_BREAKPOINT = 768; // This means screens up to and including 768px will be considered mobile

export function useIsMobile() {
  const isMobile = ref<boolean | undefined>(undefined);

  const updateIsMobile = () => {
    // Use <= to include the breakpoint itself in the mobile range
    isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT;
  };

  const setupMediaQuery = () => {
    // Match media query for screens up to and including the breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    // Set initial value
    updateIsMobile();

    // Add event listener
    mql.addEventListener('change', updateIsMobile);

    // Return cleanup function
    return () => mql.removeEventListener('change', updateIsMobile);
  };

  let cleanup: (() => void) | null = null;

  onMounted(() => {
    cleanup = setupMediaQuery();
  });

  onUnmounted(() => {
    if (cleanup) {
      cleanup();
    }
  });

  // Return reactive value that converts undefined to false
  return computed(() => !!isMobile.value);
}