const fs = require('fs');
const path = require('path');

// Create a local email directory if it doesn't exist
const emailDir = path.join(__dirname, '..', 'temp-emails');
if (!fs.existsSync(emailDir)) {
  fs.mkdirSync(emailDir, { recursive: true });
}

// Simulate email sending by saving to local files
const sendLocalEmail = async (mailOptions) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const messageId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const emailContent = {
    messageId,
    timestamp,
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
    sentAt: new Date().toISOString()
  };
  
  // Save to file
  const filename = `email-${timestamp}.json`;
  const filepath = path.join(emailDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(emailContent, null, 2));
  
  // Also save HTML for easy viewing
  const htmlFilename = `email-${timestamp}.html`;
  const htmlFilepath = path.join(emailDir, htmlFilename);
  
  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${mailOptions.subject}</title>
    <style>
        .email-header { 
            background: #f0f0f0; 
            padding: 20px; 
            border-bottom: 1px solid #ddd; 
            margin-bottom: 20px; 
        }
        .email-header h2 { margin: 0; color: #333; }
        .email-meta { font-size: 14px; color: #666; margin: 10px 0; }
        .email-content { padding: 0 20px; }
    </style>
</head>
<body>
    <div class="email-header">
        <h2>📧 Local Email Simulation</h2>
        <div class="email-meta"><strong>From:</strong> ${mailOptions.from}</div>
        <div class="email-meta"><strong>To:</strong> ${mailOptions.to}</div>
        <div class="email-meta"><strong>Subject:</strong> ${mailOptions.subject}</div>
        <div class="email-meta"><strong>Message ID:</strong> ${messageId}</div>
        <div class="email-meta"><strong>Sent:</strong> ${new Date().toLocaleString()}</div>
    </div>
    <div class="email-content">
        ${mailOptions.html}
    </div>
</body>
</html>`;
  
  fs.writeFileSync(htmlFilepath, fullHtml);
  
  console.log(`📧 Local email saved to: ${filename}`);
  console.log(`🌐 View email at: file:///${htmlFilepath.replace(/\\/g, '/')}`);
  
  return {
    messageId,
    localFile: filepath,
    htmlFile: htmlFilepath,
    accepted: [mailOptions.to],
    rejected: [],
    pending: [],
    response: 'Local email simulation - saved to file'
  };
};

module.exports = {
  sendLocalEmail,
  emailDir
};