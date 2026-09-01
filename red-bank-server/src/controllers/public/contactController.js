import ContactMessage from '../../models/ContactMessage.js';
import catchAsync from '../../utils/catchAsync.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const createContactMessage = catchAsync(async (req, res) => {
  const { name, email, phone, company, message } = req.body;

  await ContactMessage.create({
    name,
    email,
    phone: phone || '',
    company: company || '',
    message,
  });

  sendSuccess(res, null, 201, 'Message sent successfully');
});
