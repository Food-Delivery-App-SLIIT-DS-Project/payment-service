/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod('PaymentService', 'CreatePayment')
  @MessagePattern('createPayment')
  async create(data: any) {
    // console.log('data', data);
    return this.paymentService.create(data);
  }

  @GrpcMethod('PaymentService', 'FindAllPayments')
  @MessagePattern('findAllPayments')
  findAll(_: any) {
    return this.paymentService.findAll();
  }
  
  @GrpcMethod('PaymentService', 'FindPaymentsByUser')
  @MessagePattern('findPaymentsByUser')
  findPaymentsByUser(data: { customerId: string }) {
    return this.paymentService.findPaymentsByUser(data.customerId);
  }

  @GrpcMethod('PaymentService', 'GetPayment')
  @MessagePattern('findOnePayment')
  async findOne(data: { paymentId: string }) {
    return this.paymentService.findOne(data.paymentId);
  }

  @GrpcMethod('PaymentService', 'RefundPayment')
  @MessagePattern('refundPayment')
  async refund(data: { paymentId: string }) {
    return this.paymentService.refund(data.paymentId);
  }
 @GrpcMethod('PaymentService', 'UpdatePaymentStatus')
  @MessagePattern('UpdatePaymentStatus')
  async updatePaymentStatus(data: { transactionId: string; status: string }) {
    return this.paymentService.updatePaymentStatus(data.transactionId, data.status);
  }

  // @MessagePattern('updatePayment')
  // update(@Payload() updatePaymentDto: UpdatePaymentDto) {
  //   return this.paymentService.update(updatePaymentDto.id, updatePaymentDto);
  // }

  // @MessagePattern('removePayment')
  // remove(@Payload() id: number) {
  //   return this.paymentService.remove(id);
  // }
}
