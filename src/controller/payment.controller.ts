import Hapi from '@hapi/hapi';
import User from '../models/user';
import Transaction from '../models/transaction';
import { HTTP } from '../common/codeResponses';
import { HOTELMSG } from '../common/hotelResponses';
import amqp from 'amqplib';
import { contactOwner } from './userController';
import mongoose from 'mongoose';
import { payment_service } from '../services/payment.service';
import dotenv from 'dotenv';
import { ResponseUtil } from '../middleware/response';
const stripe = require('stripe')('sk_test_51NpnFqSDai0wLS7KMsQefprvlODc5hLdMRmdln5TdDKxBz6PnqXeBMoIVLeLDDVB5Xu2HVHHIaVqwdf6laQvLxRT00hu4x82QT');
dotenv.config();
const PlateformFee=Number(process.env.PLATEFORM_FEE);
const TAX=Number(process.env.TAX);


export async function redirectSuccessPayment(request: Hapi.Request, h: Hapi.ResponseToolkit){
    return `
    <!DOCTYPE html>
<html>
<head>
  <title>Thanks for your order!</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section>
    <p>
      We appreciate your business! If you have any questions, please email
      <a href="mailto:orders@example.com">orders@example.com</a>.
    </p>
  </section>
</body>
</html>`
}



export async function redirectFailedPayment(request: Hapi.Request, h: Hapi.ResponseToolkit){
    return `
    <!DOCTYPE html>
<html>
<head>
  <title>Sorry....!!!your order is failed to proceed!</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <section>
  <p>Payment Failed</p>
    <p>
      We appreciate your business! If you have any questions, please email
      <a href="mailto:orders@example.com">orders@example.com</a>.
    </p>
  </section>
</body>
</html>`
}




export async function onsuccess(request:Hapi.Request, h: Hapi.ResponseToolkit){
  const{sessionId}=request.query;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const message=await payment_service.onSuccessPayment(session);
    return message
  } catch (error) {
    console.error(error);
    return ('Error handling payment')
  }
}




export async function allTransactions(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  try {
    var transactions;
    const ownerId=request.query.owner_id;
    if(ownerId){
      transactions=await payment_service.adminViewTransaction(ownerId);
    }
    else{
      transactions=await payment_service.adminViewAllTransactions();
      return transactions;
    }
    if(transactions){
      return ResponseUtil.success(transactions,h);
    }
    else{
      return ResponseUtil.notFound("no transaction found",h)
    }
  
 } catch (err) {
    console.error(err);
    // return h.response({ error: 'An error occurred while fetching transaction details' }).code(500);
    return ResponseUtil.error("error",h)
  }
}



export async function ViewMyTransactions(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const uid=request.headers.userId;
  const ownerId=uid.userId
  
  const transaction=await payment_service.ownerViewTransaction(ownerId);
  return transaction;
  


}









// export async function refund(request:Hapi.Request, h: Hapi.ResponseToolkit) {
  

//   try {
//     const { paymentIntentId } = <any>request.payload;

//     // Create a refund for the Payment Intent
//     const refund = await stripe.refunds.create({
//       payment_intent: paymentIntentId,
//     });
//     console.log(refund)
//     return refund;
//   } catch (error) {
//     console.error('Error creating refund:', error);
//     return h.response({ error: 'Error creating refund' }).code(500);
//   }
// }