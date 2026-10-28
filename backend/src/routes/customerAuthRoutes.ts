import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  refreshCustomerToken,
  logoutCustomer,
  getCustomerProfile,
  listCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} from '../controllers/customerAuthController.js';
import { requireCustomerAuth } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import { authRateLimiter } from '../middlewares/security.js';
import { customerRegisterSchema, customerLoginSchema } from '../validators/authValidators.js';

const router = Router();

// Customer auth endpoints with brute-force rate limiter
router.post('/register', authRateLimiter, validateBody(customerRegisterSchema), registerCustomer);
router.post('/login', authRateLimiter, validateBody(customerLoginSchema), loginCustomer);
router.post('/refresh', refreshCustomerToken);
router.post('/logout', logoutCustomer);
router.get('/me', requireCustomerAuth, getCustomerProfile);

// Customer address endpoints
router.get('/addresses', requireCustomerAuth, listCustomerAddresses);
router.post('/addresses', requireCustomerAuth, addCustomerAddress);
router.put('/addresses/:id', requireCustomerAuth, updateCustomerAddress);
router.delete('/addresses/:id', requireCustomerAuth, deleteCustomerAddress);

export default router;
