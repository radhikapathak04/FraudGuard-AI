const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error('SQLite initialization error:', err.message);
    process.exit(1);
  }
});

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

// Initialize database tables
db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS scans (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    result TEXT NOT NULL,
    confidence REAL NOT NULL,
    details TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(_id)
  )`);
});

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.get('/', (req, res) => {
  res.send('Fraud Detection Backend');
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await runQuery(
      'INSERT INTO users (name, email, password, createdAt) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, new Date().toISOString()]
    );

    const userId = result.lastID;
    const token = jwt.sign({ _id: userId, name, email }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

    res.json({ token, user: { _id: userId, name, email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const responses = {
      phishing: "Phishing emails are deceptive messages designed to steal your personal information. Here's how to protect yourself:\n\n✓ **Red Flags to Watch:**\n- Urgent language or threats (e.g., 'Account will be closed')\n- Requests for passwords, credit cards, or personal data\n- Suspicious sender addresses that look similar but aren't quite right\n- Spelling and grammar errors\n- Suspicious links or attachments\n\n✓ **Best Practices:**\n- Always hover over links to see the actual URL before clicking\n- Verify sender email addresses carefully\n- Never enter credentials through email links\n- Contact your bank directly using the number on your statement\n- Use our Email Scanner tool to analyze suspicious messages\n\n🔒 Remember: Legitimate companies never ask for sensitive information via email!",
      sms: "SMS scams (smishing) are rapidly growing threats. Let me help you stay safe:\n\n✓ **Common SMS Scam Types:**\n- 'Congratulations! You've won a prize!' - Fake lottery/contest wins\n- 'Verify your bank account' - Credential theft\n- 'Package delivery' - Shipping scams with malicious links\n- 'Job offer requiring upfront payment' - Financial fraud\n- 'OTP verification' - Account takeover attempts\n\n✓ **Safety Tips:**\n- Never click links from unknown senders\n- Don't reply to suspicious messages\n- Official companies won't ask for verification via SMS\n- Block and report spam messages\n- Use our SMS Scanner for suspicious messages\n\n⚠️ **Pro Tip:** Enable 2FA but use authenticator apps instead of SMS when possible!",
      links: "Link safety is crucial in today's digital world. Here's your complete guide:\n\n✓ **Visual Inspection:**\n- Check for HTTPS (secure) vs HTTP (insecure)\n- Verify the domain matches the company you expect\n- Look for misspellings (e.g., 'g00gle.com' instead of 'google.com')\n- Be wary of unusual TLDs (.tk, .ga, etc.)\n\n✓ **Advanced Checks:**\n- Hover over links to see the actual URL\n- Use our Link Detector tool for instant analysis\n- Check the website's SSL certificate\n- Look for site security seals and trust badges\n\n✓ **Shortened URL Warning:**\n- Links like bit.ly, tinyurl, or goo.gl can hide malicious destinations\n- Always try to expand shortened URLs before clicking\n- Use URL expansion tools\n\n🛡️ Use our platform's Link Detector for one-click verification!",
      fraud: "If you suspect fraud, act quickly! Here's your action plan:\n\n✓ **Immediate Actions (First 24 Hours):**\n1. Stop all communication with the suspected fraudster\n2. Document everything (screenshots, emails, messages)\n3. Contact your bank or financial institution immediately\n4. Place a fraud alert with credit bureaus\n5. Change all passwords from a secure device\n\n✓ **Reporting:**\n- FTC: ReportFraud.ftc.gov\n- Local police: File a police report\n- FBI: ic3.gov (Internet Crime Complaint Center)\n- Financial institution: Report to your bank\n\n✓ **Recovery Steps:**\n- Monitor credit reports for unauthorized accounts\n- Set up credit monitoring services\n- Consider a credit freeze\n- Review statements carefully for 30+ days\n\n✓ **Documentation:**\n- Keep copies of all reports filed\n- Track communication with authorities\n- Save all evidence\n\n💡 Use our Scanner tools to analyze suspicious content and generate reports!",
      password: "Strong passwords are your first line of defense against unauthorized access:\n\n✓ **Password Requirements:**\n- At least 12-16 characters (longer is better!)\n- Mix uppercase and lowercase letters\n- Include numbers and special characters (!@#$%^&*)\n- Avoid personal information (birthdays, names)\n- Don't reuse passwords across accounts\n\n✓ **Password Strategy:**\n- Use passphrases instead of single words\n- Create unique passwords for each account\n- Change passwords after security breaches\n- Use a password manager (1Password, Bitwarden, LastPass)\n\n✓ **What NOT to Do:**\n- Don't share passwords via email or chat\n- Don't use common patterns (123456, qwerty)\n- Don't write passwords on sticky notes\n- Don't use the same password everywhere\n\n🔐 **Pro Tip:** Use a password manager like Bitwarden (free) to generate and store strong, unique passwords for all your accounts!",
      "two-factor": "Two-factor authentication (2FA) significantly increases your account security:\n\n✓ **How It Works:**\nEven if someone steals your password, they can't access your account without the second factor.\n\n✓ **Best 2FA Methods (Ranked):**\n1. **Authenticator Apps** (Best) - Google Authenticator, Authy, Microsoft Authenticator\n2. **Hardware Keys** (Best) - YubiKey, Google Titan\n3. **Backup Codes** (Good) - Save these somewhere safe\n4. **SMS Messages** (Fair) - Better than nothing, but can be intercepted\n5. **Email** (Acceptable) - If nothing else is available\n\n✓ **How to Enable 2FA:**\n- Go to account security settings\n- Look for 'Two-Factor Authentication' or '2FA'\n- Choose your preferred method\n- Save backup codes in a secure place\n\n✓ **Must-Protect Accounts:**\n- Email (gateway to all other accounts)\n- Banking and financial institutions\n- Social media accounts\n- Work/productivity accounts\n\n🔒 **Important:** Never share your 2FA codes with anyone, including support staff!",
      malware: "Malware is malicious software designed to harm your devices. Here's your protection guide:\n\n✓ **Common Malware Types:**\n- **Viruses:** Self-replicating programs attached to files\n- **Trojans:** Disguised programs that open backdoors\n- **Ransomware:** Encrypts files and demands payment\n- **Spyware:** Secretly monitors your activity\n- **Adware:** Displays unwanted advertisements\n\n✓ **Protection Strategy:**\n1. Keep OS updated with latest security patches\n2. Install reputable antivirus (Windows Defender, Bitdefender, Norton)\n3. Keep all software updated\n4. Use firewall protection\n5. Enable automatic scans weekly\n\n✓ **Safe Browsing Habits:**\n- Download only from official sources\n- Don't open attachments from unknown senders\n- Be cautious with USB drives from untrusted sources\n- Avoid pirated software and movies\n- Use adblockers on websites\n\n✓ **If Infected:**\n1. Disconnect from the internet\n2. Run malware scan in Safe Mode\n3. Consider professional help if serious\n4. Change passwords on a clean device\n\n🛡️ Use our tools to scan emails and links before clicking!",
      default: "Welcome to FraudGuard AI! I'm here to help you stay safe online. I can assist with:\n\n💬 **What I Can Help With:**\n- **Phishing Detection** - How to spot fake emails\n- **Scam Prevention** - SMS, link, and fraud awareness\n- **Password Security** - Creating strong, secure passwords\n- **2FA Setup** - Protecting your accounts\n- **Malware Protection** - Keeping your devices safe\n- **General Cybersecurity** - Online safety best practices\n\n🛠️ **Our Tools:**\n- Email Scanner - Analyze suspicious emails\n- SMS Scanner - Check text messages\n- Link Detector - Verify URLs before clicking\n- Reports - View your security history\n\nWhat cybersecurity topic would you like to learn about? Just ask me anything!"
    };

    const lowerMessage = message.toLowerCase();
    let response = responses.default;

    if (lowerMessage.includes('phishing') || lowerMessage.includes('email') || 
        lowerMessage.includes('scam email') || lowerMessage.includes('suspicious email')) {
      response = responses.phishing;
    } else if (lowerMessage.includes('sms') || lowerMessage.includes('text') || 
               lowerMessage.includes('message') || lowerMessage.includes('smishing')) {
      response = responses.sms;
    } else if (lowerMessage.includes('link') || lowerMessage.includes('url') || 
               lowerMessage.includes('website') || lowerMessage.includes('shorten')) {
      response = responses.links;
    } else if (lowerMessage.includes('fraud') || lowerMessage.includes('scam') || 
               lowerMessage.includes('suspicious') || lowerMessage.includes('what if')) {
      response = responses.fraud;
    } else if (lowerMessage.includes('password') || lowerMessage.includes('secure') || 
               lowerMessage.includes('strong') || lowerMessage.includes('login')) {
      response = responses.password;
    } else if (lowerMessage.includes('two-factor') || lowerMessage.includes('2fa') || 
               lowerMessage.includes('authentication') || lowerMessage.includes('verify')) {
      response = responses["two-factor"];
    } else if (lowerMessage.includes('malware') || lowerMessage.includes('virus') || 
               lowerMessage.includes('antivirus') || lowerMessage.includes('ransomware')) {
      response = responses.malware;
    }

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const scanIndicators = (content: string, patterns: { label: string; regex: RegExp }[]) => {
  return patterns.reduce<string[]>((matches, pattern) => {
    if (pattern.regex.test(content)) {
      matches.push(pattern.label)
    }
    return matches
  }, [])
}

const computeConfidence = (matchCount: number, base: number) => {
  return Math.min(0.99, base + Math.min(matchCount, 5) * 0.05 + Math.random() * 0.03)
}

const saveScan = async (userId, type, content, result, confidence, details) => {
  const response = await runQuery(
    'INSERT INTO scans (userId, type, content, result, confidence, details, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, type, content, result, confidence, details, new Date().toISOString()]
  );
  return response.lastID;
};

app.post('/api/scan/email', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const lower = content.toLowerCase();
    const emailPatterns = [
      { label: 'Urgent or threatening language detected', regex: /urgent|immediately|as soon as possible|account will be closed|final notice/i },
      { label: 'Verification or account update request detected', regex: /verify your account|update your account|confirm your identity|account suspended|security alert/i },
      { label: 'Suspicious link or URL detected', regex: /https?:\/\/|click here|login now|verify now|reset your password/i },
      { label: 'Payment or financial request detected', regex: /payment|invoice|bank|credit card|paypal|transfer/i },
      { label: 'Mismatch or unusual greeting detected', regex: /dear customer|valued customer|sir\/madam|hello there/i }
    ]

    const matches = scanIndicators(lower, emailPatterns)
    const result = matches.length >= 2 ? 'fraud' : 'safe'
    const confidence = computeConfidence(matches.length, result === 'fraud' ? 0.7 : 0.88)
    const details = matches.length > 0
      ? `Detected suspicious indicators:\n- ${matches.join('\n- ')}\n\nReview the email content carefully before responding or clicking any links.`
      : 'No strong phishing indicators were found. The email appears low risk.'

    const scanId = await saveScan(req.user._id, 'email', content, result, confidence, details)
    res.json({ result, confidence, scanId, details })
  } catch (error) {
    console.error('Email scan error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/scan/sms', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const lower = content.toLowerCase();
    const smsPatterns = [
      { label: 'Prize or lottery offer detected', regex: /won|lottery|prize|congratulations|claim your reward/i },
      { label: 'Urgent payment or penalty detected', regex: /urgent payment|due now|late fee|account suspended|pay immediately/i },
      { label: 'Verification or OTP request detected', regex: /otp|one-time password|verification code|confirm your number/i },
      { label: 'Unsolicited offer or loan detected', regex: /loan|investment|easy money|work from home/i },
      { label: 'Spoofed institution or bank warning detected', regex: /bank|paypal|apple|amazon|google|visa|mastercard|chase/i }
    ]

    const matches = scanIndicators(lower, smsPatterns)
    const result = matches.length >= 2 ? 'fraud' : 'safe'
    const confidence = computeConfidence(matches.length, result === 'fraud' ? 0.68 : 0.86)
    const details = matches.length > 0
      ? `Detected risky SMS patterns:\n- ${matches.join('\n- ')}\n\nAvoid clicking links or replying to suspicious senders.`
      : 'No significant scam patterns were detected. The SMS appears low risk.'

    const scanId = await saveScan(req.user._id, 'sms', content, result, confidence, details)
    res.json({ result, confidence, scanId, details })
  } catch (error) {
    console.error('SMS scan error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/scan/link', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const normalized = content.trim().toLowerCase();
    const linkPatterns = [
      { label: 'Non-HTTPS URL detected', regex: /^(http:\/\/)/i },
      { label: 'URL shortener detected', regex: /(bit\.ly|tinyurl\.com|goo\.gl|t\.co|ow\.ly)/i },
      { label: 'IP address or obfuscated domain detected', regex: /(^https?:\/\/\d+\.\d+\.\d+\.\d+)/i },
      { label: 'Suspicious or fake brand name detected', regex: /(login|secure|verify|account|update|support)/i },
      { label: 'Unusual top-level domain detected', regex: /\.(tk|ga|cf|ml|gq|biz|info)(\/|$)/i }
    ]

    const matches = scanIndicators(normalized, linkPatterns)
    const result = matches.length >= 2 ? 'suspicious' : 'safe'
    const confidence = computeConfidence(matches.length, result === 'suspicious' ? 0.72 : 0.94)
    const details = matches.length > 0
      ? `Detected suspicious URL features:\n- ${matches.join('\n- ')}\n\nProceed with caution and avoid entering credentials.`
      : 'No suspicious link patterns were detected. The URL appears safe.'

    const scanId = await saveScan(req.user._id, 'link', content, result, confidence, details)
    res.json({ result, confidence, scanId, details })
  } catch (error) {
    console.error('Link scan error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/history', verifyToken, async (req, res) => {
  try {
    const userScans = await allQuery(
      'SELECT * FROM scans WHERE userId = ? ORDER BY datetime(createdAt) DESC LIMIT 50',
      [req.user._id]
    )
    res.json(userScans)
  } catch (error) {
    console.error('History error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/reports', verifyToken, async (req, res) => {
  try {
    const userScans = await allQuery('SELECT * FROM scans WHERE userId = ?', [req.user._id]);
    const totalScans = userScans.length;
    const fraudScans = userScans.filter(s => s.result === 'fraud').length;
    const safeScans = userScans.filter(s => s.result === 'safe').length;
    const suspiciousScans = userScans.filter(s => s.result === 'suspicious').length;
    const emailScans = userScans.filter(s => s.type === 'email').length;
    const smsScans = userScans.filter(s => s.type === 'sms').length;
    const linkScans = userScans.filter(s => s.type === 'link').length;
    const averageConfidence = totalScans > 0
      ? (userScans.reduce((sum, scan) => sum + scan.confidence, 0) / totalScans).toFixed(1)
      : 0;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentScans = userScans.filter(s => new Date(s.createdAt) > sevenDaysAgo).length;

    const reportData = {
      totalScans,
      fraudScans,
      safeScans,
      suspiciousScans,
      emailScans,
      smsScans,
      linkScans,
      recentScans,
      accuracy: totalScans > 0 ? ((safeScans + suspiciousScans) / totalScans * 100).toFixed(1) : 0,
      averageConfidence,
      fraudRate: totalScans > 0 ? ((fraudScans / totalScans) * 100).toFixed(1) : 0,
      highRiskScans: userScans.filter(s => s.confidence >= 0.90 && (s.result === 'fraud' || s.result === 'suspicious')).length
    };

    res.json(reportData);
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});