import { createFactory } from 'orchid-orm-test-factory';

import { db } from '@/db';

export const userFactory = createFactory(db.user);
