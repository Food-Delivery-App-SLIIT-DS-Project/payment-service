/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

@Injectable()
export class PaymentService {
  async create(data: any) {
    const transactionId = uuidv4();
    try {
      const payment = await prisma.payment.create({
        data: {
          orderId: data.orderId,
          customerId: data.customerId,
          amount: data.amount,
          status: PaymentStatus.PENDING,
          paymentMethod: data.paymentMethod,
          transactionId: transactionId,
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

  async findAll() {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      payments: payments.map(this.toGrpcFormat),
    };
  }

  async findPaymentsByUser(customerId: string) {
    const payments = await prisma.payment.findMany({
      where: { customerId: customerId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      payments: payments.map(this.toGrpcFormat),
    };
  }

  //update payment status -----------
  async updatePaymentStatus(transactionId: string, status: string) {
    const validStatuses = [
      PaymentStatus.PENDING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
    ];
    if (!validStatuses.includes(status as PaymentStatus)) {
      throw new Error('Invalid payment status');
    }
    // convert status to enum
    const statusEnum = PaymentStatus[status as keyof typeof PaymentStatus];
    const payment = await prisma.payment.update({
      where: { transactionId },
      data: { status: statusEnum },
    });
    return this.toGrpcFormat(payment);
  }

  toGrpcFormat(payment: any) {
    return {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      customerId: payment.customerId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      amount: parseFloat(payment.amount),
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId || '',
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
