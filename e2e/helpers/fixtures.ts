import { test as base } from '@playwright/test'
import { captureMaskedFailureScreenshot } from './screenshots'

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page)
    if (testInfo.status !== 'failed' && testInfo.status !== 'timedOut') return
    try {
      await captureMaskedFailureScreenshot(page, testInfo.titlePath.join('-'))
    } catch {
      // page may already be closed
    }
  },
})

export { expect } from '@playwright/test'
