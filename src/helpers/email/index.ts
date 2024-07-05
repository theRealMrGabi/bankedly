interface EmailProps {
	recipientName: string
}

interface WelcomeEmailDto extends EmailProps {
	otpCode: string
}

interface ForgotPasswordEmailDto extends EmailProps {
	otpCode: string
}

export const welcomeEmail = ({ recipientName, otpCode }: WelcomeEmailDto) => {
	return `
  <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f1f1f1; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Welcome to Bankedly!</h1>
      </div>
      <div style="padding: 20px;">
        <p style="text-transform: capitalize;">Hi ${recipientName},</p>
        <p>Welcome to Bankedly, your trusted partner in financial empowerment! 🎉</p>
        <p>At Bankedly, we believe that financial freedom is a right, not a privilege. As a valued member of our community, you're not just using a financial app; you're joining a movement towards smarter, more efficient banking.</p>
        <p>With Bankedly, you can manage your finances effortlessly, make informed decisions, and achieve your financial goals faster. From seamless transactions to comprehensive financial insights, we've got you covered.</p>
       	<p>To get started, please verify your email address using the OTP code below:</p>
        <p style="text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #007bff;">${otpCode}</span>
        </p>
        <p>Once your email is verified, you'll have full access to all our features, including secure transfers, bill payments, and personalized financial advice.</p>
        <p>Feel free to explore our app and discover how Bankedly can help you take control of your financial future. If you have any questions or need assistance, our support team is always here to help.</p>
        <p>Thank you for choosing Bankedly. Your financial journey starts now!</p>
        <p>Best regards,</p>
        <p>Bankedly Team</p>
        <p><strong>P.S. Stay tuned for exciting updates and new features coming your way! 🌟</strong></p>
      </div>
    </div>
  </body>`
}

export const forgotPasswordEmail = ({
	recipientName,
	otpCode
}: ForgotPasswordEmailDto) => {
	return `
  <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center;">
        <h1 style="color: #333;">Change Password Request</h1>
      </div>
    </div>

    <div style="padding: 20px;">
      <p>Hi ${recipientName},</p>
      <p>We received your request to change your password. To proceed, please use the following OTP code:</p>

      <strong>OTP Code: ${otpCode}</strong>

      <p>If you didn't initiate this request, please ignore this message. Your account security is important to us.</p>

      <p>Best regards,<br>Bankedly Team</p>
    </div>
  </body>
  `
}
