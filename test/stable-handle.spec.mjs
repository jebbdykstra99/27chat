import { test, expect } from '@playwright/test';

const ADMIN_UID = 'o774wL9hUVSi19EkDCgLqQomP8i2';
const COLORS = ['#c4a574', '#8b6d3f', '#5c4a32', '#a89070', '#3a3238', '#6e5a42'];

function colorFor(handle) {
  let n = 0;
  const h = String(handle || 'm');
  for (let i = 0; i < h.length; i++) n = (n + h.charCodeAt(i) * (i + 1)) % COLORS.length;
  return COLORS[n];
}

function installStub(page) {
  return Promise.all([
    page.addInitScript(() => {
      function bumpBoot() {
        window.__bootMark = (window.__bootMark || 0) + 1;
        setTimeout(function () { window.__bootQuiet = window.__bootMark; }, 0);
      }
      window.__installAuthStub = function () {
        if (!window.firebase) {
          window.__stubErr = 'firebase missing';
          return;
        }
        var store = {};
        window.__store = store;
        var params = new URLSearchParams(location.search);
        var as = params.get('as') || 'fan';
        if (as === 'stored') {
          store['users/stored-user'] = { siteId: '27chat', displayName: 'Jebb Dykstra', handle: 'keptfan' };
          store['handles/keptfan'] = { uid: 'stored-user', siteId: '27chat' };
          store['users/peer-1'] = { siteId: '27chat', displayName: 'Listener', handle: 'j32b' };
          store['handles/j32b'] = { uid: 'peer-1', siteId: '27chat' };
          store['conversations/c1'] = {
            siteId: '27chat',
            participants: ['stored-user', 'peer-1'],
            participantNames: { 'stored-user': 'Jebb Dykstra', 'peer-1': 'Listener' },
            lastMessage: 'still playing',
            unreadCounts: { 'stored-user': 0, 'peer-1': 0 }
          };
        } else if (as === 'stolen') {
          store['users/fan-user'] = { siteId: '27chat', displayName: 'Jebb Dykstra', handle: 'keptfan' };
          store['handles/keptfan'] = { uid: 'other-uid', siteId: '27chat' };
        } else if (as === 'admin') {
          store['users/' + 'o774wL9hUVSi19EkDCgLqQomP8i2'] = { siteId: '27chat', displayName: 'Jebb Dykstra', handle: 'j32b' };
          store['handles/j32b'] = { uid: 'o774wL9hUVSi19EkDCgLqQomP8i2', siteId: '27chat' };
          store['users/peer-1'] = { siteId: '27chat', displayName: 'Listener', handle: 'keptfan' };
          store['handles/keptfan'] = { uid: 'peer-1', siteId: '27chat' };
        }

        function emptySnap() {
          return { empty: true, docs: [], exists: false, forEach: function () {}, data: function () { return {}; } };
        }
        function docsUnder(pathParts) {
          var prefix = pathParts.join('/');
          if (prefix) prefix += '/';
          var docs = [];
          Object.keys(store).forEach(function (k) {
            if (prefix && k.indexOf(prefix) !== 0) return;
            var rest = prefix ? k.slice(prefix.length) : k;
            if (!rest || rest.indexOf('/') !== -1) return;
            docs.push({
              id: rest,
              data: function () { return Object.assign({}, store[k]); }
            });
          });
          return docs;
        }
        function docRef(pathParts) {
          var key = pathParts.join('/');
          return {
            id: pathParts[pathParts.length - 1],
            get: function () {
              if (params.get('peer') === 'deny' && key === 'users/peer-1') {
                return Promise.reject({ code: 'permission-denied', message: 'denied' });
              }
              var data = store[key];
              if (!data && params.get('claim') === 'taken' && key.indexOf('handles/') === 0) {
                return Promise.resolve({
                  exists: true,
                  id: pathParts[pathParts.length - 1],
                  data: function () { return { uid: 'other-uid' }; }
                });
              }
              return Promise.resolve({
                exists: !!data,
                id: pathParts[pathParts.length - 1],
                data: function () { return data ? Object.assign({}, data) : {}; }
              });
            },
            set: function (data, opts) {
              var prev = store[key];
              if (opts && opts.merge && prev) store[key] = Object.assign({}, prev, data || {});
              else store[key] = Object.assign({}, data || {});
              return Promise.resolve();
            },
            update: function (patch) {
              store[key] = Object.assign({}, store[key] || {}, patch || {});
              return Promise.resolve();
            },
            delete: function () {
              delete store[key];
              return Promise.resolve();
            },
            onSnapshot: function (ok) {
              var data = store[key];
              ok({
                exists: !!data,
                id: pathParts[pathParts.length - 1],
                data: function () { return data ? Object.assign({}, data) : {}; },
                docs: [],
                forEach: function () {}
              });
              return function () {};
            },
            collection: function (name) { return collection(pathParts.concat(name)); }
          };
        }
        function collection(pathParts) {
          var parts = Array.isArray(pathParts) ? pathParts.slice() : [String(pathParts || '')];
          var c = {
            where: function () { return c; },
            orderBy: function () { return c; },
            limit: function () { return c; },
            startAfter: function () { return c; },
            doc: function (id) { return docRef(parts.concat(id || ('auto' + Math.random().toString(36).slice(2)))); },
            add: function (data) {
              var id = 'new' + Math.random().toString(36).slice(2, 8);
              store[parts.concat(id).join('/')] = Object.assign({}, data || {});
              return Promise.resolve({ id: id });
            },
            get: function () {
              var docs = docsUnder(parts);
              return Promise.resolve({
                empty: !docs.length,
                docs: docs,
                forEach: function (fn) { docs.forEach(fn); }
              });
            },
            onSnapshot: function (ok) {
              if (parts.length === 1 && parts[0] === 'posts') {
                ok({
                  empty: false,
                  docs: [{
                    id: 'post1',
                    data: function () {
                      return {
                        siteId: '27chat',
                        authorUid: 'peer-1',
                        authorName: 'Listener',
                        text: 'The guitar still answers.',
                        likes: {},
                        likeCount: 0,
                        replyCount: 0,
                        createdAt: { toMillis: function () { return Date.now() - 3600000; } }
                      };
                    }
                  }],
                  forEach: function () {}
                });
                return function () {};
              }
              if (parts.length === 1 && parts[0] === 'conversations') {
                var me = (firebase.auth().currentUser || {}).uid || '';
                var docs = docsUnder(parts).filter(function (d) {
                  var parts = (d.data().participants) || [];
                  return !me || parts.indexOf(me) !== -1;
                });
                ok({ empty: !docs.length, docs: docs, forEach: function (fn) { docs.forEach(fn); } });
                return function () {};
              }
              var docs = docsUnder(parts);
              ok({
                empty: !docs.length,
                docs: docs,
                exists: false,
                forEach: function (fn) { docs.forEach(fn); },
                data: function () { return {}; }
              });
              return function () {};
            }
          };
          return c;
        }
        var txChain = Promise.resolve();
        function firestoreFn() {
          return {
            collection: collection,
            runTransaction: firestoreFn.runTransaction,
            batch: function () {
              var ops = [];
              return {
                set: function (ref, data, opts) { ops.push(function () { return ref.set(data, opts); }); },
                update: function (ref, data) { ops.push(function () { return ref.update(data); }); },
                commit: function () {
                  ops.forEach(function (op) { op(); });
                  return Promise.resolve();
                }
              };
            }
          };
        }
        function runClaim(fn) {
          var run = txChain.then(function () {
            var tx = {
              get: function (ref) { return ref.get(); },
              set: function (ref, data, opts) { ref.set(data, opts); }
            };
            return fn(tx);
          });
          txChain = run.then(function () {}, function () {});
          return run;
        }
        firestoreFn.runTransaction = function (fn) {
          if (params.get('claim') === 'deny') {
            return Promise.reject({ code: 'permission-denied', message: 'Missing or insufficient permissions.' });
          }
          if (params.get('claim') === 'delay') {
            return new Promise(function (resolve, reject) {
              window.__releaseClaim = function () { runClaim(fn).then(resolve, reject); };
            });
          }
          return runClaim(fn);
        };
        firestoreFn.FieldValue = {
          serverTimestamp: function () { return { __ts: 1 }; },
          delete: function () { return { __del: 1 }; },
          increment: function (n) { return { __inc: n }; }
        };
        firestoreFn.Timestamp = {
          now: function () { return { toMillis: function () { return Date.now(); }, toDate: function () { return new Date(); } }; },
          fromMillis: function (ms) { return { toMillis: function () { return ms; }, toDate: function () { return new Date(ms); } }; },
          fromDate: function (d) { return { toMillis: function () { return d.getTime(); } }; }
        };
        firebase.firestore = firestoreFn;
        firebase.storage = function () {
          return { ref: function () { return { put: function () { return { on: function () {} }; } }; } };
        };
        var state = { listeners: [] };
        function signInUser(user) {
          user.sendEmailVerification = function () { return Promise.resolve(); };
          user.updateProfile = user.updateProfile || function () { return Promise.resolve(); };
          api.currentUser = user;
          state.listeners.forEach(function (fn) { fn(user); });
          return Promise.resolve({ user: user });
        }
        var people = {
          fan: { uid: 'fan-user', email: 'listener@example.com', emailVerified: true, displayName: 'Jebb Dykstra' },
          stored: { uid: 'stored-user', email: 'listener@example.com', emailVerified: true, displayName: 'Jebb Dykstra' },
          admin: { uid: 'o774wL9hUVSi19EkDCgLqQomP8i2', email: 'jebb@example.com', emailVerified: true, displayName: 'Jebb Dykstra' }
        };
        var api = {
          currentUser: null,
          setPersistence: function () { bumpBoot(); return Promise.resolve(); },
          signInWithEmailAndPassword: function () {
            return signInUser(Object.assign({ providerData: [] }, people[as] || people.fan));
          },
          createUserWithEmailAndPassword: function (email) {
            return signInUser({ uid: 'new-user', email: email, emailVerified: false, displayName: '' });
          },
          signInWithPopup: function () { return Promise.resolve({ user: null }); },
          signInWithRedirect: function () { return Promise.resolve(); },
          getRedirectResult: function () { bumpBoot(); return Promise.resolve({ user: null }); },
          onAuthStateChanged: function (fn) {
            state.listeners.push(fn);
            Promise.resolve().then(function () { fn(api.currentUser); bumpBoot(); });
            return function () {};
          },
          signOut: function () {
            api.currentUser = null;
            state.listeners.forEach(function (fn) { fn(null); });
            return Promise.resolve();
          }
        };
        var Persistence = { LOCAL: 'local', SESSION: 'session', NONE: 'none' };
        function GoogleAuthProvider() {}
        function authFn() { return api; }
        authFn.Auth = { Persistence: Persistence };
        authFn.GoogleAuthProvider = GoogleAuthProvider;
        firebase.auth = authFn;
        var origInit = firebase.initializeApp && firebase.initializeApp.bind(firebase);
        firebase.initializeApp = function (cfg) {
          var result;
          try { if (origInit) result = origInit(cfg); }
          catch (e) { window.__initErr = String(e && e.message || e); }
          firebase.auth = authFn;
          firebase.firestore = firestoreFn;
          return result || { name: (cfg && cfg.projectId) || 'stub' };
        };
      };
    }),
    page.route('**/firebase-web-config.json', function (route) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          apiKey: 'AIzaSyDUMMYKEYFORLOCALTEST00000000',
          authDomain: 'subx-skins.firebaseapp.com',
          projectId: 'subx-skins',
          storageBucket: 'subx-skins.appspot.com',
          messagingSenderId: '1234567890',
          appId: '1:1234567890:web:abcdef'
        })
      });
    }),
    page.route(/127\.0\.0\.1:8765\/(\?.*)?$/, async function (route) {
      const res = await route.fetch();
      let body = await res.text();
      if (body.indexOf('__installAuthStub()') === -1) {
        body = body.replace(
          '<script src="factory.js',
          '<script>try{window.__installAuthStub()}catch(e){window.__stubErr=String(e&&e.stack||e)}</script><script src="factory.js'
        );
      }
      await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body });
    })
  ]);
}

async function waitBoot(page) {
  await page.waitForFunction(function () {
    return window.__bootMark && window.__bootQuiet === window.__bootMark && document.querySelector('[data-act="like"]');
  });
}

async function revealNav(page) {
  const vp = page.viewportSize();
  if (vp && vp.width <= 900) {
    const open = await page.evaluate(function () { return document.body.classList.contains('nav-open'); });
    if (!open) await page.locator('#hamburger').click();
  }
}

async function emailSignIn(page) {
  await revealNav(page);
  const sheet = page.locator('#cv-auth-overlay');
  if (!(await sheet.evaluate(function (el) { return el.classList.contains('open'); }))) {
    await page.locator('#auth-signin').click();
  }
  await expect(sheet).toHaveClass(/open/);
  const emailBtn = page.locator('#cv-use-email-btn');
  if (await emailBtn.isVisible()) await emailBtn.click();
  await page.locator('#cv-login-email').fill('listener@example.com');
  await page.locator('#cv-login-pw').fill('secret1');
  await page.locator('#cv-login-btn').click();
  await expect(sheet).not.toHaveClass(/open/);
}

async function signOut(page) {
  await revealNav(page);
  await page.locator('#auth-signout').click();
  await page.waitForFunction(function () {
    var raw = localStorage.getItem('subx.user');
    if (!raw || raw === 'null') return true;
    try { return !JSON.parse(raw); } catch (e) { return true; }
  });
}

async function settledHandle(page) {
  const handle = await page.waitForFunction(function () {
    var raw = localStorage.getItem('subx.user');
    if (!raw) return null;
    var u = JSON.parse(raw);
    var node = document.querySelector('#sidebar-auth .sidebar-auth-name');
    if (!u || !u.handle || !node || node.textContent !== '@' + u.handle) return null;
    var doc = (window.__store || {})['users/' + u.uid];
    if (!doc || doc.handle !== u.handle) return null;
    return u.handle;
  });
  return handle.jsonValue();
}

test('a minted handle stays the same across two sign-ins', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=fan');
  await waitBoot(page);
  await emailSignIn(page);
  const first = await settledHandle(page);
  expect(first).toMatch(/^f\d{4}jebbdykstr$/);
  const claim = await page.evaluate(function (handle) {
    return window.__store['handles/' + handle];
  }, first);
  expect(claim).toEqual({ uid: 'fan-user', siteId: '27chat' });

  await signOut(page);
  await emailSignIn(page);
  const second = await settledHandle(page);
  expect(second).toBe(first);
  const keys = await page.evaluate(function () {
    return Object.keys(window.__store).filter(function (k) { return k.indexOf('handles/') === 0; });
  });
  expect(keys).toEqual(['handles/' + first]);
});

test('a stored handle wins over a fresh mint, including profile and chat', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=stored');
  await waitBoot(page);
  await emailSignIn(page);
  expect(await settledHandle(page)).toBe('keptfan');

  await page.waitForFunction(function (color) {
    var el = document.querySelector('.chat-thread-item .post-avatar');
    return !!(el && (el.getAttribute('style') || '').indexOf(color) !== -1);
  }, colorFor('j32b'));

  await page.waitForSelector('[data-profile-uid="peer-1"]');
  await page.locator('[data-profile-uid="peer-1"]').click();
  await expect(page.locator('#profile-handle')).toHaveText('@j32b');

  const keys = await page.evaluate(function () {
    return Object.keys(window.__store).filter(function (k) { return k.indexOf('handles/') === 0; }).sort();
  });
  expect(keys).toEqual(['handles/j32b', 'handles/keptfan']);
  const user = await page.evaluate(function () { return window.__store['users/stored-user']; });
  expect(user.handle).toBe('keptfan');
  expect(user.displayName).toBe('Jebb Dykstra');
});

test('the admin keeps j32b', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=admin');
  await waitBoot(page);
  await emailSignIn(page);
  expect(await settledHandle(page)).toBe('j32b');

  await revealNav(page);
  await page.locator('#nav-chat').click();
  await page.evaluate(function () {
    var btn = document.getElementById('chat-new-btn');
    if (btn) btn.click();
  });
  await expect(page.locator('.chat-picker-item .post-avatar')).toHaveAttribute('style', new RegExp(colorFor('keptfan')));

  await signOut(page);
  await emailSignIn(page);
  expect(await settledHandle(page)).toBe('j32b');
  const doc = await page.evaluate(function (uid) {
    return {
      user: window.__store['users/' + uid],
      claim: window.__store['handles/j32b'],
      keys: Object.keys(window.__store).filter(function (k) { return k.indexOf('handles/') === 0; }).sort()
    };
  }, ADMIN_UID);
  expect(doc.user.handle).toBe('j32b');
  expect(doc.claim).toEqual({ uid: ADMIN_UID, siteId: '27chat' });
  expect(doc.keys).toEqual(['handles/j32b', 'handles/keptfan']);
});

async function expectUnavailable(page) {
  await expect(page.locator('#sidebar-auth .sidebar-auth-name')).toHaveText('handle unavailable');
  await expect(page.locator('#sidebar-auth .sidebar-auth-name')).toHaveClass(/handle-unavailable/);
  const text = await page.locator('#sidebar-auth .sidebar-auth-name').innerText();
  expect(text.includes('@')).toBe(false);
}

test('a denied claim writes nothing and shows no @handle', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=fan&claim=deny');
  await waitBoot(page);
  await emailSignIn(page);
  await expectUnavailable(page);
  const store = await page.evaluate(function () {
    return {
      handles: Object.keys(window.__store).filter(function (k) { return k.indexOf('handles/') === 0; }),
      user: window.__store['users/fan-user'] || null
    };
  });
  expect(store.handles).toEqual([]);
  expect(!store.user || !store.user.handle).toBe(true);
});

test('a taken handle is not reused, and a fully blocked claim shows no @handle', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=fan&claim=taken');
  await waitBoot(page);
  await emailSignIn(page);
  await expectUnavailable(page);
  const store = await page.evaluate(function () {
    return {
      handles: Object.keys(window.__store).filter(function (k) { return k.indexOf('handles/') === 0; }),
      user: window.__store['users/fan-user'] || null
    };
  });
  expect(store.handles).toEqual([]);
  expect(!store.user || store.user.handle !== 'f0000jebbdykstr').toBe(true);
  expect(!store.user || !store.user.handle).toBe(true);
});

test('a stored handle owned by someone else is not shown', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=stolen');
  await waitBoot(page);
  await emailSignIn(page);
  const handle = await settledHandle(page);
  expect(handle).not.toBe('keptfan');
  expect(handle).toMatch(/^[a-z0-9_]{1,15}$/);
  const store = await page.evaluate(function (next) {
    return {
      user: window.__store['users/fan-user'],
      oldClaim: window.__store['handles/keptfan'],
      claim: window.__store['handles/' + next]
    };
  }, handle);
  expect(store.user.handle).toBe(handle);
  expect(store.oldClaim).toEqual({ uid: 'other-uid', siteId: '27chat' });
  expect(store.claim.uid).toBe('fan-user');
  await expect(page.locator('#sidebar-auth .sidebar-auth-name')).not.toHaveText('@keptfan');
});

test('a missing handle and a denied profile read show the name without an @handle', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=fan&peer=missing');
  await waitBoot(page);
  await emailSignIn(page);
  await expect(page.locator('.post-handle').first()).toHaveText('handle unavailable');
  await expect(page.locator('.post-name').first()).toHaveText('Listener');
  await page.waitForSelector('[data-profile-uid="peer-1"]');
  await page.locator('[data-profile-uid="peer-1"]').click();
  await expect(page.locator('#profile-display-name')).toHaveText('Listener');
  await expect(page.locator('#profile-handle')).toHaveText('handle unavailable');
  await expect(page.locator('#profile-handle')).toHaveClass(/handle-unavailable/);
  expect(await page.locator('#profile-handle').innerText()).not.toMatch(/@/);

  await page.goto('/?as=fan&peer=deny');
  await waitBoot(page);
  await emailSignIn(page);
  await page.waitForSelector('[data-profile-uid="peer-1"]');
  await page.locator('[data-profile-uid="peer-1"]').click();
  await expect(page.locator('#profile-display-name')).toHaveText('Listener');
  await expect(page.locator('#profile-handle')).toHaveText('handle unavailable');
  expect(await page.locator('#profile-handle').innerText()).not.toMatch(/@/);
});

test('posts and likes wait for a claimed handle and do not send a guessed authorHandle', async ({ page }) => {
  await installStub(page);
  await page.goto('/?as=fan&claim=delay');
  await waitBoot(page);
  await emailSignIn(page);
  await expect(page.locator('#sidebar-auth .sidebar-auth-name')).not.toHaveText(/@/);
  await page.locator('#thoughts-compose-input').fill('The guitar still answers.');
  await page.locator('#thoughts-post-btn').click();
  await expect(page.locator('#thoughts-compose-err')).toHaveText('Handle unavailable.');
  await page.locator('[data-act="like"]').first().click();
  const mid = await page.evaluate(function () {
    return Object.keys(window.__store).filter(function (k) { return k.indexOf('posts/') === 0; }).map(function (k) {
      return window.__store[k].authorHandle || '';
    });
  });
  expect(mid.every(function (h) { return !h; })).toBe(true);
  await page.evaluate(function () { window.__releaseClaim(); });
  const handle = await settledHandle(page);
  expect(handle).toMatch(/^f\d{4}jebbdykstr$/);
  await page.locator('#thoughts-post-btn').click();
  await expect(page.locator('#thoughts-compose-err')).not.toHaveText('Handle unavailable.');
  const posted = await page.waitForFunction(function (h) {
    var keys = Object.keys(window.__store).filter(function (k) { return k.indexOf('posts/') === 0; });
    for (var i = 0; i < keys.length; i++) {
      var doc = window.__store[keys[i]];
      if (doc && doc.authorHandle) return doc.authorHandle === h ? doc.authorHandle : 'wrong:' + doc.authorHandle;
    }
    return null;
  }, handle);
  expect(await posted.jsonValue()).toBe(handle);
});
