// generate-vercel.js
const fs = require("fs");

// ✅ just edit these two arrays
const htbRestricted = ["openadmin", "codetwo", "previous"];
const thmRestricted = ["ignite", "rootme", "picklerick"];

// 🚀 build redirects
const redirects = [
  ...htbRestricted.map(name => ({
    source: `/machines/htb/${name}`,
    destination: "/403.html",
    permanent: false
  })),
  ...htbRestricted.map(name => ({
    source: `/machines/htb/${name}/:path*`,
    destination: "/403.html",
    permanent: false
  })),
  ...thmRestricted.map(name => ({
    source: `/machines/thm/${name}`,
    destination: "/403.html",
    permanent: false
  })),
  ...thmRestricted.map(name => ({
    source: `/machines/thm/${name}/:path*`,
    destination: "/403.html",
    permanent: false
  }))
];

// Load existing vercel.json
const vercelConfig = JSON.parse(fs.readFileSync("vercel.json", "utf8"));

// Overwrite only redirects
vercelConfig.redirects = redirects;

// Save back
fs.writeFileSync("vercel.json", JSON.stringify(vercelConfig, null, 2));
console.log(`✅ vercel.json updated with ${redirects.length} redirect rules`);