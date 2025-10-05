const bcrypt = require('bcryptjs');

const users = [
  { username: 'alice', email: 'alice@example.com', hash: '$2a$10$YTj5zRjuAMJc6MIvWJCp2uTVKVIHV1IpDeURGkX4uSmz8DJ.DPW/G' },
  { username: 'bob', email: 'bob@example.com', hash: '$2a$10$FVjNV7KbO708v66Cj8Z6HeJ666ZDIQc11k7g15FY4t91PFMtaG0/e' },
  { username: 'charlie', email: 'charlie@example.com', hash: '$2a$10$IVcPaiCvPRvPmuPfm7jBDOY9igH.NLcfCqWAFsuqSpk2nW9KSIPCi' },
  { username: 'testuser', email: 'test@ecohost.com', hash: '$2a$10$c2gncm1KPpCYxj.BlDWW2.ZlYs7pZSHosTifkRmFI0o0XDzlMDVMO' }
];

const commonPasswords = ['password', 'password123', 'Password123', 'test123', 'Test123', 'alice123', 'bob123', 'charlie123', 'testuser123', 'ecohost123'];

async function findPasswords() {
  for (const user of users) {
    console.log(`\nTrying ${user.username} (${user.email}):`);
    for (const pwd of commonPasswords) {
      const match = await bcrypt.compare(pwd, user.hash);
      if (match) {
        console.log(`  ✓ Password found: ${pwd}`);
        break;
      }
    }
  }
}

findPasswords();
