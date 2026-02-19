# KreyòlAIHub — Website Deployment Guide
## GitHub Pages + GoDaddy Custom Domain (FREE)

---

## 📁 FILES IN THIS FOLDER

| File | Purpose |
|------|---------|
| `index.html` | Main landing page (Demo Wall, email capture, consulting) |
| `course.html` | Course platform (login, 30 lessons, quiz, certificate) |
| `README.md` | This guide |

---

## PART 1 — CREATE YOUR GITHUB ACCOUNT (5 minutes)

1. Go to **https://github.com**
2. Click **"Sign up"** (top right)
3. Choose a username — use `KreyolAIHub` or your name
4. Enter email + password
5. Verify your email address
6. You now have a free GitHub account ✓

---

## PART 2 — CREATE YOUR REPOSITORY (5 minutes)

A "repository" = a folder on GitHub that holds your website files.

1. Once logged in, click the **green "New"** button (top left)
   — OR go to: **https://github.com/new**

2. Fill in the form:
   - **Repository name:** `KreyolAIHub` ← IMPORTANT: must match your username
   - **Description:** `Premye platfòm AI an Kreyòl`
   - **Visibility:** ✅ Public (required for free GitHub Pages)
   - Leave everything else as default

3. Click **"Create repository"** (green button)

---

## PART 3 — UPLOAD YOUR FILES (5 minutes)

1. On your new repository page, click **"uploading an existing file"** link
   (or drag & drop)

2. Drag BOTH files into the upload area:
   - `index.html`
   - `course.html`

3. At the bottom, add a commit message: `"Initial website upload"`

4. Click **"Commit changes"** (green button)

Your files are now on GitHub ✓

---

## PART 4 — ENABLE GITHUB PAGES (3 minutes)

GitHub Pages = free web hosting for your site.

1. On your repository page, click **"Settings"** (top menu)
2. In the left sidebar, scroll down and click **"Pages"**
3. Under **"Source"**, select:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **"Save"**
5. Wait 2–3 minutes

GitHub will show you a URL like:
`https://YOUR-USERNAME.github.io/KreyolAIHub`

✅ Your site is now live for FREE!

---

## PART 5 — CONNECT YOUR GODADDY DOMAIN (10 minutes)

This makes `kreyolaihub.com` point to your GitHub Pages site.

### Step A — In GitHub (add your custom domain)

1. Go to your repository **Settings → Pages**
2. Under **"Custom domain"**, type: `kreyolaihub.com`
3. Click **"Save"**
4. ✅ Check **"Enforce HTTPS"** (for the padlock icon)
5. GitHub will create a file called `CNAME` automatically — leave it alone

### Step B — In GoDaddy (update DNS records)

1. Log in to **https://godaddy.com**
2. Click your name (top right) → **"My Products"**
3. Find `kreyolaihub.com` → click **"DNS"** (or "Manage DNS")
4. You need to add these records:

**Delete any existing A records first**, then add these 4 new A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

**Then add this CNAME record:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR-USERNAME.github.io | 600 |

Replace `YOUR-USERNAME` with your actual GitHub username.

5. Click **Save** after each record

### Step C — Wait for DNS to update

- DNS changes take **5 minutes to 48 hours** (usually under 1 hour)
- Check progress at: **https://dnschecker.org** → enter `kreyolaihub.com`
- When you see green checkmarks → your site is live at `kreyolaihub.com` ✓

---

## PART 6 — SET UP SUPABASE (FREE accounts & email capture)

Without Supabase, the site works with browser storage (fine to start).
With Supabase, you get real user accounts, email lists, and a database.

### Create Free Account

1. Go to **https://supabase.com**
2. Click **"Start your project"** → Sign up with GitHub (easiest)
3. Click **"New project"**
   - Name: `kreyolaihub`
   - Password: create a strong password (save it!)
   - Region: choose closest to your users (US East for diaspora, or EU)
4. Wait ~2 minutes for setup

### Get Your Keys

1. In your Supabase project, click **"Settings"** (gear icon, left sidebar)
2. Click **"API"**
3. Copy:
   - **Project URL** (looks like: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Add Keys to Your Website Files

In BOTH `index.html` AND `course.html`, find this section near the top of the `<script>` tag:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
```

Replace with your actual values:
```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Create Database Tables

In Supabase, click **"SQL Editor"** and run this:

```sql
-- Email waitlist table
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notify list for Lakay Pale / Gran AI
CREATE TABLE notify_list (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  product TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (keeps data safe)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notify_list ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (sign up)
CREATE POLICY "Anyone can join waitlist" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can join notify" ON notify_list FOR INSERT WITH CHECK (true);
```

Click **"Run"** ✅

Now when people sign up on your site, you'll see their emails in:
Supabase → **Table Editor** → `waitlist`

---

## PART 7 — UPDATE YOUR WEBSITE (whenever you make changes)

### Easy method (drag & drop):
1. Go to your GitHub repository
2. Click **"Add file"** → **"Upload files"**
3. Drag the updated file(s)
4. Add message: `"Update homepage"` or whatever changed
5. Click **"Commit changes"**
6. Wait 1–2 minutes → changes are live ✓

### When Lakay Pale & Gran AI are ready:
In `index.html`, find the Demo Wall section and replace the "Coming Soon" panels.

For **Lakay Pale** — replace this:
```html
<div class="demo-placeholder">
  <div class="demo-icon">🎙️</div>
  <span class="coming-badge">COMING SOON — Lakay Pale</span>
  ...
</div>
```

With this (replace URL with your actual Streamlit app URL):
```html
<iframe src="https://YOUR-LAKAY-PALE-APP.streamlit.app"
  class="demo-iframe" title="Lakay Pale"></iframe>
```

For **Gran AI** — same approach with its URL.

---

## PART 8 — LINK CHECKER

After your site is live, verify everything works:

- [ ] `https://kreyolaihub.com` loads the homepage
- [ ] `https://kreyolaihub.com/course.html` loads the course platform
- [ ] Email signup works (check Supabase waitlist table)
- [ ] Course registration creates an account
- [ ] Demo Wall translator works (try typing English text)
- [ ] Mobile view looks good (test on your phone)
- [ ] HTTPS padlock shows in browser (may take up to 24h)

---

## QUICK REFERENCE — IMPORTANT LINKS

| Service | URL | Purpose |
|---------|-----|---------|
| GitHub | github.com | Host your website files (FREE) |
| GitHub Pages | Settings → Pages | Enable free hosting |
| Supabase | supabase.com | User accounts & email list (FREE) |
| GoDaddy DNS | godaddy.com → Domains → DNS | Connect your domain |
| DNS Checker | dnschecker.org | Verify domain is working |

---

## TROUBLESHOOTING

**Site not loading after enabling GitHub Pages?**
→ Wait 5 more minutes. Check Settings → Pages to see if it shows a URL.

**Domain not working after GoDaddy DNS changes?**
→ DNS can take up to 48 hours. Use dnschecker.org to monitor.

**Users can't register on the course platform?**
→ Check that your Supabase keys are correctly pasted in both files.
→ If Supabase not set up yet, registration uses browser storage — still works!

**"Custom domain" showing error in GitHub?**
→ Make sure you added all 4 GitHub IP addresses in GoDaddy DNS.
→ Make sure the CNAME record points to `YOUR-USERNAME.github.io` (not the full URL).

---

## ESTIMATED COSTS

| Item | Cost |
|------|------|
| GitHub Pages hosting | FREE |
| Supabase (up to 50,000 users) | FREE |
| GoDaddy domain (kreyolaihub.com) | Already paid ✓ |
| **Total monthly cost** | **£0 / $0** |

---

*KreyòlAIHub © 2026 — AI an Kreyòl. San limit.*
