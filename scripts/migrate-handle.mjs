#!/usr/bin/env node
// Move one member onto a claimed handle. Dry-run unless --apply.
// Reads and writes the shared subx-skins Firestore (users/{uid} is global).
// Does not contain a uid. Example:
//   node scripts/migrate-handle.mjs --uid <uid> --handle <handle>
//   node scripts/migrate-handle.mjs --uid <uid> --handle <handle> --apply
//
// Auth: FIRESTORE_TOKEN, or `gcloud auth print-access-token`.
// --self-check exercises the plan only and does not touch the network.

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const HANDLE_RE = /^[a-z0-9_]{1,15}$/;

function parseArgs(argv) {
  const out = { apply: false, project: 'subx-skins', site: '', selfCheck: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') out.apply = true;
    else if (a === '--self-check') out.selfCheck = true;
    else if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--uid') out.uid = argv[++i];
    else if (a === '--handle') out.handle = argv[++i];
    else if (a === '--project') out.project = argv[++i];
    else if (a === '--site') out.site = argv[++i];
    else if (a === '--backup') out.backup = argv[++i];
    else throw new Error('Unknown argument ' + a);
  }
  return out;
}

function plan(before, args) {
  const uid = args.uid;
  const handle = String(args.handle || '');
  const user = before.user || null;
  const claim = before.claim || null;
  const oldHandle = user && user.handle && user.handle !== handle ? String(user.handle) : '';
  const oldClaim = oldHandle ? (before.oldClaim || null) : null;
  if (!uid) return { error: '--uid is required' };
  if (!HANDLE_RE.test(handle)) return { error: '--handle must match ' + HANDLE_RE };
  if (claim && claim.uid && claim.uid !== uid) {
    return { error: 'handles/' + handle + ' is owned by ' + claim.uid };
  }
  const site = args.site || (user && user.siteId) || '';
  const claimFields = { uid: uid };
  if (site) claimFields.siteId = site;
  const dropOld = !!(oldHandle && oldClaim && oldClaim.uid === uid);
  const sameUser = !!(user && user.handle === handle);
  const sameClaim = !!(claim && claim.uid === uid && (!site || claim.siteId === site));
  if (sameUser && sameClaim && !dropOld) return { writes: [], noop: true, oldHandle: oldHandle };
  const writes = [
    { kind: 'update', path: 'users/' + uid, fields: { handle: handle } },
    { kind: 'set', path: 'handles/' + handle, fields: claimFields }
  ];
  if (dropOld) writes.push({ kind: 'delete', path: 'handles/' + oldHandle });
  return { writes: writes, noop: false, oldHandle: oldHandle };
}

function fieldsToJson(fields) {
  const out = {};
  if (!fields) return out;
  Object.keys(fields).forEach(function (k) {
    const v = fields[k];
    if (v && Object.prototype.hasOwnProperty.call(v, 'stringValue')) out[k] = v.stringValue;
    else if (v && Object.prototype.hasOwnProperty.call(v, 'booleanValue')) out[k] = v.booleanValue;
    else if (v && Object.prototype.hasOwnProperty.call(v, 'integerValue')) out[k] = v.integerValue;
    else if (v && Object.prototype.hasOwnProperty.call(v, 'nullValue')) out[k] = null;
  });
  return out;
}

function jsonToFields(obj) {
  const fields = {};
  Object.keys(obj).forEach(function (k) {
    fields[k] = { stringValue: String(obj[k]) };
  });
  return fields;
}

function docName(project, docPath) {
  return 'projects/' + project + '/databases/(default)/documents/' + docPath;
}

function token() {
  if (process.env.FIRESTORE_TOKEN) return process.env.FIRESTORE_TOKEN.trim();
  return execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
}

async function api(project, access, method, suffix, body) {
  const url = 'https://firestore.googleapis.com/v1/projects/' + project + '/databases/(default)/documents' + suffix;
  const res = await fetch(url, {
    method: method,
    headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = {};
  if (text) {
    try { json = JSON.parse(text); } catch (e) { json = { raw: text }; }
  }
  if (!res.ok && res.status !== 404) {
    const msg = (json.error && json.error.message) || text || res.statusText;
    throw new Error('Firestore ' + res.status + ' ' + msg);
  }
  return { status: res.status, json: json };
}

async function readDoc(project, access, docPath, tx) {
  const q = tx ? ('?transaction=' + encodeURIComponent(tx)) : '';
  const res = await api(project, access, 'GET', '/' + docPath + q);
  if (res.status === 404 || !res.json.fields) return null;
  return fieldsToJson(res.json.fields);
}

function backupPath(args) {
  if (args.backup) return args.backup;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(os.tmpdir(), 'handle-backup-' + args.uid + '-' + stamp + '.json');
}

function writeBackup(file, payload) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
}

function selfCheck() {
  const uid = 'uid-a';
  const other = 'uid-b';
  const fresh = plan({ user: { handle: 'oldfan', siteId: '27chat' }, claim: null, oldClaim: { uid: uid } }, { uid: uid, handle: 'newfan' });
  if (fresh.error || fresh.noop || fresh.writes.length !== 3) throw new Error('fresh plan ' + JSON.stringify(fresh));
  if (fresh.writes[2].path !== 'handles/oldfan') throw new Error('old claim not deleted');
  const again = plan({ user: { handle: 'newfan', siteId: '27chat' }, claim: { uid: uid, siteId: '27chat' }, oldClaim: null }, { uid: uid, handle: 'newfan' });
  if (!again.noop || again.writes.length) throw new Error('not idempotent ' + JSON.stringify(again));
  const taken = plan({ user: null, claim: { uid: other }, oldClaim: null }, { uid: uid, handle: 'newfan' });
  if (!taken.error) throw new Error('taken claim should fail');
  const foreignOld = plan({ user: { handle: 'oldfan' }, claim: null, oldClaim: { uid: other } }, { uid: uid, handle: 'newfan' });
  if (foreignOld.writes.some(function (w) { return w.kind === 'delete'; })) throw new Error('deleted a foreign claim');
  const bad = plan({ user: null, claim: null, oldClaim: null }, { uid: uid, handle: 'No' });
  if (!bad.error) throw new Error('bad handle accepted');
  console.log('self-check ok');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfCheck) { selfCheck(); return; }
  if (args.help || !args.uid || !args.handle) {
    console.log('Usage: node scripts/migrate-handle.mjs --uid <uid> --handle <handle> [--site <siteId>] [--project subx-skins] [--backup <file>] [--apply]');
    console.log('Dry-run is the default. --apply commits one transaction. --self-check does not use the network.');
    process.exit(args.help ? 0 : 2);
  }
  const decided = plan({ user: null, claim: null, oldClaim: null }, args);
  if (decided.error && !args.uid) throw new Error(decided.error);
  if (!HANDLE_RE.test(args.handle)) throw new Error(decided.error || 'bad handle');
  const access = token();
  let tx = '';
  if (args.apply) {
    const begun = await api(args.project, access, 'POST', ':beginTransaction', {});
    tx = begun.json.transaction;
    if (!tx) throw new Error('beginTransaction returned no transaction');
  }
  const user = await readDoc(args.project, access, 'users/' + args.uid, tx);
  const claim = await readDoc(args.project, access, 'handles/' + args.handle, tx);
  const oldHandle = user && user.handle && user.handle !== args.handle ? user.handle : '';
  const oldClaim = oldHandle ? await readDoc(args.project, access, 'handles/' + oldHandle, tx) : null;
  const before = { uid: args.uid, handle: args.handle, readAt: new Date().toISOString(), user: user, claim: claim, oldClaim: oldClaim };
  const file = backupPath(args);
  writeBackup(file, before);
  const result = plan(before, args);
  console.log(JSON.stringify({ apply: args.apply, backup: file, plan: result }, null, 2));
  if (result.error) {
    if (tx) await api(args.project, access, 'POST', ':rollback', { transaction: tx }).catch(function () {});
    process.exit(1);
  }
  if (!args.apply || result.noop) {
    if (tx) await api(args.project, access, 'POST', ':rollback', { transaction: tx }).catch(function () {});
    return;
  }
  const writes = result.writes.map(function (w) {
    if (w.kind === 'delete') return { delete: docName(args.project, w.path) };
    return {
      update: { name: docName(args.project, w.path), fields: jsonToFields(w.fields) },
      updateMask: { fieldPaths: Object.keys(w.fields) }
    };
  });
  await api(args.project, access, 'POST', ':commit', { transaction: tx, writes: writes });
  console.log('committed ' + writes.length + ' writes');
}

main().catch(function (e) {
  console.error(e && e.message ? e.message : e);
  process.exit(1);
});
