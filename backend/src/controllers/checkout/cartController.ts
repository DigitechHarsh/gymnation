import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { calculateCartTotals } from '../../services/pricingEngine.js';
import { AuthenticatedCustomerRequest } from '../../middlewares/authMiddleware.js';

export const validateCartEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, couponCode, state, paymentMethod } = req.body;
    const totals = await calculateCartTotals({
      items,
      couponCode,
      state,
      paymentMethod,
    });
    return sendSuccess(res, totals, 'Cart re-priced and validated from database');
  } catch (error) {
    next(error);
  }
};

export const getCustomerCart = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.customer!.id;
    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
      });
    }

    return sendSuccess(res, cart, 'Customer cart retrieved');
  } catch (error) {
    next(error);
  }
};

export const addCustomerCartItem = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.customer!.id;
    const { variantId, qty = 1 } = req.body;

    let cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { customerId } });
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant || !variant.isActive) {
      throw new AppError('Variant not available', 400);
    }

    const item = await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
      update: {
        qty: { increment: qty },
      },
      create: {
        cartId: cart.id,
        variantId,
        qty,
      },
    });

    return sendSuccess(res, item, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

export const updateCustomerCartItem = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.customer!.id;
    const id = req.params.id as string;
    const { qty } = req.body;

    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new AppError('Cart not found', 404);

    if (qty <= 0) {
      await prisma.cartItem.deleteMany({
        where: { id, cartId: cart.id },
      });
      return sendSuccess(res, null, 'Item removed from cart');
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { qty },
    });

    return sendSuccess(res, updated, 'Cart item quantity updated');
  } catch (error) {
    next(error);
  }
};

export const removeCustomerCartItem = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.customer!.id;
    const id = req.params.id as string;

    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw new AppError('Cart not found', 404);

    await prisma.cartItem.deleteMany({
      where: { id, cartId: cart.id },
    });

    return sendSuccess(res, null, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

export const clearCustomerCart = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.customer!.id;
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return sendSuccess(res, null, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};
