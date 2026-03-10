#!/usr/bin/env npx ts-node

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://cms.neli.swisscom.com/api";
const DELAY_MS = 500;
const OUTPUT_PATH = path.join(__dirname, "lib", "neliData.json");

// Support both:
//   getNeliInfo.ts "Bearer TOKEN" USERID
//   getNeliInfo.ts Bearer TOKEN USERID
let token: string;
let initialUser: string;
if (process.argv[2]?.toLowerCase() === "bearer") {
  token = `Bearer ${process.argv[3]}`;
  initialUser = process.argv[4] ?? "";
} else {
  token = process.argv[2] ?? "";
  initialUser = process.argv[3] ?? "";
}

if (!token || !initialUser) {
  console.error('Usage: npx ts-node getNeliInfo.ts "Bearer XXXXXXXX" "<userId>"');
  process.exit(1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const HEADERS: Record<string, string> = {
  Authorization: token,
  Referer: "https://neli.swisscom.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36 Edg/145.0.0.0",
  Accept: "application/json, text/plain, */*",
  "sec-ch-ua": '"Not:A-Brand";v="99", "Microsoft Edge";v="145", "Chromium";v="145"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
};

function get(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { headers: HEADERS }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}: ${body}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error(`Failed to parse JSON from ${url}: ${body}`));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

// ─── Neli API types ───────────────────────────────────────────────────────────

interface LanguageSkill {
  code: string;
  level: string;
}

interface ProfileDoc {
  id: string;
  location?: { city?: string; country?: string; abbreviation?: string; office?: string };
  department?: string;
  departmentDescription?: string;
  languageSkills?: LanguageSkill[];
  hobbies?: string;
  jobTitle?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  lineManager?: string;
}

interface NeliUser {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  account_name?: string;
  function?: string;
  department?: string;
  profile?: { docs?: ProfileDoc[] };
}

interface Organisation {
  team?: string[];
}

// ─── Output types (matching lib/types/index.ts User) ─────────────────────────

interface OutUser {
  dn: string;
  cn: string;
  username: string;
  mail: string;
  title: string;
  department: string;
  phone: string;
  mobile: string;
  office: string;
  city: string;
  country: string;
  company: string;
  manager: string; // DN of manager
  photo: null;
}

interface OrgNode {
  dn: string;
  name: string;
  children: OrgNode[];
}

// ─── Accumulator ──────────────────────────────────────────────────────────────

const collectedUsers = new Map<string, OutUser>();   // neliId → OutUser
const collectedSkills = new Map<string, string[]>(); // dn → skills[]

function makeDn(firstname: string, lastname: string): string {
  return `CN=${firstname} ${lastname},OU=Swisscom,DC=swisscom,DC=com`;
}

// ─── Dept tree builder ────────────────────────────────────────────────────────

function buildDeptTree(users: OutUser[]): OrgNode {
  const root: OrgNode = { dn: "", name: "Swisscom", children: [] };
  const nodeMap = new Map<string, OrgNode>();
  nodeMap.set("", root);

  // Sort dept codes so parents are always created before children
  const allDepts = [...new Set(users.map((u) => u.department).filter(Boolean))].sort();

  for (const dept of allDepts) {
    const parts = dept.split("-");
    for (let i = 1; i <= parts.length; i++) {
      const path = parts.slice(0, i).join("-");
      if (!nodeMap.has(path)) {
        const node: OrgNode = { dn: path, name: parts[i - 1], children: [] };
        nodeMap.set(path, node);
        const parentPath = parts.slice(0, i - 1).join("-");
        const parent = nodeMap.get(parentPath) ?? root;
        parent.children.push(node);
      }
    }
  }

  return root;
}

function languageLabel(code: string): string {
  const names: Record<string, string> = {
    en: "English", fr: "French", de: "German", it: "Italian",
    es: "Spanish", pt: "Portuguese", nl: "Dutch", pl: "Polish",
    ro: "Romanian", sv: "Swedish", da: "Danish", fi: "Finnish",
    nb: "Norwegian", hu: "Hungarian", cs: "Czech", sk: "Slovak",
    hr: "Croatian", sl: "Slovenian", bg: "Bulgarian", el: "Greek",
    tr: "Turkish", ru: "Russian", uk: "Ukrainian", ar: "Arabic",
    zh: "Chinese", ja: "Japanese", ko: "Korean",
  };
  return names[code] ?? code.toUpperCase();
}

function extractSkills(doc: ProfileDoc): string[] {
  const skills: string[] = [];

  for (const ls of doc.languageSkills ?? []) {
    if (ls.code && ls.level) {
      skills.push(`${languageLabel(ls.code)} ${ls.level}`);
    }
  }

  if (doc.hobbies) {
    for (const hobby of doc.hobbies.split(",")) {
      const trimmed = hobby.trim();
      if (trimmed) skills.push(trimmed);
    }
  }

  return skills;
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function getUser(userId: string): Promise<NeliUser> {
  const url = `${BASE_URL}/users/${userId}?depth=2&locale=en`;
  const data = (await get(url)) as NeliUser;
  console.log(`User: ${data.firstname ?? "(no firstname)"} ${data.lastname ?? "(no lastname)"}`);
  return data;
}

async function getOrganisation(profileId: string): Promise<Organisation> {
  const url = `${BASE_URL}/userProfiles/${profileId}/organisation`;
  const data = (await get(url)) as Organisation;
  console.log(`  Team members: ${data.team?.length ?? 0}`);
  return data;
}

// ─── User fetcher ─────────────────────────────────────────────────────────────

async function processUser(
  userId: string,
  managerDn: string | null,
  visited: Set<string>
): Promise<void> {
  if (visited.has(userId)) return;
  visited.add(userId);

  const user = await getUser(userId);
  const profileId = user.profile?.docs?.[0]?.id;
  if (!profileId) {
    console.warn(`  No profile.docs[0].id for user ${userId}`);
    return;
  }

  const doc = user.profile!.docs![0];
  const firstname = user.firstname ?? "";
  const lastname = user.lastname ?? "";
  const dn = makeDn(firstname, lastname);

  const outUser: OutUser = {
    dn,
    cn: `${firstname} ${lastname}`.trim(),
    username: user.account_name ?? "",
    mail: user.email ?? "",
    title: doc.jobTitle ?? user.function ?? "",
    department: user.department ?? "",
    phone: doc.phone ?? "",
    mobile: doc.mobile ?? "",
    office: doc.location?.abbreviation ?? doc.location?.office ?? "",
    city: doc.location?.city ?? "",
    country: doc.location?.country ?? "",
    company: doc.company ?? "Swisscom",
    manager: managerDn ?? "",
    photo: null,
  };

  collectedUsers.set(userId, outUser);
  collectedSkills.set(dn, extractSkills(doc));

  await sleep(DELAY_MS);

  const org = await getOrganisation(profileId);

  for (const memberId of org.team ?? []) {
    await sleep(DELAY_MS);
    await processUser(memberId, dn, visited);
  }
}

// ─── Merge helper ─────────────────────────────────────────────────────────────

function loadExisting(p: string): { users: OutUser[]; skills: Record<string, string[]> } {
  try {
    if (!fs.existsSync(p)) return { users: [], skills: {} };
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    return { users: raw.users ?? [], skills: raw.skills ?? {} };
  } catch {
    console.warn("Could not read existing neliData.json — starting fresh.");
    return { users: [], skills: {} };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  try {
    await processUser(initialUser, null, new Set());

    const existing = loadExisting(OUTPUT_PATH);

    // Merge users: existing first, new data wins on same dn
    const mergedUsersMap = new Map<string, OutUser>();
    for (const u of existing.users)          mergedUsersMap.set(u.dn, u);
    for (const u of collectedUsers.values()) mergedUsersMap.set(u.dn, u);
    const users = [...mergedUsersMap.values()];

    // Merge skills: same semantics
    const skills: Record<string, string[]> = { ...existing.skills };
    for (const [dn, s] of collectedSkills) skills[dn] = s;

    const tree = buildDeptTree(users);
    const output = { users, skills, tree };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

    console.log(
      `\nDone. ${users.length} total users (${collectedUsers.size} new/updated) written to ${OUTPUT_PATH}`
    );
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();
