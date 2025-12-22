const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Received form submission');
    const data = JSON.parse(event.body);
    console.log('Parsed data:', { ...data, email: data.email ? 'PROVIDED' : 'MISSING' });
    
    const { name, email, phone, dob, insuranceType, city, country, message } = data;

    // Validate required fields
    if (!name || !email) {
      console.error('Validation failed: missing name or email');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name and email are required' })
      };
    }

    // Check if environment variables are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service not configured. Please contact administrator.' })
      };
    }

    console.log('Sending email to:', process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER);

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Use recipient email from env or fallback to sender
    const recipientEmail = process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER;

    // Email options with all form fields
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: recipientEmail,
      replyTo: email,
      subject: `New Insurance Lead from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="background-color: #0b3b5d; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0;">New Insurance Lead</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h3 style="color: #0b3b5d; margin-top: 0;">Contact Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 40%;">Name:</td>
                <td style="padding: 8px;">${name}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Email:</td>
                <td style="padding: 8px;"><a href="mailto:${email}" style="color: #0b3b5d;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Phone:</td>
                <td style="padding: 8px;">${phone || 'Not provided'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">Date of Birth:</td>
                <td style="padding: 8px;">${dob || 'Not provided'}</td>
              </tr>
            </table>

            <h3 style="color: #0b3b5d; margin-top: 25px;">Insurance Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 40%;">Insurance Type:</td>
                <td style="padding: 8px;">${insuranceType || 'Not specified'}</td>
              </tr>
              <tr style="background-color: white;">
                <td style="padding: 8px; font-weight: bold;">City:</td>
                <td style="padding: 8px;">${city || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Country:</td>
                <td style="padding: 8px;">${country || 'Not provided'}</td>
              </tr>
            </table>

            ${message ? `
            <h3 style="color: #0b3b5d; margin-top: 25px;">Message</h3>
            <div style="padding: 15px; background-color: white; border-left: 4px solid #0b3b5d; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            ` : ''}
          </div>

          <div style="background-color: #e7e7e7; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">This lead was submitted via AJK Insurance Brokers website</p>
            <p style="margin: 5px 0 0 0;">Submission time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };

    // Send email
    console.log('Attempting to send email...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Form submitted successfully!',
        success: true 
      })
    };

  } catch (error) {
    console.error('Error in form submission:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to submit form. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      })
    };
  }
};
