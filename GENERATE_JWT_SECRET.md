# How to Generate JWT_SECRET

## Method 1: Using Node.js (Recommended)

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a 64-character hexadecimal string like:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Copy this entire string** - this is your JWT_SECRET value.

## Method 2: Using OpenSSL

```bash
openssl rand -hex 32
```

## Method 3: Using PowerShell (Windows)

```powershell
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

## Method 4: Online Generator

Visit: https://randomkeygen.com/
- Use the "CodeIgniter Encryption Keys" section
- Copy a 64-character key

## Method 5: Manual Generation

You can also create a simple random string, but make sure it's:
- At least 32 characters long (64+ recommended)
- Random and unpredictable
- Not used anywhere else
- Example format: mix of letters, numbers, and special characters

## Important Notes

1. **Keep it secret** - Never commit this to Git or share it publicly
2. **Use different secrets** for development and production
3. **Store it securely** - Only in environment variables or secure vaults
4. **Length matters** - Longer is more secure (32+ bytes = 64+ hex characters)

## For Render.com

1. Go to your service → Environment tab
2. Find or create your group "q-enviro"
3. Click "Add Environment Variable"
4. Key: `JWT_SECRET`
5. Value: Paste the generated string (no quotes needed)
6. Save

The group name "q-enviro" is just for organization - it doesn't affect functionality.

