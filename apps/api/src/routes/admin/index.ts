import { Router } from 'express';
import { bookingsAdminRouter } from './bookings.admin.routes.js';
import { citiesAdminRouter } from './cities.admin.routes.js';
import { examSlotsAdminRouter } from './examSlots.admin.routes.js';
import { formulasAdminRouter } from './formulas.admin.routes.js';
import { sessionsAdminRouter } from './sessions.admin.routes.js';
import { studentsAdminRouter } from './students.admin.routes.js';
import { usersAdminRouter } from './users.admin.routes.js';

export const adminRouter = Router();

adminRouter.use('/formulas', formulasAdminRouter);
adminRouter.use('/cities', citiesAdminRouter);
adminRouter.use('/exam-slots', examSlotsAdminRouter);
adminRouter.use('/sessions', sessionsAdminRouter);
adminRouter.use('/users', usersAdminRouter);
adminRouter.use('/bookings', bookingsAdminRouter);
adminRouter.use('/students', studentsAdminRouter);
