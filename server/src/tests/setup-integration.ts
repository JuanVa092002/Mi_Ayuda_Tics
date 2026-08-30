import { vi } from 'vitest'
import { loadIntegrationEnv } from './load-integration-env'

loadIntegrationEnv()

vi.mock('../shared/utils/handleEmail', () => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
}))
