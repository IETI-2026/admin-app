import type { CreateAdminPayload } from '../types/auth'
import { apiPath } from '../lib/apiPath'
import { httpClient } from './httpClient'

export const createAdminUser = async (payload: CreateAdminPayload): Promise<void> => {
  await httpClient.post(apiPath('/users/admin'), payload)
}
