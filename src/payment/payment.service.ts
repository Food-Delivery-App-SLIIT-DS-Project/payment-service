/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

@Injectable()
export class PaymentService {
  async create(data: any) {
    try {
      const payment = await prisma.payment.create({
        data: {
          orderId: data.orderId,
          customerId: data.customerId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId || undefined,
        },
      });

      return this.toGrpcFormat(payment);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Duplicate entry
        throw new Error(
          `Transaction with ID "${data.transactionId}" already exists.`,
        );
      }

      // Re-throw other unexpected errors
      throw error;
    }
  }

  async findOne(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.toGrpcFormat(payment);
  }

  async refund(paymentId: string) {
    const payment = await prisma.payment.update({
      where: { paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });
    return this.toGrpcFormat(payment);
  }

  toGrpcFormat(payment: any) {
    return {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      customerId: payment.customerId,
      amount: parseFloat(payment.amount),
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId || '',
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
