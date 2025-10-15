// Client-side router that loads HTML fragments from /pages
const routes = {
  overview: 'pages/overview.html',
  reports:  'pages/reports.html',
  create:   'pages/create.html',
  about:    'pages/about.html',
  login:    'pages/login.html',
  users:    'pages/users.html',
  issues:   'pages/issues.html',
};

const cache = {};
const appEl = () => document.getElementById('app');

/* ---------------- Demo Data (issues + logs) ---------------- */
const ISSUE_DB = {
  Elvijs: {
    open: [
      { id: 412, title: 'Wrong gear pitch shipped (14T vs 16T)', status: 'Open',     project: 'DFS 4×4',          owner: 'Marta', when: '09.10.2025 09:05', how: '' },
      { id: 430, title: 'Flatness drift after refinish – verify jig', status: 'Open', project: 'DXL-350 Docs',    owner: 'Elvijs', when: '10.10.2025 16:20', how: '' },
      { id: 441, title: 'QA note: burrs on pinion P-88 (recheck)',    status: 'Open', project: 'AccuSeamer Rev-B', owner: 'Elvijs', when: '10.10.2025 18:10', how: '' },
    ],
    closed: [
      { id: 361, title: 'Idler gear tooth chipping',      status: 'Resolved', project: 'DFS 4×4',           owner: 'Ivans', when: '08.10.2025 16:10', how: 'Replaced idler + shim pack; retest passed' },
      { id: 405, title: 'Courier delay on lot P-88',      status: 'Resolved', project: 'AccuSeamer Rev-B',  owner: 'Ivans', when: '08.10.2025 22:10', how: 'Rerouted via DHL Express; received 22:10' },
      { id: 371, title: 'Alignment pin offset 0.15 mm',   status: 'Resolved', project: 'Alignment Jig',     owner: 'Elvijs',when: '07.10.2025 12:05', how: 'Pinned-to-length; spacer R2; QA signed' },
      { id: 333, title: 'Docs update batch XL-200',       status: 'Resolved', project: 'XL-200 Bender',      owner: 'Marta', when: '06.10.2025 09:40', how: 'Reviewed + merged to master' },
      { id: 352, title: 'Field unit #A17 vibration',      status: 'Resolved', project: 'DFS 4×4',           owner: 'Ivans', when: '11.10.2025 10:05', how: 'Shaft balance; 30-min burn-in OK' },
      { id: 299, title: 'Parts labeling inconsistent',    status: 'Resolved', project: 'AccuSeamer Rev-B',  owner: 'Anna',  when: '05.10.2025 14:55', how: 'New template; reprint lot' },
      { id: 287, title: 'Clamp interference with guard',  status: 'Resolved', project: 'DFS 4×4',           owner: 'Elvijs',when: '03.10.2025 11:00', how: 'Filed edge; updated guard profile' },
      { id: 284, title: 'Tight tolerance on spacer R1',   status: 'Resolved', project: 'DFS 4×4',           owner: 'Juris', when: '02.10.2025 16:25', how: 'Spacer R2; tolerance stack ±0.02' },
      { id: 281, title: 'Conveyor sensor misalignment',   status: 'Resolved', project: 'Conveyor Retrofit', owner: 'Juris', when: '01.10.2025 10:12', how: 'Re-shim sensor; recalibrated' },
    ],
  },
  Juris: {
    open: [
      { id: 420, title: 'Conveyor chain tension variance', status: 'Open',  project: 'Conveyor Retrofit', owner: 'Juris', when: '10.10.2025 11:34', how: '' },
      { id: 431, title: 'Backlash measurement variance',  status: 'Open',  project: 'DFS 4×4',           owner: 'Juris', when: '10.10.2025 17:25', how: '' },
    ],
    closed: [
      { id: 399, title: 'Tooth burrs on pinion lot P-88',  status: 'Resolved', project: 'AccuSeamer Rev-B', owner: 'Juris', when: '09.10.2025 18:40', how: 'Tumble + light re-grind; Ra ≤ 0.8 μm' },
      { id: 352, title: 'Field unit #A17 vibration',       status: 'Resolved', project: 'DFS 4×4',          owner: 'Ivans', when: '11.10.2025 10:05', how: 'Shaft balance; burn-in OK' },
      { id: 305, title: 'Wiring map mismatch',             status: 'Resolved', project: 'DXL-350 Docs',     owner: 'Juris', when: '05.10.2025 09:30', how: 'Updated schematic + review' },
      { id: 300, title: 'Fixture hole tolerance 0.07 mm',  status: 'Resolved', project: 'DFS 4×4',          owner: 'Juris', when: '04.10.2025 15:22', how: 'Ream + gauge; new drill guide' },
      { id: 296, title: 'Docs: BOM revision sync',         status: 'Resolved', project: 'AccuSeamer Rev-B', owner: 'Juris', when: '03.10.2025 13:50', how: 'Rev B2; synced to PLM' },
      { id: 290, title: 'QA test plan gaps',               status: 'Resolved', project: 'DFS 4×4',          owner: 'Juris', when: '02.10.2025 10:00', how: 'Added step 7–9; reviewer sign-off' },
      { id: 281, title: 'Conveyor sensor misalignment',    status: 'Resolved', project: 'Conveyor Retrofit',owner: 'Juris', when: '01.10.2025 10:12', how: 'Re-shim sensor; recalibrated' },
    ],
  }
};

// Time logs DB (for logs modal & CSV export)
const LOG_DB = {
  Elvijs: [
    { date: '2025-10-09', project: 'DFS 4×4',           hours: 3,   comment: 'Stage-2 backlash investigation' },
    { date: '2025-10-09', project: 'DFS 4×4',           hours: 2.5, comment: 'Shim pack trial v3' },
    { date: '2025-10-08', project: 'AccuSeamer Rev-B',  hours: 4,   comment: 'QA prep & review' },
    { date: '2025-10-07', project: 'XL-200 Bender',     hours: 3.5, comment: 'Docs update + wiring map' },
    { date: '2025-10-06', project: 'DXL-350 Docs',      hours: 2,   comment: 'Read-through; fix typos' },
  ],
  Juris: [
    { date: '2025-10-10', project: 'Conveyor Retrofit', hours: 2.5, comment: 'Sensor alignment' },
    { date: '2025-10-09', project: 'DFS 4×4',           hours: 3,   comment: 'Backlash gauge build' },
    { date: '2025-10-08', project: 'AccuSeamer Rev-B',  hours: 2,   comment: 'Re-grind verification' },
    { date: '2025-10-07', project: 'DXL-350 Docs',      hours: 1.5, comment: 'Schematic cleanup' },
  ]
};
/* ----------------------------------------------------------- */

async function load(route = 'overview') {
  const path = routes[route] || routes.overview;
  const url = new URL(path, window.location.href).toString();

  try {
    appEl().innerHTML = 'Loading…';

    if (!cache[url]) {
      cache[url] = fetch(url).then(async r => {
        if (!r.ok) throw new Error(`Fetch failed ${r.status} ${r.statusText} for ${path}`);
        return r.text();
      });
    }
    const html = await cache[url];
    appEl().innerHTML = html;

    // Wire per-page interactions
    wireOverview();
    wireDrawer();
    wireModals();
    wireReports();
    wireSummaryFilter();
    wireIssueLinks();
    wireLogLinks();
    wireProjectSearch();
    wireProjectAnalytics();
    wireCsvExport();           // project time export
    wireEngineerCsvExport();   // engineer time exports
    wireDragDrop();            // Kanban drag & drop on Overview
    wireCreate();              // Create Project wizard
    bindOverviewProgress();    // compute & render big progress bars (hours/deadline)
    wireAttachIssue();         // <<< NEW: Attach Issue (Overview cards)

  } catch (err) {
    console.error(err);
    appEl().innerHTML =
      `<div class="surface section"><h2>Load error</h2>
        <p class="muted">${err.message}</p>
      </div>`;
  }
}

function setActive(link) {
  document.querySelectorAll('.toc a')
    .forEach(a => a.classList.toggle('active', a === link));
}

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar routing
  document.querySelectorAll('.toc a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const route = a.dataset.route;
      load(route);
      setActive(a);
    });
  });

  // default to Reports while iterating
  load('reports');
});

/* ===== Page-specific bindings ===== */
function wireOverview(){
  const btn = document.getElementById('toggleDone');
  if (btn) btn.onclick = () => {
    const col = document.getElementById('doneCol');
    if (col) col.style.display = col.style.display === 'none' ? '' : 'none';
  };
}

function wireDrawer(){
  const drawer = document.getElementById('drawer');
  if (!drawer) return;
  document.querySelectorAll('[data-open-drawer]').forEach(b=>{
    b.onclick = (e)=>{ e.preventDefault(); drawer.classList.add('open'); drawer.classList.add('show'); };
  });
  const close = document.getElementById('closeDrawer');
  if (close) close.onclick = ()=> { drawer.classList.remove('open'); drawer.classList.remove('show'); };
}

function wireModals(){
  const hours = document.getElementById('hoursModal');
  const issue = document.getElementById('issueModal');
  document.querySelectorAll('[data-open-hours]').forEach(b=> b.onclick = ()=> hours?.classList.add('open'));
  document.querySelectorAll('[data-open-issue]').forEach(b=> b.onclick = ()=> issue?.classList.add('open'));
  document.querySelectorAll('[data-close]').forEach(b=> b.onclick = (e)=> e.target.closest('.modal').classList.remove('open'));
  document.onkeydown = (e)=>{ if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open')); };
}

// Reports: expand rows + mode switch
function wireReports(){
  // expand rows
  document.querySelectorAll('.expand').forEach(tr=>{
    tr.onclick = ()=>{
      const id = tr.dataset.expand;
      const row = document.getElementById(id);
      if (row) row.classList.toggle('hide');
    };
  });

  // mode switch
  const seg = document.querySelectorAll('[data-report]');
  if (seg.length){
    const panels = {
      engineers: document.getElementById('rpt-engineers'),
      projects:  document.getElementById('rpt-projects')
    };
    const set = (mode)=>{
      seg.forEach(b=> b.classList.toggle('green', b.dataset.report===mode));
      Object.entries(panels).forEach(([k,el])=> el && (el.classList.toggle('hide', k!==mode)));
      if (mode === 'projects') wireProjectAnalytics();
    };
    seg.forEach(b=> b.onclick = ()=> set(b.dataset.report));
    set('engineers'); // show Engineer time initially in this file
  }
}

// Drawer Summary filter (exclusive)
function wireSummaryFilter(){
  const container = document.getElementById('summaryChips');
  if (!container) return;
  const chips  = container.querySelectorAll('.chip.toggle');
  const topics = document.querySelectorAll('.summary-topic');

  const apply = ()=>{
    const active = Array.from(chips).filter(c => c.classList.contains('active'))
      .map(c => c.dataset.summary);
    const showAll = active.length === 0 || active.length === chips.length;
    topics.forEach(t => { t.style.display = (showAll || active.includes(t.dataset.summary)) ? '' : 'none'; });
  };

  chips.forEach(chip=>{
    chip.onclick = ()=>{
      const onlyThisActive = Array.from(chips).every(c => c === chip ? c.classList.contains('active') : !c.classList.contains('active'));
      if (onlyThisActive) { chips.forEach(c => c.classList.add('active')); }
      else { chips.forEach(c => c.classList.remove('active')); chip.classList.add('active'); }
      apply();
    };
  });
  apply();
}

/* ===== Issues modal ===== */
function wireIssueLinks(){
  const links = document.querySelectorAll('[data-issues]');
  if (!links.length) return;

  const modal = document.getElementById('issueListModal');
  const body  = document.getElementById('issueModalBody');
  const title = document.getElementById('issueModalTitle');

  links.forEach(link=>{
    link.onclick = (e)=>{
      e.preventDefault();
      const engineer = link.dataset.engineer;
      const kind     = link.dataset.kind;   // 'open' | 'closed'
      const project  = link.dataset.project || null;

      const src = (ISSUE_DB[engineer] && ISSUE_DB[engineer][kind]) || [];
      const rows = src.filter(x => !project || x.project === project);

      title.textContent = `${engineer} — ${kind === 'open' ? 'Open issues' : 'Closed issues'}${project ? ' • ' + project : ''}`;

      body.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td>#${r.id}</td><td>${r.title}</td><td>${r.status}</td>
          <td>${r.project}</td><td>${r.owner}</td><td>${r.when}</td><td>${r.how || ''}</td>
        </tr>
      `).join('') : `<tr><td colspan="7" class="muted">No items.</td></tr>`;

      modal.classList.add('open');
    };
  });
}

/* ===== Logs modal ===== */
function wireLogLinks(){
  const links = document.querySelectorAll('[data-logs]');
  if (!links.length) return;

  const modal = document.getElementById('logListModal');
  const body  = document.getElementById('logModalBody');
  const title = document.getElementById('logModalTitle');

  links.forEach(link=>{
    link.onclick = (e)=>{
      e.preventDefault();
      const engineer = link.dataset.engineer;
      const project  = link.dataset.project || null;
      const src = (LOG_DB[engineer] || []);
      const rows = src.filter(x => !project || x.project === project);

      title.textContent = `${engineer} — Time logs${project ? ' • ' + project : ''}`;

      body.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td>${r.date}</td><td>${r.project}</td><td>${r.hours}</td><td>${r.comment || ''}</td>
        </tr>
      `).join('') : `<tr><td colspan="4" class="muted">No logs.</td></tr>`;

      modal.classList.add('open');
    };
  });
}

/* ===== Project search (Project time) ===== */
function wireProjectSearch(){
  const input = document.getElementById('projSearch');
  if (!input) return;
  const cards = document.querySelectorAll('#projectGrid .project-item');

  const apply = ()=>{
    const q = input.value.trim().toLowerCase();
    cards.forEach(c=>{
      const hay = (c.dataset.title || c.querySelector('strong')?.textContent || '').toLowerCase();
      c.style.display = hay.includes(q) ? '' : 'none';
    });
    wireProjectAnalytics(); // recalc lists/kpis on search
  };
  input.addEventListener('input', apply);
  apply();
}

/* ===== Project analytics: KPIs + Top/Bottom 5 + Hide Idle ===== */
function wireProjectAnalytics(){
  const grid = document.getElementById('projectGrid');
  if (!grid) return;

  const kHours = document.getElementById('kpi-hours')?.querySelector('strong');
  const kProj  = document.getElementById('kpi-projects')?.querySelector('strong');
  const kAvg   = document.getElementById('kpi-avg')?.querySelector('strong');
  const kLogs  = document.getElementById('kpi-logs')?.querySelector('strong');
  const kOpen  = document.getElementById('kpi-open')?.querySelector('strong');
  const kClosed= document.getElementById('kpi-closed')?.querySelector('strong');
  const hideIdle = document.getElementById('hideIdle');
  const topBody = document.getElementById('top5');
  const botBody = document.getElementById('bottom5');

  function collect(){
    const items = [...grid.querySelectorAll('.project-item')].filter(el => el.style.display !== 'none');
    return items.map(el => ({
      el,
      title: el.querySelector('strong')?.textContent?.trim() || '—',
      hours: Number(el.dataset.hours || 0),
      logs:  Number(el.dataset.logs || 0),
      open:  Number(el.dataset.open || 0),
      closed:Number(el.dataset.closed || 0),
    }));
  }

  function render(){
    let rows = collect();
    const isHide = !!hideIdle?.checked;
    if (isHide) rows = rows.filter(r => r.hours > 0);

    const totalH = rows.reduce((s,r)=>s+r.hours,0);
    const totalP = rows.length;
    const totalL = rows.reduce((s,r)=>s+r.logs,0);
    const totalO = rows.reduce((s,r)=>s+r.open,0);
    const totalC = rows.reduce((s,r)=>s+r.closed,0);
    if (kHours) kHours.textContent = `${totalH}h`;
    if (kProj)  kProj.textContent  = totalP;
    if (kAvg)   kAvg.textContent   = totalP ? `${Math.round(totalH/totalP)}h` : '0h';
    if (kLogs)  kLogs.textContent  = totalL;
    if (kOpen)  kOpen.textContent  = totalO;
    if (kClosed)kClosed.textContent= totalC;

    const top = [...rows].sort((a,b)=>b.hours-a.hours).slice(0,5);
    if (topBody) topBody.innerHTML = top.length ? top.map(r=>`
      <tr><td>${r.title}</td><td style="text-align:right">${r.hours}h</td></tr>
    `).join('') : `<tr><td colspan="2" class="muted">No projects.</td></tr>`;

    const bottom = rows.filter(r=>r.hours>0).sort((a,b)=>a.hours-b.hours).slice(0,5);
    if (botBody) botBody.innerHTML = bottom.length ? bottom.map(r=>`
      <tr><td>${r.title}</td><td style="text-align:right">${r.hours}h</td></tr>
    `).join('') : `<tr><td colspan="2" class="muted">No active projects.</td></tr>`;
  }

  hideIdle?.removeEventListener('_change', hideIdle._handler || (()=>{}));
  if (hideIdle){
    hideIdle._handler = ()=>render();
    hideIdle.addEventListener('change', hideIdle._handler);
  }

  render();
}

/* ===== CSV Export (Project time) ===== */
function wireCsvExport(){
  const btn = document.getElementById('exportCsv');
  const grid = document.getElementById('projectGrid');
  const hideIdle = document.getElementById('hideIdle');
  if (!btn || !grid) return;

  btn.onclick = ()=>{
    let cards = [...grid.querySelectorAll('.project-item')].filter(el => el.style.display !== 'none');
    if (hideIdle?.checked) cards = cards.filter(c => Number(c.dataset.hours||0) > 0);

    const engineersSet = new Set();
    const rows = cards.map(c=>{
      let by = {};
      try { by = JSON.parse(c.dataset.hoursBy || '{}'); } catch(_) { by = {}; }
      Object.keys(by).forEach(k => engineersSet.add(k));
      return {
        project: c.querySelector('strong')?.textContent?.trim() || '—',
        total: Number(c.dataset.hours || 0),
        by
      };
    });
    const engineers = [...engineersSet].sort();

    const header = ['Project', ...engineers, 'Total'];
    const out = [header];
    rows.forEach(r=>{
      const line = [r.project, ...engineers.map(e => r.by[e] ?? 0), r.total];
      out.push(line);
    });

    const csv = out.map(cols => cols.map(val=>{
      const s = String(val);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(',')).join('\n');

    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0,10).replace(/-/g,'');
    a.href = URL.createObjectURL(blob);
    a.download = `project_hours_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };
}

/* ===== CSV Export (Engineer time) ===== */
function wireEngineerCsvExport(){
  const btnSummary = document.getElementById('exportEngSummary');
  const btnLogs    = document.getElementById('exportEngLogs');
  const table      = document.getElementById('engineerTable');
  if (btnSummary && table){
    btnSummary.onclick = ()=>{
      // Read visible summary rows (first-level rows with 5 cells)
      const rows = [...table.querySelectorAll('tbody > tr')].filter(tr => tr.children.length === 5 && !tr.id);
      const data = rows.map(tr=>{
        const [userEl, hoursEl, projectsEl, roleEl] = [0,1,2,3].map(i=>tr.children[i]);
        return {
          Engineer: userEl.textContent.trim(),
          TotalHours: hoursEl.textContent.trim(),
          Projects: projectsEl.textContent.trim(),
          Role: roleEl.textContent.trim()
        };
      });

      const header = ['Engineer','TotalHours','Projects','Role'];
      const out = [header, ...data.map(r => [r.Engineer, r.TotalHours, r.Projects, r.Role])];
      const csv = out.map(cols => cols.map(s=>{
        s = String(s);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
      }).join(',')).join('\n');

      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0,10).replace(/-/g,'');
      a.href = URL.createObjectURL(blob);
      a.download = `engineer_summary_${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
    };
  }

  if (btnLogs){
    btnLogs.onclick = ()=>{
      // Build logs CSV from LOG_DB: Engineer, Date, Project, Hours, Comment
      const header = ['Engineer','Date','Project','Hours','Comment'];
      const out = [header];

      Object.keys(LOG_DB).forEach(engineer=>{
        (LOG_DB[engineer] || []).forEach(log=>{
          out.push([
            engineer,
            log.date,
            log.project,
            log.hours,
            log.comment || ''
          ]);
        });
      });

      const csv = out.map(cols => cols.map(s=>{
        s = String(s);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
      }).join(',')).join('\n');

      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0,10).replace(/-/g,'');
      a.href = URL.createObjectURL(blob);
      a.download = `engineer_logs_${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
    };
  }
}

/* ===== Kanban Drag & Drop (Overview) ===== */
function wireDragDrop(){
  const columns = Array.from(document.querySelectorAll('.kanban .col'));
  const cards   = Array.from(document.querySelectorAll('.kanban .card'));
  if (!columns.length || !cards.length) return;

  // Avoid double-binding on cards
  cards.forEach(card=>{
    if (card.dataset.ddBound === '1') return;
    card.dataset.ddBound = '1';

    card.setAttribute('draggable','true');

    card.addEventListener('dragstart', (e)=>{
      // prevent drag starting from interactive controls
      if (e.target.closest('button, .btn, input, select, textarea, [data-open-hours], [data-open-issue], [data-attach-issue]')) {
        e.preventDefault();
        return;
      }
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'kanban-card');
    });

    card.addEventListener('dragend', ()=>{
      card.classList.remove('dragging');
      columns.forEach(col=>col.classList.remove('drop-target'));
    });
  });

  function getDragAfterElement(container, y){
    const els = [...container.querySelectorAll('.card:not(.dragging)')];
    let closest = {offset: Number.NEGATIVE_INFINITY, element: null};
    els.forEach(el=>{
      const rect = el.getBoundingClientRect();
      const offset = y - rect.top - rect.height/2;
      if (offset < 0 && offset > closest.offset){
        closest = {offset, element: el};
      }
    });
    return closest.element;
  }

  // Avoid double-binding on columns
  columns.forEach(col=>{
    if (col.dataset.ddBound === '1') return;
    col.dataset.ddBound = '1';

    col.addEventListener('dragenter', (e)=>{
      if (e.dataTransfer.types?.includes('text/plain')) {
        col.classList.add('drop-target');
      }
    });

    col.addEventListener('dragover', (e)=>{
      e.preventDefault(); // allow drop
      const dragging = document.querySelector('.card.dragging');
      if (!dragging) return;
      const after = getDragAfterElement(col, e.clientY);
      if (after == null) col.appendChild(dragging);
      else col.insertBefore(dragging, after);
    });

    col.addEventListener('drop', (e)=>{
      e.preventDefault();
      col.classList.remove('drop-target');
      // Visual status accent auto-updates via CSS scoping by column class
      // (.col-progress / .col-review / .col-done)
    });
  });
}

/* ===== Create Project Wizard (Create page) ===== */
function wireCreate(){
  // open wizard
  const openBtn = document.getElementById('openCreateWizard');
  const modal   = document.getElementById('createWizard');
  const quick   = document.getElementById('quickProjectName');
  const nameIn  = document.getElementById('cp_name');
  const form    = document.getElementById('createProjectForm');
  const result  = document.getElementById('cp_result');

  if (!openBtn || !modal) return;

  openBtn.onclick = () => {
    if (quick && nameIn) nameIn.value = quick.value.trim();
    modal.classList.add('open');
  };

  // chip toggles look “active” when checked
  modal.querySelectorAll('label.chip input[type="checkbox"]').forEach(cb=>{
    const chip = cb.closest('label.chip');
    if (!chip) return;
    const sync = () => chip.classList.toggle('active', cb.checked);
    cb.addEventListener('change', sync);
    sync();
  });

  if (form){
    form.onsubmit = (e)=>{
      e.preventDefault();
      const name = (nameIn?.value || '').trim();
      if (!name){
        nameIn?.focus();
        nameIn?.scrollIntoView({block:'center'});
        nameIn?.classList.add('error');
        setTimeout(()=>nameIn?.classList.remove('error'), 800);
        return;
      }
      const engineers = [...form.querySelectorAll('input[name="engineers"]:checked')].map(x=>x.value);
      const deadline  = document.getElementById('cp_deadline')?.value || '';
      const budgetRaw = document.getElementById('cp_budget')?.value || '';
      const budget    = budgetRaw ? Number(budgetRaw) : null;
      const state     = document.getElementById('cp_state')?.value || 'progress';

      if (result){
        const pretty = { name, engineers, deadline, maxHours: budget, state };
        result.style.display = '';
        result.innerHTML =
          `<div class="surface" style="border:1px solid var(--line); padding:12px; border-radius:10px; background:#f9fafb">
             <div style="font-weight:600; color:var(--ink);">Project created (demo)</div>
             <pre style="margin:8px 0 0; white-space:pre-wrap">${JSON.stringify(pretty, null, 2)}</pre>
             <div class="muted" style="font-size:12px; margin-top:6px">
               In a real app we would POST this to the server and append a card to the chosen column on Overview.
             </div>
           </div>`;
      }

      setTimeout(()=> modal.classList.remove('open'), 400);
      if (quick) quick.value = '';
    };
  }
}

/* ===== NEW: Big progress bars logic (Overview) ===== */
function bindOverviewProgress(){
  // No-op on non-Overview pages
  const anyCard = document.querySelector('.kanban .card[data-card]');
  const anyHours = document.querySelector('.hours-row') || document.querySelector('[data-hours-used]');
  const anyDeadline = document.querySelector('.deadline-row') || document.querySelector('[data-deadline-date]');
  if (!anyCard && !anyHours && !anyDeadline) return;

  const today = new Date(); today.setHours(0,0,0,0);

  document.querySelectorAll('.kanban .card[data-card]').forEach(card=>{
    const hoursRow = card.querySelector('.hours-row');
    const deadlineRow = card.querySelector('.deadline-row');

    // Only one progress block is shown. If hours exists, hide deadline row.
    if (hoursRow && deadlineRow) deadlineRow.style.display = 'none';

    // Hours bar from data-hours-used/max
    if (hoursRow){
      const used = Number(hoursRow.dataset.hoursUsed || 0);
      const max  = Math.max(1, Number(hoursRow.dataset.hoursMax || 0));
      const pct  = Math.round((used / max) * 100);
      const fill = hoursRow.querySelector('.fill');
      const txt  = hoursRow.querySelector('.hours-text');
      if (fill){
        fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
        fill.style.height = '10px';
        fill.style.borderRadius = '6px';
        if (pct > 100) fill.style.background = 'var(--red)';
      }
      if (txt) txt.textContent = `${used}/${max}h`;
    }

    // Deadline bar (date-based)
    if (!hoursRow && deadlineRow){
      const dlStr   = card.dataset.deadlineDate;
      if (!dlStr) { deadlineRow.style.display='none'; return; }
      const startStr= card.dataset.deadlineStart; // optional
      const deadline = new Date(dlStr + 'T00:00:00');
      const start    = startStr ? new Date(startStr + 'T00:00:00') : new Date(deadline.getTime() - 14*86400000);
      if (start >= deadline) start.setTime(deadline.getTime() - 86400000);

      const total   = deadline - start;
      const elapsed = Math.max(0, Math.min(today - start, total));
      let pct = Math.round((elapsed / total) * 100);

      const textEl = deadlineRow.querySelector('.deadline-text');
      const fillEl = deadlineRow.querySelector('.fill');
      const dFmt = (d)=> d.toLocaleDateString(undefined,{day:'2-digit', month:'short'});

      let label;
      const cmp = Math.sign(today - deadline);
      if (cmp === 0){
        label = `Today is the deadline (${dFmt(deadline)})`;
        pct = 100;
        if (fillEl) fillEl.style.background = '#f59e0b';
      } else if (cmp < 0){
        const left = Math.round((deadline - today)/86400000);
        label = `${left} day${left===1?'':'s'} left (${dFmt(deadline)})`;
        if (fillEl) fillEl.style.background = '#f59e0b';
      } else {
        const late = Math.round((today - deadline)/86400000);
        label = `${late} day${late===1?'':'s'} late (${dFmt(deadline)})`;
        pct = 100;
        if (fillEl) fillEl.style.background = 'var(--red)';
      }

      if (textEl) textEl.textContent = label;
      if (fillEl){
        fillEl.style.width = Math.max(0, Math.min(100, pct)) + '%';
        fillEl.style.height = '10px';
        fillEl.style.borderRadius = '6px';
      }
    }
  });
}

/* ===== NEW: Attach Issue (Overview) ===== */
function wireAttachIssue(){
  // Only present on Overview
  const attachButtons = document.querySelectorAll('.kanban .card [data-attach-issue], [data-attach-issue]');
  const modal = document.getElementById('attachIssueModal');
  if (!attachButtons.length || !modal) return;

  const STORAGE_KEY = 'attachedIssues.v1';
  const ISSUES_PATHS = [routes.issues, 'issues.html', '/pages/issues.html']; // fallbacks just in case

  const selectEl = modal.querySelector('#attachIssueSelect');
  const noteEl   = modal.querySelector('#attachIssueNote');
  const confirm  = modal.querySelector('#attachIssueConfirm');

  const loadDB  = ()=> { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); } catch(_) { return {}; } };
  const saveDB  = (db)=> localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

  const getProjectName = (card)=>{
    const explicit = card.getAttribute('data-project');
    if (explicit) return explicit.trim();
    const text = card.querySelector('.pname')?.textContent || '';
    return text.replace(/^Project:\s*/,'').trim() || 'Unknown';
  };

  const ensureAttachedRow = (card)=>{
    let wrap = card.querySelector('.attached-issues');
    if (!wrap){
      wrap = document.createElement('div');
      wrap.className = 'attached-issues';
      wrap.style.marginTop = '10px';
      wrap.innerHTML = `
        <div class="muted" style="margin-bottom:6px">Attached issues</div>
        <div class="row" style="gap:8px; flex-wrap:wrap" data-attached-row></div>
      `;
      // Put after the action row if present, else at end
      const actionRow = card.querySelector('.row button.btn')?.closest('.row');
      (actionRow || card).insertAdjacentElement('afterend', wrap);
    }
    return wrap.querySelector('[data-attached-row]');
  };

  const pill = (issue)=>{
    const span = document.createElement('span');
    span.className = 'pill';
    span.dataset.issueId = issue.id;
    span.title = issue.title || '';
    span.style.display = 'inline-flex';
    span.style.alignItems = 'center';
    span.style.gap = '6px';
    span.innerHTML = `
      <strong>#${issue.id}</strong> ${issue.title || issue.short || ''}
      <button class="btn sm" data-detach title="Detach">×</button>
    `;
    return span;
  };

  const renderCard = (card)=>{
    const row = ensureAttachedRow(card);
    const proj = getProjectName(card);
    const list = (loadDB()[proj] || []);
    row.innerHTML = '';
    list.forEach(i => row.appendChild(pill(i)));
    row.querySelectorAll('[data-detach]').forEach(btn=>{
      btn.onclick = (e)=>{
        e.preventDefault();
        const id = Number(btn.closest('.pill').dataset.issueId);
        const db = loadDB();
        db[proj] = (db[proj] || []).filter(x => x.id !== id);
        saveDB(db);
        renderCard(card);
      };
    });
  };

  // Initial render of all cards with existing attachments
  document.querySelectorAll('.kanban .card').forEach(renderCard);

  // Close handlers
  modal.querySelectorAll('[data-close-attach]').forEach(b=>{
    b.onclick = ()=> modal.classList.remove('open','show');
  });
  modal.addEventListener('click', (e)=>{ if (e.target === modal) modal.classList.remove('open','show'); });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') modal.classList.remove('open','show'); });

  // Load issues.html (first successful path)
  async function loadIssuesHTML(){
    for (const p of ISSUES_PATHS){
      if (!p) continue;
      try{
        const res = await fetch(p, {cache:'no-cache'});
        if (res.ok){
          return await res.text();
        }
      }catch(e){}
    }
    return '';
  }

  // Parse issues from issues.html
  function parseIssues(html){
    if (!html) return [];
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Try a few likely structures:
    // 1) table body with id="issuesBody"
    // 2) rows with data-id + data-status, or classes .open/.progress/.resolved
    // 3) generic table rows in a table with data-issues
    const rows =
      [...doc.querySelectorAll('#issuesBody tr')].length ? [...doc.querySelectorAll('#issuesBody tr')] :
      [...doc.querySelectorAll('tr[data-id]')].length ? [...doc.querySelectorAll('tr[data-id]')] :
      [...doc.querySelectorAll('table[data-issues] tbody tr')];

    const items = rows.map(tr=>{
      // Status
      let status =
        tr.dataset.status ||
        (tr.classList.contains('open') ? 'Open' :
         tr.classList.contains('progress') ? 'In progress' :
         tr.classList.contains('resolved') ? 'Resolved' : '');

      // ID
      let id = Number(tr.getAttribute('data-id'));
      if (!id){
        const m = (tr.textContent || '').match(/#(\d{2,})/);
        if (m) id = Number(m[1]);
      }

      // Title & project
      // Prefer specific cells if present: [project, title, status, owner, when, how...]
      const cells = tr.cells || [];
      const title = (tr.getAttribute('data-title') || cells[1]?.textContent || '').trim();
      const project = (tr.getAttribute('data-project') || cells[0]?.textContent || '').trim();

      return { id, title, project, status };
    }).filter(x => x.id && x.title);

    // Keep Open / In progress only
    return items.filter(i => i.status === 'Open' || i.status === 'In progress');
  }

  // Button clicks
  attachButtons.forEach(btn=>{
    if (btn._attachBound) return;
    btn._attachBound = true;

    btn.addEventListener('click', async ()=>{
      const card = btn.closest('.card');
      if (!card) return;

      // open modal
      modal.classList.add('open','show');

      // load & parse issues
      selectEl.innerHTML = '<option>Loading…</option>';
      const html = await loadIssuesHTML();
      const candidates = parseIssues(html);

      // exclude already attached
      const proj = getProjectName(card);
      const attachedIds = new Set((loadDB()[proj] || []).map(x => x.id));
      const options = candidates
        .filter(i => !attachedIds.has(i.id))
        .map(i => `<option value="${i.id}">#${i.id} • ${i.title} — ${i.project} (${i.status})</option>`)
        .join('');

      selectEl.innerHTML = options || '<option value="">No open/in-progress issues</option>';
      noteEl.value = '';

      // confirm handler
      confirm.onclick = ()=>{
        const pickId = Number(selectEl.value);
        if (!pickId) return;
        const pick = candidates.find(x => x.id === pickId);
        const db = loadDB();
        db[proj] = db[proj] || [];
        if (!db[proj].some(x => x.id === pick.id)){
          db[proj].push({ id: pick.id, title: pick.title, status: pick.status });
          saveDB(db);
        }
        renderCard(card);
        modal.classList.remove('open','show');
      };
    });
  });
}
