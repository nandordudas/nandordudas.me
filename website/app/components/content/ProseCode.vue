<script setup lang="ts">
defineProps<{
  code: string
  icon?: string
  language?: string
  hideHeader?: boolean
  filename?: string
  highlights?: number[]
  meta?: string
}>()

const config = {
  wrapper: '[&>pre]:!rounded-t-none [&>pre]:!my-0 my-5',
  // eslint-disable-next-line vue/max-len
  header: 'flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 border-b-0 relative rounded-t-md px-4 py-3 not-prose',
  icon: {
    base: '',
  },
  button: {
    base: 'absolute top-2.5 right-2.5',
  },
  filename: 'text-gray-700 dark:text-gray-200 text-sm/6',
}

const { ui } = useUI('content.prose.code', undefined, config, undefined, true)
</script>

<template>
  <div class="relative prose-code" :class="!!filename && ui.wrapper">
    <div v-if="filename && !hideHeader" :class="ui.header">
      <ProseCodeIcon :icon :filename :class="ui.icon.base" />

      <span :class="ui.filename">
        {{ filename }}
      </span>
    </div>

    <ProseCodeButton :code :class="ui.button.base" />

    <slot />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Victor+Mono:ital,wght@0,100..700;1,100..700&display=swap');

:root {
  --twoslash-popup-bg: rgb(var(--color-gray-800) / 1);
  --twoslash-popup-color: rgb(var(--color-gray-300) / 1);
  --twoslash-docs-color: inherit;
  --twoslash-docs-font: inherit;
  --twoslash-code-font: 'Victor Mono', monospace;
  --twoslash-underline-color: #8888;
  --twoslash-border-color: rgb(var(--color-gray-700) / 1);
  /*  */
  --twoslash-cursor-color: rgb(var(--color-primary-DEFAULT) / 1);
  --twoslash-matched-color: rgb(var(--color-primary-DEFAULT) / 1);
}

html:not(.dark) {
  --twoslash-popup-bg: rgb(var(--color-gray-100) / 1);
  --twoslash-popup-color: rgb(var(--color-gray-600) / 1);
  --twoslash-border-color: rgb(var(--color-gray-300) / 1);
}

.twoslash-popup-container .twoslash-popup-code {
  font-size: 0.9em;
}

.twoslash-popup-container .twoslash-popup-code .line {
  display: block;
}

.twoslash-popup-container .shiki .line {
  --shiki-default-bg: transparent;
  --shiki-dark-bg: transparent;
}

.twoslash-floating .twoslash-popup-docs-tags .twoslash-popup-docs-tag-name {
  color: inherit;
  opacity: 0.5;
}

.prose-code {
  --highlighted-error-color: rgba(244, 63, 94, 0.16);
  --highlighted-warning-color: rgba(234, 179, 8, 0.16);
  --counter-color: rgba(168, 162, 158, 0.5);

  counter-reset: line-num;

  & > pre {
    font-family: 'Victor Mono', monospace;
    font-optical-sizing: auto;

    &.has-focused {
      &:hover .line:not(.focused) {
        filter: blur(0);
        opacity: 1;
      }

      & .line:not(.focused) {
        filter: blur(0.095rem);
        transition:
          filter 0.35s,
          opacity 0.35s;
      }
    }

    &.has-highlighted .highlighted {
      &.error {
        background-color: var(--highlighted-error-color);

        &:hover {
          background-color: lch(from var(--highlighted-error-color) calc(l - 15) c h);
        }
      }

      &.warning {
        background-color: var(--highlighted-warning-color);

        &:hover {
          background-color: lch(from var(--highlighted-warning-color) calc(l - 15) c h);
        }
      }
    }

    & > code {
      --base-color: rgb(68, 71, 90);

      width: 100%;

      & > .line {
        counter-increment: line-num;

        &:hover {
          background-color: lch(from var(--base-color) calc(l - 20) c h);
        }

        &::before {
          content: counter(line-num);
          color: var(--counter-color);
          display: inline-block;
          width: 3ch;
          /* if(counter(line-num) > 9, 2ch, ...) */
          text-align: right;
          margin-right: 1rem;
        }

        &.highlight {
          background-color: #44475a;

          &:hover {
            background-color: lch(from #44475a calc(l - 20) c h);
          }
        }

        &:last-child {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
      }
    }
  }
}
</style>
