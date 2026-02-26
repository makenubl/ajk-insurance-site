AJK Insurance Brokers — Gmail SMTP package

Files included:
- index.html
- styles.css
- app.js
- /api/submit.js   (Vercel serverless function using nodemailer -> Gmail)
- /assets/*        (images)
- admin.html       (frontend admin settings page)

Frontend admin page:
- URL: /admin.html
- Username: admin
- Password: admin123

Info needed to make email work:
- EmailJS Service ID
- EmailJS Template ID
- EmailJS Public Key
- (Optional for Netlify Gmail backend) GMAIL_USER
- (Optional for Netlify Gmail backend) GMAIL_APP_PASSWORD (Google 16-char app password)
- (Optional for Netlify Gmail backend) RECIPIENT_EMAIL

Required environment variables (Vercel Project Settings):
- SMTP_USER = khan@ajk-insurance.com    <-- your Gmail/Workspace email to send from
- SMTP_PASS = <Google App Password (16 chars)>   <-- generate in Google Account (see below)
- ADMIN_EMAIL = khan@ajk-insurance.com  <-- destination for leads
- FROM_NAME = "AJK Insurance"                    <-- optional

How to generate Google App Password:
1. Ensure the SMTP_USER account has 2-Step Verification enabled.
2. Go to Google Account -> Security -> App passwords.
3. Create an app password for 'Mail' and device name like 'Vercel'.
4. Copy the 16-character password and paste into Vercel as SMTP_PASS.

Deployment:
1) Zip this folder and Upload Project on Vercel OR push to GitHub and import.
2) Add the environment variables in Vercel as above.
3) Deploy. Test the form: fill and submit — email should arrive at ADMIN_EMAIL.

Notes:
- If you're using Google Workspace (company email), App Passwords may be disabled by admin. If so, ask your GWorkspace admin to enable App Passwords or create a sending SMTP account.
- Alternative: use SendGrid (if App Passwords not possible) — tell me and I will switch.
