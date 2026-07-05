const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

const sendVerificationEmail = async (email, name, code) => {
  await resend.emails.send({
    from: 'Vela <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your Vela account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f0f; color: white; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: white;">V</div>
          <h1 style="color: white; margin: 16px 0 8px; font-size: 24px;">Welcome to Vela, ${name}!</h1>
          <p style="color: #9ca3af; margin: 0;">Enter this code to verify your account</p>
        </div>
        <div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Your verification code</p>
          <p style="color: white; font-size: 36px; font-weight: 800; letter-spacing: 8px; margin: 0;">${code}</p>
          <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0;">Expires in 10 minutes</p>
        </div>
        <p style="color: #6b7280; font-size: 13px; text-align: center;">If you didn't create a Vela account, ignore this email.</p>
      </div>
    `
  })
}

const sendPasswordResetEmail = async (email, name, code) => {
  await resend.emails.send({
    from: 'Vela <onboarding@resend.dev>',
    to: email,
    subject: 'Reset your Vela password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f0f; color: white; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a855f7, #ec4899); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; color: white;">V</div>
          <h1 style="color: white; margin: 16px 0 8px; font-size: 24px;">Reset your password</h1>
          <p style="color: #9ca3af; margin: 0;">Use this code to reset your Vela password</p>
        </div>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Your reset code</p>
          <p style="color: white; font-size: 36px; font-weight: 800; letter-spacing: 8px; margin: 0;">${code}</p>
          <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0;">Expires in 10 minutes</p>
        </div>
        <p style="color: #6b7280; font-size: 13px; text-align: center;">If you didn't request this, ignore this email.</p>
      </div>
    `
  })
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail }