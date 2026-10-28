import { Router } from 'express';
import {
  getPublicCategories,
  listAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/store/categoryController.js';
import {
  getPublicProducts,
  getPublicProductBySlug,
  listAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductsCSV,
} from '../controllers/store/productController.js';
import {
  getLowStockAlerts,
  bulkUpdateInventory,
  updateSingleVariantStock,
} from '../controllers/store/inventoryController.js';

import { requireAdminAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import {
  categorySchema,
  productSchema,
  bulkInventoryUpdateSchema,
} from '../validators/store/storeValidators.js';
import { reorderSchema } from '../validators/cms/cmsValidators.js';
import { AdminRole } from '@prisma/client';

const storeRouter = Router();

// ================= PUBLIC STORE ROUTES =================
storeRouter.get('/categories', getPublicCategories);
storeRouter.get('/products', getPublicProducts);
storeRouter.get('/products/:slug', getPublicProductBySlug);

// ================= ADMIN STORE ROUTES (SUPER_ADMIN, MANAGER) =================
const adminGuard = [requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER)];

// Categories
storeRouter.get('/admin/categories', ...adminGuard, listAdminCategories);
storeRouter.post('/admin/categories', ...adminGuard, validateBody(categorySchema), createCategory);
storeRouter.put('/admin/categories/:id', ...adminGuard, validateBody(categorySchema), updateCategory);
storeRouter.delete('/admin/categories/:id', ...adminGuard, deleteCategory);
storeRouter.patch('/admin/categories/reorder', ...adminGuard, validateBody(reorderSchema), reorderCategories);

// Products
storeRouter.get('/admin/products', ...adminGuard, listAdminProducts);
storeRouter.get('/admin/products/export/csv', ...adminGuard, exportProductsCSV);
storeRouter.get('/admin/products/:id', ...adminGuard, getAdminProductById);
storeRouter.post('/admin/products', ...adminGuard, validateBody(productSchema), createProduct);
storeRouter.put('/admin/products/:id', ...adminGuard, validateBody(productSchema), updateProduct);
storeRouter.delete('/admin/products/:id', ...adminGuard, deleteProduct);

// Inventory
storeRouter.get('/admin/inventory/low-stock', ...adminGuard, getLowStockAlerts);
storeRouter.post('/admin/inventory/bulk-update', ...adminGuard, validateBody(bulkInventoryUpdateSchema), bulkUpdateInventory);
storeRouter.patch('/admin/inventory/variant/:variantId', ...adminGuard, updateSingleVariantStock);

export default storeRouter;
