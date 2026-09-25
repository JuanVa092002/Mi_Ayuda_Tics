import type { Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { reportDir } from './report'

/** Masks password fields so failure artifacts do not capture secrets. */
export async function captureMaskedFailureScreenshot(page: Page, name: string): Promise<string> {
  const dir = reportDir()
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${name.replace(/[^\w.-]+/g, '_')}.png`)
  await page.screenshot({
    path: file,
    fullPage: true,
    mask: [
      page.locator('input[type="password"]'),
      page.locator('input[autocomplete="current-password"]'),
      page.locator('input[autocomplete="new-password"]'),
    ],
    maskColor: '#111111',
  })
  return file
}
