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

  // @MessagePattern('findAllPayment')
  // findAll() {
  //   return this.paymentService.fi();
  // }

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

  // @MessagePattern('updatePayment')
  // update(@Payload() updatePaymentDto: UpdatePaymentDto) {
  //   return this.paymentService.update(updatePaymentDto.id, updatePaymentDto);
  // }

  // @MessagePattern('removePayment')
  // remove(@Payload() id: number) {
  //   return this.paymentService.remove(id);
  // }
}
