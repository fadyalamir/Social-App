const EmailTemplate = (link) => {
  return `
  <div style="
    font-family: Arial, sans-serif;
    background-color: #f7f9fc;
    padding: 20px;
    text-align: center;
  ">
    <div style="
      background-color: #ffffff;
      max-width: 500px;
      margin: 0 auto;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    ">
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p style="color: #555; font-size: 16px;">
        Thanks for registering! Please confirm your email address by clicking the button below:
      </p>
      <a href="${link}" style="
        display: inline-block;
        background-color: #007bff;
        color: #fff;
        padding: 12px 25px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: bold;
        margin-top: 20px;
      ">
        Verify Email
      </a>
      <p style="color: #888; font-size: 14px; margin-top: 30px;">
        If the button doesn’t work, copy and paste this link into your browser:<br>
        <span style="color: #007bff;">${link}</span>
      </p>
    </div>
  </div>
  `;
};

module.exports = EmailTemplate;
