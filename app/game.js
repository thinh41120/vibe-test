/* Đập chuột — logic game.
 *
 * Hai lớp:
 *  1. Lõi (createGame): thuần, không DOM, không hẹn giờ. Nhận đồng hồ, hàm ngẫu nhiên
 *     và nơi lưu trữ từ bên ngoài, nên kiểm thử được với đồng hồ giả lập.
 *  2. Giao diện (mountUI): vẽ trạng thái ra DOM, nhận chuột/cảm ứng/bàn phím,
 *     hẹn giờ để gọi tick() đúng các mốc.
 *
 * Mã quy tắc (R-xx, F-xx) tham chiếu docs/04-quy-tac-du-lieu.html và docs/02-chuc-nang.html.
 */
(function () {
  "use strict";

  // ---------- Hằng số cấu hình (docs 04) ----------
  const CONFIG = Object.freeze({
    GRID_SIZE: 3,
    ROUND_MS: 30000,
    MOLE_VISIBLE_MS: 800,
    MOLE_GAP_MS: 300,
    COUNTDOWN_STEPS: 3,
    COUNTDOWN_STEP_MS: 1000,
    HIT_EFFECT_MS: 300,
    LOW_TIME_S: 5,
    STORAGE_KEY: "dapChuot.highScore",
  });
  const CELL_COUNT = CONFIG.GRID_SIZE * CONFIG.GRID_SIZE;
  const COUNTDOWN_MS = CONFIG.COUNTDOWN_STEPS * CONFIG.COUNTDOWN_STEP_MS;
  const ROUND_S = CONFIG.ROUND_MS / 1000;

  // Chỉ số ô 0–8 (trái→phải, trên→dưới) ↔ phím theo bố cục bàn phím số
  const CELL_KEYS = [7, 8, 9, 4, 5, 6, 1, 2, 3];

  // ---------- Lưu trữ kỷ lục (R-D1–R-D5) ----------
  function parseHighScore(raw) {
    if (typeof raw !== "string" || !/^\d+$/.test(raw)) return 0;
    const n = Number(raw);
    return Number.isSafeInteger(n) ? n : 0;
  }

  function createLocalStorage(key) {
    return {
      read() {
        try {
          return parseHighScore(window.localStorage.getItem(key));
        } catch (_) {
          return 0; // R-D4: không dùng được localStorage → coi như 0, im lặng
        }
      },
      write(value) {
        try {
          window.localStorage.setItem(key, String(value));
        } catch (_) {
          /* R-D4: bỏ qua, kỷ lục chỉ giữ trong phiên */
        }
      },
    };
  }

  function createMemoryStorage(initial) {
    let value = initial || 0;
    return { read: () => value, write: (v) => { value = v; } };
  }

  function randomCell(random) {
    // Quy tắc ngẫu nhiên: đều trên 0–8, được phép trùng ô trước
    return Math.floor(random() * CELL_COUNT);
  }

  // ---------- Lõi game ----------
  function createGame(options) {
    const now = options.now;
    const random = options.random || Math.random;
    const storage = options.storage || createMemoryStorage(0);

    const state = {
      phase: "idle",
      score: 0,
      highScore: storage.read(),
      isNewRecord: false,
      countdownEndsAt: null,
      roundEndsAt: null,
      mole: null, // { id, cell, shownAt, expiresAt }
      nextMoleAt: null,
      roundId: 0,
    };
    let moleSeq = 0;
    const listeners = new Set();

    function emit(type, detail) {
      listeners.forEach((fn) => fn(type, detail));
    }

    function spawnMole(at) {
      moleSeq += 1;
      state.mole = {
        id: moleSeq,
        cell: randomCell(random),
        shownAt: at,
        expiresAt: at + CONFIG.MOLE_VISIBLE_MS,
      };
      state.nextMoleAt = null;
      emit("spawn", state.mole);
    }

    function endRound() {
      // R-T6: xoá chuột đang hiện và chuột đang chờ
      state.mole = null;
      state.nextMoleAt = null;
      state.phase = "ended";
      // F-11 / R-D3: chỉ ghi khi lớn hơn hẳn
      if (state.score > state.highScore) {
        state.highScore = state.score;
        state.isNewRecord = true;
        storage.write(state.highScore);
      }
      emit("end", { score: state.score, isNewRecord: state.isNewRecord });
    }

    /* Đưa trạng thái tiến tới thời điểm t, xử lý mọi mốc đã qua theo đúng thứ tự.
       Dùng mốc thời gian, không dùng số lần hẹn giờ (R-T1), nên đúng cả khi tab bị
       làm chậm hẹn giờ (R-T4). */
    function tick(t) {
      if (t === undefined) t = now();

      if (state.phase === "countdown" && t >= state.countdownEndsAt) {
        // R-T7: tính từ mốc, không từ lúc hàm chạy
        const start = state.countdownEndsAt;
        state.phase = "playing";
        state.roundEndsAt = start + CONFIG.ROUND_MS;
        emit("play", null);
        spawnMole(start); // R-T5: chuột đầu tiên hiện ngay
      }

      while (state.phase === "playing") {
        const moleEvent = state.mole ? state.mole.expiresAt : state.nextMoleAt;
        // Hết lượt thắng mọi sự kiện trùng hoặc muộn hơn (R-T6)
        if (moleEvent === null || state.roundEndsAt <= moleEvent) {
          if (t >= state.roundEndsAt) endRound();
          break;
        }
        if (moleEvent > t) break;
        if (state.mole) {
          // F-06: hết 800 ms → biến mất, không điểm
          emit("expire", state.mole);
          state.mole = null;
          state.nextMoleAt = moleEvent + CONFIG.MOLE_GAP_MS;
        } else {
          spawnMole(moleEvent);
        }
      }
    }

    /* F-02 / F-12: chỉ có tác dụng ở idle hoặc ended. */
    function start(t) {
      if (t === undefined) t = now();
      if (state.phase !== "idle" && state.phase !== "ended") return false;
      state.score = 0;
      state.isNewRecord = false;
      state.mole = null;
      state.nextMoleAt = null;
      state.roundEndsAt = null;
      state.roundId += 1;
      state.countdownEndsAt = t + COUNTDOWN_MS;
      state.phase = "countdown";
      emit("countdown", null);
      return true;
    }

    /* R-S1–R-S5: trả về true nếu lần bấm được tính điểm. */
    function press(cell, t) {
      if (t === undefined) t = now();
      tick(t);
      const m = state.mole;
      if (
        state.phase !== "playing" ||
        !m ||
        m.cell !== cell ||
        t >= m.expiresAt ||
        t >= state.roundEndsAt
      ) {
        return false; // R-S3
      }
      state.score += 1; // R-S2
      state.mole = null;
      state.nextMoleAt = t + CONFIG.MOLE_GAP_MS;
      emit("hit", { cell, moleId: m.id, score: state.score });
      return true;
    }

    /* Mốc kế tiếp cần tick (để giao diện hẹn giờ). */
    function nextDeadline() {
      if (state.phase === "countdown") return state.countdownEndsAt;
      if (state.phase !== "playing") return null;
      const moleEvent = state.mole ? state.mole.expiresAt : state.nextMoleAt;
      return moleEvent === null ? state.roundEndsAt : Math.min(moleEvent, state.roundEndsAt);
    }

    /* R-T2: số giây hiển thị, làm tròn lên, kẹp 0–30. */
    function displaySeconds(t) {
      if (t === undefined) t = now();
      if (state.phase === "playing") {
        const left = Math.ceil((state.roundEndsAt - t) / 1000);
        return Math.max(0, Math.min(ROUND_S, left));
      }
      if (state.phase === "ended") return 0;
      return ROUND_S;
    }

    /* R-T7: số đếm ngược 3 → 2 → 1. */
    function countdownNumber(t) {
      if (t === undefined) t = now();
      if (state.phase !== "countdown") return 0;
      return Math.max(1, Math.ceil((state.countdownEndsAt - t) / CONFIG.COUNTDOWN_STEP_MS));
    }

    return {
      state,
      tick,
      start,
      press,
      nextDeadline,
      displaySeconds,
      countdownNumber,
      on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    };
  }

  // ---------- Giao diện ----------
  function mountUI() {
    const $ = (id) => document.getElementById(id);
    const el = {
      screens: { idle: $("screen-start"), play: $("screen-play"), ended: $("screen-end") },
      btnStart: $("btn-start"),
      btnReplay: $("btn-replay"),
      startRecord: $("start-record"),
      startRecordValue: $("start-record-value"),
      statTime: $("stat-time"),
      time: $("time-value"),
      score: $("score-value"),
      playRecord: $("play-record-value"),
      board: $("board"),
      grid: $("grid"),
      countdown: $("countdown"),
      endScore: $("end-score"),
      endNewRecord: $("end-new-record"),
      endRecord: $("end-record-value"),
      live: $("live"),
    };

    const clock = () => performance.now();
    const game = createGame({
      now: clock,
      random: Math.random,
      storage: createLocalStorage(CONFIG.STORAGE_KEY),
    });

    // Tạo 9 ô từ template
    const template = $("cell-template");
    const cells = [];
    for (let i = 0; i < CELL_COUNT; i++) {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.cell = String(i);
      node.querySelector(".cell-key").textContent = String(CELL_KEYS[i]);
      node.setAttribute("aria-label", "Ô " + CELL_KEYS[i]);
      el.grid.appendChild(node);
      cells.push(node);
    }

    // ----- Vẽ -----
    let lastPhase = null;
    let lastMoleId = null;
    let lastCountdown = null;

    function setText(node, value) {
      const s = String(value);
      if (node.textContent !== s) node.textContent = s;
    }

    function announce(text) {
      el.live.textContent = "";
      // Đổi nội dung ở khung hình sau để trình đọc màn hình đọc lại cả chuỗi giống nhau
      requestAnimationFrame(() => { el.live.textContent = text; });
    }

    function render() {
      const s = game.state;
      const t = clock();

      // Màn hình
      if (s.phase !== lastPhase) {
        const screen = s.phase === "idle" ? "idle" : s.phase === "ended" ? "ended" : "play";
        el.screens.idle.hidden = screen !== "idle";
        el.screens.play.hidden = screen !== "play";
        el.screens.ended.hidden = screen !== "ended";
        el.btnStart.disabled = s.phase !== "idle";
        el.btnReplay.disabled = s.phase !== "ended";
        el.board.classList.toggle("is-countdown", s.phase === "countdown");

        if (s.phase === "ended") {
          setText(el.endScore, s.score);
          el.endNewRecord.hidden = !s.isNewRecord;
          setText(el.endRecord, s.highScore);
          announce("Hết giờ! Điểm của bạn: " + s.score + (s.isNewRecord ? ". Kỷ lục mới!" : ""));
          el.btnReplay.focus();
        } else if (s.phase === "countdown" && lastPhase !== "countdown") {
          el.board.focus({ preventScroll: true });
        } else if (s.phase === "playing") {
          announce("Bắt đầu!");
        }
        if (s.phase === "idle") {
          el.startRecord.hidden = s.highScore <= 0;
          setText(el.startRecordValue, s.highScore);
        }
        lastPhase = s.phase;
      }

      // Thanh trạng thái
      const secs = game.displaySeconds(t);
      setText(el.time, secs);
      el.statTime.classList.toggle("is-low", s.phase === "playing" && secs <= CONFIG.LOW_TIME_S);
      setText(el.score, s.score);
      setText(el.playRecord, s.highScore);

      // Đếm ngược
      const cd = game.countdownNumber(t);
      if (cd !== lastCountdown) {
        if (cd > 0) {
          setText(el.countdown, cd);
          announce(String(cd));
        }
        lastCountdown = cd;
      }

      // Chuột
      const moleCell = s.mole ? s.mole.cell : -1;
      const moleId = s.mole ? s.mole.id : null;
      if (moleId !== lastMoleId) {
        cells.forEach((c, i) => {
          const has = i === moleCell;
          if (c.classList.contains("has-mole") !== has) {
            c.classList.toggle("has-mole", has);
            c.setAttribute("aria-label", "Ô " + CELL_KEYS[i] + (has ? ", có chuột" : ""));
          }
        });
        // Chuột mới trùng ô chuột trước: khởi động lại chuyển động trồi lên
        if (moleId !== null && lastMoleId !== null && moleCell >= 0) {
          const c = cells[moleCell];
          if (c.dataset.moleId && c.dataset.moleId !== String(moleId)) {
            c.classList.remove("has-mole");
            void c.offsetWidth;
            c.classList.add("has-mole");
          }
        }
        if (moleCell >= 0) cells[moleCell].dataset.moleId = String(moleId);
        lastMoleId = moleId;
      }
    }

    // ----- Hiệu ứng trúng (F-09, chỉ trang trí) -----
    const hitTimers = new Map();
    function showHit(cellIndex) {
      const c = cells[cellIndex];
      clearTimeout(hitTimers.get(cellIndex));
      c.classList.remove("hit");
      const old = c.querySelector(".plus");
      if (old) old.remove();
      void c.offsetWidth;
      c.classList.add("hit");
      const plus = document.createElement("span");
      plus.className = "plus";
      plus.setAttribute("aria-hidden", "true");
      plus.textContent = "+1";
      c.appendChild(plus);
      hitTimers.set(cellIndex, setTimeout(() => {
        c.classList.remove("hit");
        plus.remove();
        hitTimers.delete(cellIndex);
      }, CONFIG.HIT_EFFECT_MS));
    }

    // ----- Hẹn giờ: một bộ hẹn duy nhất, gắn roundId (R-T8) -----
    let timer = null;
    const DISPLAY_INTERVAL_MS = 250; // F-04: cập nhật ≥ 4 lần/giây

    function schedule() {
      clearTimeout(timer);
      timer = null;
      const deadline = game.nextDeadline();
      if (deadline === null) return;
      const roundId = game.state.roundId;
      const wait = Math.max(0, Math.min(deadline - clock(), DISPLAY_INTERVAL_MS));
      timer = setTimeout(() => {
        if (roundId !== game.state.roundId) return; // hẹn giờ của lượt cũ
        update();
      }, wait);
    }

    function update() {
      game.tick(clock());
      render();
      schedule();
    }

    game.on((type, detail) => {
      if (type === "hit") showHit(detail.cell);
    });

    // ----- Thao tác -----
    function startRound() {
      if (game.start(clock())) {
        hitTimers.forEach((id, i) => { clearTimeout(id); cells[i].classList.remove("hit"); });
        hitTimers.clear();
        cells.forEach((c) => { const p = c.querySelector(".plus"); if (p) p.remove(); });
        update();
      }
    }

    function pressCell(i) {
      const t = clock();
      game.press(i, t);
      render();
      schedule();
    }

    el.btnStart.addEventListener("click", startRound);
    el.btnReplay.addEventListener("click", startRound);

    // R-S6: tính lúc nhấn xuống
    el.grid.addEventListener("pointerdown", (e) => {
      const cellNode = e.target.closest(".cell");
      if (!cellNode) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault(); // không bôi đen, không đổi focus khi bấm nhanh
      pressCell(Number(cellNode.dataset.cell));
    });
    el.grid.addEventListener("contextmenu", (e) => e.preventDefault());

    const KEY_TO_CELL = {};
    CELL_KEYS.forEach((key, i) => {
      KEY_TO_CELL["Digit" + key] = i;
      KEY_TO_CELL["Numpad" + key] = i;
    });

    document.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const isActivate = e.key === "Enter" || e.key === " " || e.code === "Space";
      if (e.repeat) {
        // R-S6: bỏ qua phím lặp tự động; vẫn chặn cuộn / kích hoạt nút lặp lại
        if (isActivate || e.code in KEY_TO_CELL) e.preventDefault();
        return;
      }
      if (e.code in KEY_TO_CELL) {
        e.preventDefault();
        pressCell(KEY_TO_CELL[e.code]);
        return;
      }
      if (!isActivate) return;
      const phase = game.state.phase;
      if (phase === "idle" || phase === "ended") {
        e.preventDefault(); // tránh nút đang focus kích hoạt lần nữa
        startRound();
      } else if (phase === "playing") {
        e.preventDefault();
        const focused = document.activeElement && document.activeElement.closest && document.activeElement.closest(".cell");
        if (focused) pressCell(Number(focused.dataset.cell)); // Enter/Space đập ô đang focus
      } else {
        e.preventDefault(); // đếm ngược: bỏ qua
      }
    });

    // R-T4: quay lại tab → đối chiếu ngay
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") update();
    });

    render();
    el.btnStart.focus({ preventScroll: true }); // F-01: Enter/Space dùng được ngay
    return game;
  }

  // Cho phép kiểm thử trong console với đồng hồ giả lập
  const api = { CONFIG, CELL_KEYS, createGame, createMemoryStorage, parseHighScore, randomCell, ui: null };
  window.DapChuot = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { api.ui = mountUI(); });
  } else {
    api.ui = mountUI();
  }
})();
