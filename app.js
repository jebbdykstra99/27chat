(function () {
  'use strict';

  const MOBILE_NAV_MQ = 900;
  const LS_USER = '27chat.user';
  const LS_LIKES = '27chat.likes';
  const LS_POSTS = '27chat.localPosts';

  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');

  const COLORS = ['#c4a574', '#8b6d3f', '#5c4a32', '#a89070', '#3a3238', '#6e5a42'];

  const TRENDS = [
    { tag: 'Listening', headline: 'Cross Road Blues', snippet: 'The 1936 sides still sit in the room. Robert Johnson guitar between the verses, not a myth about a deal.', meta: 'Delta blues' },
    { tag: 'Listening', headline: 'Are You Experienced', snippet: 'The inverted Strat. Feedback as composition. Hendrix made the guitar a second voice.', meta: 'Electric guitar' },
    { tag: 'Listening', headline: 'Back to Black', snippet: 'Ronettes in the arrangement, London in the vowel. Amy Winehouse wrote a record that still walks in.', meta: 'Voice', gold: true },
    { tag: 'Listening', headline: 'Without You', snippet: 'Pete Ham melody, Badfinger chorus that opens like a window. The song keeps doing the work.', meta: 'Power pop' },
    { tag: 'On the wall', headline: 'Crowns and text as paint', snippet: 'Jean-Michel Basquiat: crowns, lists, oilstick. The canvas is still talking.', meta: 'Paintings' },
    { tag: 'On the page', headline: 'The Soldier', snippet: 'Rupert Brooke sonnet. Some corner of a foreign field. The poem is the monument.', meta: 'Poem' },
    { tag: 'Listening', headline: 'History Lesson — Part II', snippet: 'D. Boon guitar as a sentence. Minutemen double-time that still swings. Our band could be your life.', meta: 'Punk' },
    { tag: 'Listening', headline: 'Replay', snippet: 'Kim Jong-hyun writing for SHINee. Falsetto that holds a whole room. The song is the conversation.', meta: 'K-pop writing' }
  ];

  const PLACES = [
    { tag: 'Work', title: 'Cross Road Blues', snippet: 'Robert Johnson, 1936. The guitar answers itself. Delta blues that still teaches the room.' },
    { tag: 'Work', title: 'Are You Experienced', snippet: 'Jimi Hendrix. Electric guitar as weather. The Strat flipped; the mix still startles.' },
    { tag: 'Work', title: 'Piece of My Heart', snippet: 'Janis Joplin voice. Texas grain, Big Brother lift. The take is the monument.' },
    { tag: 'Work', title: 'The End / Light My Fire', snippet: 'The Doors. Jim Morrison as singer and poet. A long form that is still a performance.' },
    { tag: 'Work', title: 'Turn On Your Love Light', snippet: 'Ron Pigpen McKernan with the Grateful Dead. Organ, blues shout, the band as a room.' },
    { tag: 'Work', title: 'On the Road Again', snippet: 'Alan Blind Owl Wilson, Canned Heat. Harmonica that sits in front of the beat.' },
    { tag: 'Work', title: 'Without You', snippet: 'Pete Ham, Badfinger. A chorus that other singers borrowed because the melody already knew.' },
    { tag: 'Work', title: 'I Am the Cosmos / Thirteen', snippet: 'Chris Bell, Big Star. Power pop with a private sky. Memphis still in the guitar.' },
    { tag: 'Work', title: 'History Lesson — Part II', snippet: 'D. Boon, Minutemen. Punk that talks. Guitar as a complete sentence.' },
    { tag: 'Work', title: 'Crowns (untitled)', snippet: 'Jean-Michel Basquiat paintings. Text, anatomy, a crown in the corner. On the wall, not in a myth.' },
    { tag: 'Work', title: 'Nevermind / Lithium', snippet: 'Kurt Cobain, Nirvana. Quiet-loud as architecture. The tape still has air in it.' },
    { tag: 'Work', title: 'Live Through This (bass)', snippet: 'Kristen Pfaff, Hole. The low end that holds the songs upright.' },
    { tag: 'Work', title: 'Back to Black', snippet: 'Amy Winehouse. Strings, backbeat, a voice that writes its own room.' },
    { tag: 'Work', title: 'The Soldier', snippet: 'Rupert Brooke. The 1914 sonnet. If I should die, think only this of me — the line is the work.' },
    { tag: 'Work', title: 'Star Trek / Like Crazy', snippet: 'Anton Yelchin as Chekov, and the indie close-up. The take is still on the reel.' },
    { tag: 'Work', title: 'Tenement Yard', snippet: 'Jacob Miller, Inner Circle. Reggae that walks. Kingston in the phrasing.' },
    { tag: 'Work', title: 'Replay / SHINee', snippet: 'Kim Jong-hyun. Writing, falsetto, a pop song that still arrives like a letter.' }
  ];

  const TOPICS = [
    { tag: 'Person', title: 'Robert Johnson', snippet: 'Delta blues. Cross Road Blues. The 1936 sides. Guitar that still sits between the verses.' },
    { tag: 'Person', title: 'Brian Jones', snippet: 'Founded the Rolling Stones. Slide, marimba, the early palette. The band starts here.' },
    { tag: 'Person', title: 'Jimi Hendrix', snippet: 'Electric guitar. Are You Experienced. Feedback as composition, not noise.' },
    { tag: 'Person', title: 'Janis Joplin', snippet: 'Voice. Piece of My Heart. Texas grain that fills a hall without asking.' },
    { tag: 'Person', title: 'Jim Morrison', snippet: 'The Doors. Poet. The long song as a room you can still enter.' },
    { tag: 'Person', title: 'Ron Pigpen McKernan', snippet: 'Grateful Dead blues. Organ, shout, Love Light. The blues was the first language.' },
    { tag: 'Person', title: 'Alan Blind Owl Wilson', snippet: 'Canned Heat. Harmonica, On the Road Again, Going Up the Country.' },
    { tag: 'Person', title: 'Pete Ham', snippet: 'Badfinger. Without You. Melody first. The chorus still opens.' },
    { tag: 'Person', title: 'Chris Bell', snippet: 'Big Star. Thirteen. I Am the Cosmos. Memphis power pop with a private sky.' },
    { tag: 'Person', title: 'D. Boon', snippet: 'Minutemen. History Lesson Part II. Guitar as a sentence. We jam econo.' },
    { tag: 'Person', title: 'Jean-Michel Basquiat', snippet: 'Paintings. Crowns, lists, oilstick. The wall still answers.' },
    { tag: 'Person', title: 'Kurt Cobain', snippet: 'Nirvana. Nevermind. Quiet-loud. The song is the architecture.' },
    { tag: 'Person', title: 'Kristen Pfaff', snippet: 'Hole. Bass on Live Through This. The low end that carries the room.' },
    { tag: 'Person', title: 'Amy Winehouse', snippet: 'Back to Black. Voice and arrangement. The Ronettes in the room with her.' },
    { tag: 'Person', title: 'Rupert Brooke', snippet: 'The Soldier. A sonnet that still stands without extra myth around it.' },
    { tag: 'Person', title: 'Anton Yelchin', snippet: 'Actor. Star Trek Chekov. Indie film close-ups. The take is the work.' },
    { tag: 'Person', title: 'Jacob Miller', snippet: 'Reggae. Inner Circle. Tenement Yard. The phrasing still walks.' },
    { tag: 'Person', title: 'Kim Jong-hyun', snippet: 'SHINee. Writer and voice. Replay. The song is still a letter.' }
  ];

  const SEED = [
    { id: 'p1', name: 'Vinyl Night', handle: 'vinylnight', text: 'Needle down on a stack that does not agree on decade. Johnson into Hendrix into Winehouse. The work did not stop. It just changed rooms.', hours: 1, likes: 318, replies: 52, followed: true, snippet: { handle: 'crossroads', text: 'Start with the 1936 sides. Let the guitar answer itself.' } },
    { id: 'p2', name: 'Cross Roads', handle: 'crossroads', text: 'Robert Johnson, Cross Road Blues. The guitar sits between the verses like a second singer. 1936 sides. Delta blues that still teaches the room. Dummy listen, real work.', hours: 2, likes: 241, replies: 38, followed: true },
    { id: 'p3', name: 'Lizard King', handle: 'lizardking', text: 'Jim Morrison as poet first tonight. The Doors are the band; the notebooks are the other instrument. Light My Fire is the door. The long songs are the house.', hours: 3, likes: 412, replies: 67, followed: true, snippet: { handle: 'doorspoet', text: 'Read the verse before you cue The End. It lands differently.' } },
    { id: 'p4', name: 'Back to Black', handle: 'backtoblack', text: 'Amy Winehouse, Back to Black. Ronettes in the arrangement, London in the vowel. A voice that writes its own room. Still walking in. Dummy feed, real record.', hours: 4, likes: 276, replies: 41, followed: false },
    { id: 'p5', name: 'Stone Founder', handle: 'stonefounder', text: 'Brian Jones founded the Rolling Stones. Slide guitar, marimba on Under My Thumb, the early palette. The band starts with that ear. Honor the founding sound.', hours: 5, likes: 189, replies: 27, followed: true },
    { id: 'p6', name: 'Wah Wah', handle: 'wahwah', text: 'Jimi Hendrix. Electric guitar as weather. Are You Experienced still startles in the mix. The inverted Strat is not a trick; it is a sentence.', hours: 6, likes: 154, replies: 22, followed: true, snippet: { handle: 'electricchurch', text: 'Feedback as composition. He wrote with noise the way a poet writes with breath.' } },
    { id: 'p7', name: 'Pearl Voice', handle: 'pearlvoice', text: 'Janis Joplin voice. Piece of My Heart. Texas grain that fills a hall without asking. The take is the monument. Dummy chatter about a real throat.', hours: 7, likes: 203, replies: 44, followed: true },
    { id: 'p8', name: 'Pigpen Blues', handle: 'pigpenblues', text: 'Ron Pigpen McKernan. Grateful Dead blues. Turn On Your Love Light, the organ, the shout. The blues was the first language in that band. Keep the lights on the song.', hours: 8, likes: 167, replies: 19, followed: false },
    { id: 'p9', name: 'Blind Owl', handle: 'blindowl', text: 'Alan Blind Owl Wilson, Canned Heat. On the Road Again. Harmonica that sits in front of the beat. Going Up the Country still walks. Dummy listen only.', hours: 9, likes: 388, replies: 61, followed: true, snippet: { handle: 'vinylnight', text: 'That harp tone is a whole weather system.' } },
    { id: 'p10', name: 'Without You', handle: 'withoutyou', text: 'Pete Ham, Badfinger. Without You. The chorus opens like a window. Other singers borrowed it because the melody already knew. Honor the writer.', hours: 11, likes: 131, replies: 18, followed: true },
    { id: 'p11', name: 'Big Star Thirteen', handle: 'bigstarthirteen', text: 'Chris Bell, Big Star. Thirteen is a private sky over Memphis power pop. I Am the Cosmos is the other weather. The guitar still has air in it.', hours: 13, likes: 298, replies: 49, followed: true },
    { id: 'p12', name: 'We Jam Econo', handle: 'wejam', text: 'D. Boon, Minutemen. History Lesson Part II. Guitar as a complete sentence. Double-time that still swings. Our band could be your life — that line is the work.', hours: 15, likes: 220, replies: 34, followed: false, snippet: { handle: 'minutemen', text: 'We jam econo is a method, not a merch line.' } },
    { id: 'p13', name: 'Crown Paint', handle: 'crownpaint', text: 'Jean-Michel Basquiat. Crowns, lists, oilstick, anatomy. Paintings that still talk from the wall. Text as paint. Dummy gallery chatter. Honor the canvas.', hours: 16, likes: 97, replies: 11, followed: true },
    { id: 'p14', name: 'Nevermind Tape', handle: 'nevermindtape', text: 'Kurt Cobain, Nirvana. Nevermind. Lithium quiet-loud as architecture. The tape still has room in it. Dummy take on a real song, not a myth about a person.', hours: 18, likes: 176, replies: 29, followed: false },
    { id: 'p15', name: 'Bass Lines', handle: 'basslines', text: 'Kristen Pfaff, Hole. The bass on Live Through This holds the songs upright. Listen to the low end before you talk about the chorus. Dummy feed. Real part.', hours: 20, likes: 109, replies: 21, followed: true },
    { id: 'p16', name: 'The Soldier', handle: 'thesoldier', text: 'Rupert Brooke, The Soldier. If I should die, think only this of me. The sonnet is the monument. 1914 lines that still stand without extra folklore around them.', hours: 22, likes: 84, replies: 14, followed: false },
    { id: 'p17', name: 'Chekov Take', handle: 'chekovtake', text: 'Anton Yelchin. Star Trek Chekov and the indie close-up in Like Crazy. The take is the work. Dummy film chat. Keep the camera on the performance.', hours: 24, likes: 198, replies: 33, followed: true },
    { id: 'p18', name: 'Tenement Yard', handle: 'tenementyard', text: 'Jacob Miller, Inner Circle. Tenement Yard. Reggae that walks. Kingston in the phrasing. Dummy listen. The riddim is the conversation.', hours: 26, likes: 147, replies: 24, followed: true, snippet: { handle: 'vinylnight', text: 'Put it after Canned Heat and the night still makes sense.' } },
    { id: 'p19', name: 'SHINee Voice', handle: 'shineevoice', text: 'Kim Jong-hyun. SHINee. Replay. Writer and falsetto. A pop song that still arrives like a letter. Dummy feed. Honor the writing.', hours: 28, likes: 255, replies: 40, followed: false },
    { id: 'p20', name: 'Electric Church', handle: 'electricchurch', text: 'Hendrix again because the guitar is not done talking. Purple Haze into Little Wing. Electric guitar as a second voice. The work did not stop.', hours: 30, likes: 73, replies: 9, followed: true },
    { id: 'p21', name: 'Doors Poet', handle: 'doorspoet', text: 'Morrison notebooks beside the records. The Doors as a band of poems that learned to play. Dummy rehearsal. Read the verse, then cue the organ.', hours: 32, likes: 118, replies: 16, followed: true },
    { id: 'p22', name: 'Delta Twelve', handle: 'delta12', text: 'Robert Johnson sides on a 78 transfer. Cross Road Blues, then Hellhound on My Trail. The guitar still answers. No folklore. Just the work.', hours: 36, likes: 162, replies: 23, followed: false, snippet: { handle: 'crossroads', text: 'The 1936 room is still in the tape.' } },
    { id: 'p23', name: 'Hole Bass', handle: 'holebass', text: 'Kristen Pfaff again. The bassline is a whole argument. Live Through This does not stand up without it. Dummy post. Real part. Keep the low end in the mix.', hours: 38, likes: 91, replies: 12, followed: true },
    { id: 'p24', name: 'Minutemen', handle: 'minutemen', text: 'D. Boon double-time, Mike Watt under it, George Hurley. History Lesson Part II is a complete thought. Punk that talks. We jam econo. The work is the set.', hours: 40, likes: 140, replies: 20, followed: false },
    { id: 'p25', name: 'Cosmos Wait', handle: 'cosmoswait', text: 'Chris Bell, I Am the Cosmos. Power pop with a private sky. Big Star Thirteen on the other side of the night. Memphis still in the guitar. Dummy listen.', hours: 42, likes: 121, replies: 17, followed: true },
    { id: 'p26', name: 'Inner Circle', handle: 'innercircle', text: 'Jacob Miller phrasing on Tenement Yard. Reggae that does not hurry. Inner Circle as a room. Dummy feed. Keep the work in the riddim.', hours: 44, likes: 88, replies: 11, followed: false }
  ];

  const NOTIFS = [
    { id: 'n1', text: '@crossroads liked your take on the 1936 sides.', time: '1h', unread: true },
    { id: 'n2', text: '@backtoblack mentioned you in a Back to Black listen.', time: '3h', unread: true },
    { id: 'n3', text: '@wejam started following you. Dummy follow.', time: 'Yesterday', unread: true }
  ];

  const THREADS = [
    { id: 't1', name: 'Vinyl Night', handle: 'vinylnight', preview: 'What is on the needle after Cross Road Blues?', messages: [
      { me: false, text: 'What is on the needle after Cross Road Blues?' },
      { me: true, text: 'Are You Experienced, then Thirteen. The work keeps changing rooms.' }
    ]},
    { id: 't2', name: 'Crown Paint', handle: 'crownpaint', preview: 'The crown in the corner is still talking.', messages: [
      { me: false, text: 'The crown in the corner is still talking.' },
      { me: true, text: 'Text as paint. Honor the canvas. Dummy gallery only.' }
    ]}
  ];

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function colorFor(handle) {
    let n = 0;
    for (let i = 0; i < handle.length; i++) n = (n + handle.charCodeAt(i) * (i + 1)) % COLORS.length;
    return COLORS[n];
  }
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  }

  let currentUser = loadJSON(LS_USER, null);
  let likes = loadJSON(LS_LIKES, {});
  let extraPosts = loadJSON(LS_POSTS, []);
  let currentTab = 'foryou';
  let activeThread = null;

  function allPosts() {
    return extraPosts.concat(SEED);
  }

  function isMobileNav() { return window.innerWidth <= MOBILE_NAV_MQ; }
  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    syncHamburgerAria();
  }
  function syncHamburgerAria() {
    if (!hamburger) return;
    const open = isMobileNav()
      ? document.body.classList.contains('nav-open')
      : !document.body.classList.contains('nav-collapsed');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }

  function highlightSocial(name) {
    document.querySelectorAll('.nav-social-link').forEach(function (l) { l.classList.remove('active'); });
    const el = document.querySelector('[data-social="' + name + '"]');
    if (el) el.classList.add('active');
  }

  function closeSocialOverlays() {
    ['explore-overlay', 'notif-overlay', 'chat-overlay', 'profile-overlay'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active', 'thread-open');
    });
  }

  function showContentPage(id) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    const page = document.getElementById('page-' + id);
    if (page) page.classList.add('active');
    window.scrollTo(0, 0);
  }

  function normalizeRoute(route) {
    let id = String(route || '').replace(/^#/, '').trim();
    if (!id) id = 'home';
    try { id = decodeURIComponent(id); } catch (e) { /* keep */ }
    return id;
  }
  function routeFromHash() { return normalizeRoute(window.location.hash); }
  function go(route) {
    const id = normalizeRoute(route);
    const hash = '#' + id;
    if (location.hash === hash) { applyRoute(); return; }
    location.hash = hash;
  }

  function selectThoughtsTab(tab) {
    currentTab = tab;
    document.querySelectorAll('[data-thoughts-tab]').forEach(function (t) {
      t.classList.toggle('active', t.dataset.thoughtsTab === tab);
    });
    renderFeed();
  }

  function applyRoute() {
    closeMobileNav();
    const raw = routeFromHash();

    if (raw === 'following') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('following');
      selectThoughtsTab('following');
      return;
    }
    if (raw === 'hot' || raw === 'new') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('home');
      selectThoughtsTab(raw);
      return;
    }
    if (raw === 'home' || raw === 'feed' || raw === 'thoughts') {
      closeSocialOverlays();
      showContentPage('thoughts');
      highlightSocial('home');
      selectThoughtsTab('foryou');
      return;
    }
    if (raw === 'chat') { openChat(); return; }
    if (raw === 'notifications') { openNotif(); return; }
    if (raw === 'explore') { openExplore(); return; }
    if (raw === 'profile') { openProfile(); return; }
    if (raw === 'news') {
      closeSocialOverlays();
      showContentPage('news');
      highlightSocial('news');
      return;
    }
    closeSocialOverlays();
    showContentPage('thoughts');
    highlightSocial('home');
  }

  function renderPost(post) {
    const liked = !!likes[post.id];
    const likeCount = post.likes + (liked ? 1 : 0);
    const av = initials(post.name);
    const bg = colorFor(post.handle);
    return (
      '<article class="post" data-post-id="' + post.id + '">' +
        '<div class="post-avatar" style="background:' + bg + '">' + av + '</div>' +
        '<div class="post-body">' +
          '<div class="post-meta">' +
            '<span class="post-name">' + escapeHtml(post.name) + '</span>' +
            '<span class="post-handle">@' + escapeHtml(post.handle) + '</span>' +
            '<span class="post-time">· ' + (post.hours != null ? post.hours + 'h' : 'now') + '</span>' +
          '</div>' +
          '<p class="post-text">' + escapeHtml(post.text) + '</p>' +
          (post.snippet
            ? '<div class="post-snippet"><span class="post-snippet-handle">@' + escapeHtml(post.snippet.handle) + '</span>' + escapeHtml(post.snippet.text) + '</div>'
            : '') +
          '<div class="post-actions">' +
            '<button class="post-action" data-act="reply" type="button">Reply · ' + (post.replies || 0) + '</button>' +
            '<button class="post-action' + (liked ? ' liked' : '') + '" data-act="like" type="button">Like · ' + likeCount + '</button>' +
            '<button class="post-action" data-act="share" type="button">Share</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function sliceFeed(posts, tab) {
    var list = posts.slice();
    if (tab === 'following') {
      return list.filter(function (p) {
        return p.followed || (currentUser && p.handle === currentUser.handle);
      });
    }
    if (tab === 'hot') {
      return list.sort(function (a, b) {
        return (b.likes + (likes[b.id] ? 1 : 0)) - (a.likes + (likes[a.id] ? 1 : 0));
      });
    }
    if (tab === 'new') {
      return list.sort(function (a, b) { return (a.hours || 0) - (b.hours || 0); });
    }
    // For You: conversation-weighted mix (replies + recency), not pure likes or clock order
    return list.sort(function (a, b) {
      var sa = (a.replies || 0) * 4 - (a.hours || 0);
      var sb = (b.replies || 0) * 4 - (b.hours || 0);
      return sb - sa;
    });
  }

  function renderFeed() {
    const el = document.getElementById('thoughts-feed');
    if (!el) return;
    var posts = sliceFeed(allPosts(), currentTab);
    if (!posts.length) {
      el.innerHTML = '<div class="post-empty">No posts in this ranking yet. Following / Hot / New are different slices of the same memorial feed — dress rehearsal only.</div>';
      return;
    }
    el.innerHTML = posts.map(renderPost).join('');
  }

  function renderTrends() {
    const card = function (t) {
      return '<a class="news-item" href="#explore">' +
        '<div class="news-item-tag' + (t.gold ? ' gold' : '') + '">' + escapeHtml(t.tag) + '</div>' +
        '<div class="news-item-headline">' + escapeHtml(t.headline) + '</div>' +
        '<div class="news-item-snippet">' + escapeHtml(t.snippet) + '</div>' +
        '<div class="news-item-meta">' + escapeHtml(t.meta) + '</div>' +
      '</a>';
    };
    const rail = document.getElementById('news-feed');
    const page = document.getElementById('news-page-list');
    const html = TRENDS.map(card).join('');
    if (rail) rail.innerHTML = html;
    if (page) page.innerHTML = html;
  }

  function renderExplore() {
    function cards(list) {
      return list.map(function (c) {
        return '<article class="explore-card">' +
          '<div class="explore-card-tag">' + escapeHtml(c.tag) + '</div>' +
          '<div class="explore-card-title">' + escapeHtml(c.title) + '</div>' +
          '<div class="explore-card-snippet">' + escapeHtml(c.snippet) + '</div>' +
        '</article>';
      }).join('');
    }
    document.getElementById('explore-pane-places').innerHTML = cards(PLACES);
    document.getElementById('explore-pane-topics').innerHTML = cards(TOPICS);
  }

  function renderNotifs() {
    const el = document.getElementById('notif-list');
    if (!el) return;
    el.innerHTML = NOTIFS.map(function (n) {
      return '<div class="notif-item' + (n.unread ? ' unread' : '') + '" data-nid="' + n.id + '">' +
        '<div><p>' + escapeHtml(n.text) + '</p><time>' + n.time + '</time></div></div>';
    }).join('');
    const unread = NOTIFS.filter(function (n) { return n.unread; }).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = String(unread);
      badge.classList.toggle('visible', unread > 0);
    }
  }

  function renderThreads() {
    const el = document.getElementById('chat-thread-list');
    if (!el) return;
    el.innerHTML = THREADS.map(function (t) {
      return '<div class="chat-thread-item" data-tid="' + t.id + '">' +
        '<div class="post-avatar" style="background:' + colorFor(t.handle) + '">' + initials(t.name) + '</div>' +
        '<div><div class="thread-name">' + escapeHtml(t.name) + '</div>' +
        '<div class="thread-preview">' + escapeHtml(t.preview) + '</div></div></div>';
    }).join('');
  }

  function openThread(id) {
    const t = THREADS.find(function (x) { return x.id === id; });
    if (!t) return;
    activeThread = t;
    document.getElementById('chat-placeholder').hidden = true;
    const view = document.getElementById('chat-thread-view');
    view.hidden = false;
    document.getElementById('chat-active-name').textContent = t.name;
    document.getElementById('chat-messages').innerHTML = t.messages.map(function (m) {
      return '<div class="chat-bubble ' + (m.me ? 'me' : 'them') + '">' + escapeHtml(m.text) + '</div>';
    }).join('');
    document.getElementById('chat-overlay').classList.add('thread-open');
  }

  function openChat() {
    closeSocialOverlays();
    document.getElementById('chat-overlay').classList.add('active');
    highlightSocial('chat');
  }
  function openNotif() {
    closeSocialOverlays();
    document.getElementById('notif-overlay').classList.add('active');
    highlightSocial('notifications');
  }
  function openExplore() {
    closeSocialOverlays();
    document.getElementById('explore-overlay').classList.add('active');
    highlightSocial('explore');
  }
  function openProfile() {
    closeSocialOverlays();
    document.getElementById('profile-overlay').classList.add('active');
    highlightSocial('profile');
    syncProfile();
  }

  function syncProfile() {
    const prompt = document.getElementById('profile-signin-prompt');
    const content = document.getElementById('profile-content');
    if (!currentUser) {
      prompt.hidden = false;
      content.hidden = true;
      document.getElementById('profile-topbar-name').textContent = 'Profile';
      return;
    }
    prompt.hidden = true;
    content.hidden = false;
    document.getElementById('profile-topbar-name').textContent = currentUser.name;
    document.getElementById('profile-display-name').textContent = currentUser.name;
    document.getElementById('profile-handle').textContent = '@' + currentUser.handle;
    document.getElementById('profile-avatar').textContent = initials(currentUser.name);
    document.getElementById('profile-bio').textContent = currentUser.bio || 'The work did not stop.';
    const mine = allPosts().filter(function (p) { return p.handle === currentUser.handle; });
    const pane = document.getElementById('profile-pane-posts');
    if (!mine.length) {
      pane.innerHTML = '<div class="empty-note" id="profile-posts-empty">No posts yet. Say what still plays.</div>';
    } else {
      pane.innerHTML = mine.map(renderPost).join('');
    }
  }

  function renderSidebarAuth() {
    const el = document.getElementById('sidebar-auth');
    const av = document.getElementById('thoughts-compose-avatar');
    if (currentUser) {
      el.innerHTML =
        '<div class="sidebar-auth-user">' +
          '<div class="sidebar-auth-avatar">' + initials(currentUser.name) + '</div>' +
          '<div class="sidebar-auth-name">@' + escapeHtml(currentUser.handle) + '</div>' +
        '</div>' +
        '<button class="sidebar-auth-btn" id="auth-signout" type="button">Sign out</button>';
      av.textContent = initials(currentUser.name);
      av.style.background = colorFor(currentUser.handle);
    } else {
      el.innerHTML = '<button class="sidebar-auth-btn primary" id="auth-signin" type="button">Sign in</button>';
      av.textContent = '27';
      av.style.background = '';
    }
  }

  function openAuth(tab) {
    const ov = document.getElementById('cv-auth-overlay');
    ov.classList.add('open');
    document.querySelectorAll('.conv-modal-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.getElementById('cv-panel-login').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('cv-panel-register').style.display = tab === 'register' ? '' : 'none';
    const closeBtn = document.getElementById('cv-modal-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeAuth() {
    document.getElementById('cv-auth-overlay').classList.remove('open');
  }
  function stubSignIn(name, handle) {
    currentUser = {
      name: name || 'Guest',
      handle: (handle || 'guest27').replace(/^@/, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'guest27',
      bio: 'The work did not stop.'
    };
    saveJSON(LS_USER, currentUser);
    closeAuth();
    renderSidebarAuth();
    syncProfile();
  }
  function signOut() {
    currentUser = null;
    saveJSON(LS_USER, null);
    renderSidebarAuth();
    syncProfile();
  }

  function maybePost() {
    const input = document.getElementById('thoughts-compose-input');
    const text = (input.value || '').trim();
    if (!text) return;
    if (!currentUser) { openAuth('login'); return; }
    extraPosts.unshift({
      id: 'local-' + Date.now(),
      name: currentUser.name,
      handle: currentUser.handle,
      text: text.slice(0, 280),
      hours: 0,
      likes: 0,
      replies: 0,
      followed: true
    });
    saveJSON(LS_POSTS, extraPosts);
    input.value = '';
    document.getElementById('thoughts-post-btn').disabled = true;
    renderFeed();
    syncProfile();
  }

  /* ── Events ─────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const social = e.target.closest('[data-social]');
    if (social) {
      e.preventDefault();
      go(social.dataset.social);
      return;
    }
    if (e.target.closest('#auth-signin') || e.target.closest('#profile-signin-prompt-btn')) {
      openAuth('login');
      return;
    }
    if (e.target.closest('#auth-signout')) { signOut(); return; }

    const tab = e.target.closest('[data-thoughts-tab]');
    if (tab) {
      const t = tab.dataset.thoughtsTab;
      if (t === 'following') go('following');
      else if (t === 'hot') go('hot');
      else if (t === 'new') go('new');
      else go('home');
      return;
    }

    const likeBtn = e.target.closest('[data-act="like"]');
    if (likeBtn) {
      const post = likeBtn.closest('[data-post-id]');
      if (!post) return;
      const id = post.dataset.postId;
      likes[id] = !likes[id];
      if (!likes[id]) delete likes[id];
      saveJSON(LS_LIKES, likes);
      renderFeed();
      syncProfile();
      return;
    }
    if (e.target.closest('[data-act="reply"]') || e.target.closest('[data-act="share"]')) {
      if (!currentUser) openAuth('login');
      return;
    }

    const etab = e.target.closest('[data-explore-tab]');
    if (etab) {
      document.querySelectorAll('[data-explore-tab]').forEach(function (t) {
        t.classList.toggle('active', t === etab);
      });
      document.getElementById('explore-pane-places').classList.toggle('active', etab.dataset.exploreTab === 'places');
      document.getElementById('explore-pane-topics').classList.toggle('active', etab.dataset.exploreTab === 'topics');
      return;
    }

    const thread = e.target.closest('[data-tid]');
    if (thread) { openThread(thread.dataset.tid); return; }

    if (isMobileNav() && document.body.classList.contains('nav-open')
        && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileNav();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const ov = document.getElementById('cv-auth-overlay');
    if (ov && ov.classList.contains('open')) { e.preventDefault(); closeAuth(); return; }
    if (isMobileNav() && document.body.classList.contains('nav-open')) closeMobileNav();
  });

  hamburger.addEventListener('click', function () {
    if (isMobileNav()) document.body.classList.toggle('nav-open');
    else document.body.classList.toggle('nav-collapsed');
    syncHamburgerAria();
  });
  window.addEventListener('resize', syncHamburgerAria);
  document.getElementById('nav-overlay').addEventListener('click', closeMobileNav);
  document.getElementById('right-panel-tab').addEventListener('click', function () {
    document.body.classList.toggle('right-collapsed');
  });
  document.getElementById('sidebar-search-btn').addEventListener('click', function () { go('explore'); });
  document.getElementById('sidebar-post-btn').addEventListener('click', function () {
    go('home');
    setTimeout(function () {
      const input = document.getElementById('thoughts-compose-input');
      if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, 120);
  });

  ['profile-back', 'notif-back', 'explore-back'].forEach(function (id) {
    document.getElementById(id).addEventListener('click', function () { go('home'); });
  });
  document.getElementById('notif-mark-read').addEventListener('click', function () {
    NOTIFS.forEach(function (n) { n.unread = false; });
    renderNotifs();
  });
  document.getElementById('chat-new-btn').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    openThread('t1');
  });
  document.getElementById('chat-placeholder-new').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    openThread('t1');
  });
  document.getElementById('chat-send-btn').addEventListener('click', function () {
    if (!currentUser) { openAuth('login'); return; }
    const input = document.getElementById('chat-compose-input');
    const text = (input.value || '').trim();
    if (!text || !activeThread) return;
    activeThread.messages.push({ me: true, text: text });
    input.value = '';
    openThread(activeThread.id);
  });
  document.getElementById('profile-edit-btn').addEventListener('click', function () {
    openAuth('register');
  });

  const compose = document.getElementById('thoughts-compose-input');
  const postBtn = document.getElementById('thoughts-post-btn');
  compose.addEventListener('input', function () {
    postBtn.disabled = !(compose.value || '').trim();
    compose.style.height = 'auto';
    compose.style.height = Math.min(compose.scrollHeight, 200) + 'px';
  });
  postBtn.addEventListener('click', maybePost);

  document.getElementById('cv-modal-close').addEventListener('click', function (e) {
    e.preventDefault();
    closeAuth();
  });
  document.getElementById('cv-auth-overlay').addEventListener('click', function (e) {
    if (e.target.id === 'cv-auth-overlay') closeAuth();
  });
  document.querySelectorAll('.conv-modal-tab').forEach(function (t) {
    t.addEventListener('click', function () { openAuth(t.dataset.tab); });
  });
  function stubSubmit(errId) {
    const err = document.getElementById(errId);
    err.textContent = 'Dress rehearsal — no live auth. Continuing as guest.';
    err.classList.add('show');
    setTimeout(function () { stubSignIn('Guest', 'guest27'); }, 500);
  }
  document.getElementById('cv-login-btn').addEventListener('click', function () { stubSubmit('cv-login-err'); });
  document.getElementById('cv-reg-btn').addEventListener('click', function () {
    const name = (document.getElementById('cv-reg-name').value || '').trim() || 'Guest';
    const err = document.getElementById('cv-reg-err');
    err.textContent = 'Dress rehearsal — no live auth. Local guest only.';
    err.classList.add('show');
    setTimeout(function () { stubSignIn(name, name.replace(/\s+/g, '').slice(0, 12)); }, 500);
  });
  document.getElementById('cv-google-login').addEventListener('click', function () { stubSignIn('Guest', 'guest27'); });

  const search = document.getElementById('explore-search-input');
  search.addEventListener('input', function () {
    const q = search.value.trim().toLowerCase();
    function filt(list) {
      if (!q) return list;
      return list.filter(function (c) {
        return (c.title + ' ' + c.snippet + ' ' + c.tag).toLowerCase().indexOf(q) !== -1;
      });
    }
    function cards(list) {
      if (!list.length) return '<p class="empty-note">Nothing in the room matched that.</p>';
      return list.map(function (c) {
        return '<article class="explore-card"><div class="explore-card-tag">' + escapeHtml(c.tag) +
          '</div><div class="explore-card-title">' + escapeHtml(c.title) +
          '</div><div class="explore-card-snippet">' + escapeHtml(c.snippet) + '</div></article>';
      }).join('');
    }
    document.getElementById('explore-pane-places').innerHTML = cards(filt(PLACES));
    document.getElementById('explore-pane-topics').innerHTML = cards(filt(TOPICS));
  });

  renderTrends();
  renderExplore();
  renderNotifs();
  renderThreads();
  renderSidebarAuth();
  renderFeed();

  window.addEventListener('hashchange', applyRoute);
  if (!location.hash || location.hash === '#') history.replaceState(null, '', '#home');
  applyRoute();
  syncHamburgerAria();
})();
