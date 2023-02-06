import {
  patchPgForTransactions,
  startTransaction,
  rollbackTransaction,
} from 'pg-transactional-tests';

import { db } from '@/db';

patchPgForTransactions();

beforeAll(startTransaction);
beforeEach(startTransaction);
afterEach(rollbackTransaction);
afterAll(async () => {
  await rollbackTransaction();
  await db.$close();
});
