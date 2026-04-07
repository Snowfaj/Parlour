const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (email, name) => {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Booking Confirmed 🎉",
      html: `
        <h2>Hello ${name}</h2>
        <p>Your booking is confirmed ✅</p>
        <p>Thank you for choosing Glamour Parlour 💇‍♀️</p>
      `,
    });

    console.log("✅ Email sent:", response);
    return response;
  } catch (error) {
    console.error("❌ Email error:", error);
    throw error;
  }
};

module.exports = { sendMail };
