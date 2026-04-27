"use strict";

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.DEMO_BASE_URL || "http://localhost:4173";
const VIDEO_DIR = path.join(__dirname, "..", "outputs", "videos");
const OUTPUT_NAME = `sandbox-app-demo-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.webm`;
const REHEARSAL = process.argv.includes("--rehearse");

function navItem(name) {
  return `nav >> text=${name}`;
}

async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById("demo-cursor")) return;
    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.1s, top 0.1s;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
    `;
    cursor.style.left = "0px";
    cursor.style.top = "0px";
    document.body.appendChild(cursor);
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
  });
}

async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById("demo-subtitle")) return;
    const bar = document.createElement("div");
    bar.id = "demo-subtitle";
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 12px 24px;
      background: rgba(0, 0, 0, 0.75);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 16px; font-weight: 500; letter-spacing: 0.3px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.textContent = "";
    bar.style.opacity = "0";
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const bar = document.getElementById("demo-subtitle");
    if (!bar) return;
    if (t) {
      bar.textContent = t;
      bar.style.opacity = "1";
    } else {
      bar.style.opacity = "0";
    }
  }, text);
  if (text) await page.waitForTimeout(800);
}

async function ensureVisible(page, locator, label) {
  const el =
    typeof locator === "string" ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`REHEARSAL FAIL: "${label}" not found`);
    const found = await page
      .evaluate(() =>
        Array.from(
          document.querySelectorAll(
            "button, input, select, textarea, a, nav, [role='tab']",
          ),
        )
          .filter((x) => x.offsetParent !== null)
          .map(
            (x) =>
              `${x.tagName} \"${(x.textContent || "").trim().slice(0, 40)}\"`,
          )
          .join("\n  "),
      )
      .catch(() => "<cannot-dump-visible-elements>");
    console.error("  Visible elements:\n  " + found);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}

async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 1200, ...clickOpts } = opts;
  const el =
    typeof locator === "string" ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: moveAndClick skipped - "${label}" not visible`);
    return false;
  }

  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 10,
      });
      await page.waitForTimeout(350);
    }
    await el.click(clickOpts);
  } catch (e) {
    console.error(`WARNING: moveAndClick failed on "${label}": ${e.message}`);
    return false;
  }

  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, locator, text, label, charDelay = 35) {
  const el =
    typeof locator === "string" ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: typeSlowly skipped - "${label}" not visible`);
    return false;
  }

  try {
    await moveAndClick(page, el, `${label} (focus)`, { postClickDelay: 300 });
    await el.fill("");
    await el.pressSequentially(text, { delay: charDelay });
    await page.waitForTimeout(500);
  } catch (e) {
    console.error(`WARNING: typeSlowly failed on "${label}": ${e.message}`);
    return false;
  }

  return true;
}

async function panElements(page, selector, maxCount = 5) {
  const list = await page.locator(selector).all();
  for (let i = 0; i < Math.min(list.length, maxCount); i += 1) {
    try {
      const box = await list[i].boundingBox();
      if (box && box.y < 700) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
          steps: 8,
        });
        await page.waitForTimeout(600);
      }
    } catch (e) {
      console.warn(`WARNING: panElements skipped element ${i}: ${e.message}`);
    }
  }
}

async function runFlow(page) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await injectCursor(page);
  await injectSubtitleBar(page);

  await showSubtitle(page, "Step 1 - Đăng nhập / chế độ truy cập");
  await moveAndClick(
    page,
    'button:has-text("Đăng nhập")',
    "Mở modal đăng nhập",
  );
  await panElements(page, '[role="dialog"] input, [role="dialog"] button', 4);
  await moveAndClick(
    page,
    '[role="dialog"] button:has-text("Hủy")',
    "Đóng modal đăng nhập",
  );

  await showSubtitle(page, "Step 2 - Tổng quan hệ thống");
  await panElements(page, "main h3, main p, main table th", 7);
  await page.waitForTimeout(1500);

  await showSubtitle(page, "Step 3 - Quản lý Tenants");
  await moveAndClick(page, navItem("Tenants"), "Mở Tenants");
  await panElements(page, "main table th, main button", 6);
  await moveAndClick(page, "main tbody button", "Tương tác bản ghi tenant", {
    postClickDelay: 700,
  });

  await showSubtitle(page, "Step 4 - Quản lý Operators");
  await moveAndClick(page, navItem("Operators"), "Mở Operators");
  await panElements(page, "main [role='tab'], main table th", 6);
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Nonce Consumeds")',
    "Mở tab Nonce Consumeds",
  );
  await panElements(page, "main table th, main tbody button", 6);
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Operators")',
    "Quay lại tab Operators",
  );

  await showSubtitle(page, "Step 5 - Quản lý Tài liệu");
  await moveAndClick(page, navItem("Tài liệu"), "Mở Tài liệu");
  await panElements(page, "main [role='tab'], main table th, main button", 7);
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Document Qualifieds")',
    "Mở tab Document Qualifieds",
  );
  await panElements(page, "main table th, main tbody button", 6);
  await moveAndClick(
    page,
    'button:has-text("Xác thực")',
    "Mở modal xác thực tài liệu",
  );
  await typeSlowly(
    page,
    '[role="dialog"] input[placeholder="Qm..."]',
    "QmDemoCidExample123456789",
    "Nhập CID",
  );
  await typeSlowly(
    page,
    '[role="dialog"] input[placeholder="0x..."]',
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "Nhập document hash",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Documents")',
    "Quay lại tab Documents",
  );

  await showSubtitle(page, "Step 6 - CoSign Policy");
  await moveAndClick(page, navItem("CoSign Policy"), "Mở CoSign Policy");
  await panElements(
    page,
    "main [role='tab'], main table th, main tbody button",
    7,
  );
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Operator Whitelist")',
    "Mở tab Operator Whitelist",
  );
  await panElements(page, "main table th, main tbody button", 6);
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Policies")',
    "Quay lại tab Policies",
  );

  await showSubtitle(page, "Step 7 - Xử phạt & Vi phạm");
  await moveAndClick(page, navItem("Xử phạt"), "Mở màn Xử phạt");
  await typeSlowly(
    page,
    'main input[placeholder="0x..."]',
    "0x2808a2ff8f4f9f7c4a1b8a19d1234aa91bd1cad1",
    "Nhập tenant để tra cứu penalty",
  );
  await moveAndClick(
    page,
    'main button:has-text("Xem chi tiết penalty")',
    "Tra cứu chi tiết penalty",
  );
  await panElements(page, "main [role='tab'], main table th, main button", 8);
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Soft Slash")',
    "Mở tab Soft Slash",
  );
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Violation Penalties")',
    "Mở tab Violation Penalties",
  );
  await panElements(page, "main table th, main tbody button", 5);

  await showSubtitle(page, "Step 8 - Treasury");
  await moveAndClick(page, navItem("Treasury"), "Mở màn Treasury");
  await panElements(
    page,
    "main h3, main p, main table th, main [role='tab']",
    9,
  );
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Operator Unstakeds")',
    "Mở tab Operator Unstakeds",
  );
  await moveAndClick(
    page,
    '[role="tab"]:has-text("Operator Unstake Requesteds")',
    "Quay lại tab Operator Unstake Requesteds",
  );

  await showSubtitle(page, "Step 9 - Transaction Explorer");
  await moveAndClick(page, navItem("Transactions"), "Mở Transactions");
  await typeSlowly(
    page,
    'main input[placeholder*="tx hash"]',
    "0x14647b9a2ea8be4d2ab690c20f5d0f8d6f93b3486d0ad4f6f239abe2e336cabf",
    "Nhập tx hash tra cứu",
  );
  await moveAndClick(
    page,
    'main button:has-text("Tra cứu Transaction")',
    "Bấm tra cứu transaction",
  );
  await panElements(page, "main input, main button, main h3", 5);

  await showSubtitle(page, "Step 10 - Cài đặt hệ thống");
  await moveAndClick(page, navItem("Cài đặt"), "Mở modal Cài đặt");
  await panElements(
    page,
    '[role="dialog"] [role="tab"], [role="dialog"] table th, [role="dialog"] p',
    10,
  );
  await moveAndClick(
    page,
    '[role="dialog"] [role="tab"]:has-text("Theo vai trò")',
    "Mở tab Theo vai trò",
  );
  await moveAndClick(
    page,
    '[role="dialog"] [role="tab"]:has-text("Phân quyền")',
    "Mở tab Phân quyền",
  );
  await moveAndClick(
    page,
    '[role="dialog"] [role="tab"]:has-text("Cấu hình chung")',
    "Quay lại tab Cấu hình chung",
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  await showSubtitle(page, "Step 11 - Quay lại Dashboard");
  await moveAndClick(page, navItem("Tổng quan"), "Về Tổng quan");
  await page.waitForTimeout(2500);
  await showSubtitle(page, "");
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  if (REHEARSAL) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    try {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);

      const steps = [
        { label: "Nút Đăng nhập", selector: 'button:has-text("Đăng nhập")' },
        { label: "Menu Tổng quan", selector: navItem("Tổng quan") },
        { label: "Menu Tenants", selector: navItem("Tenants") },
        { label: "Menu Operators", selector: navItem("Operators") },
        { label: "Menu Tài liệu", selector: navItem("Tài liệu") },
        { label: "Menu CoSign Policy", selector: navItem("CoSign Policy") },
        { label: "Menu Xử phạt", selector: navItem("Xử phạt") },
        { label: "Menu Treasury", selector: navItem("Treasury") },
        { label: "Menu Transactions", selector: navItem("Transactions") },
        { label: "Menu Cài đặt", selector: navItem("Cài đặt") },
      ];

      let allOk = true;
      for (const step of steps) {
        if (!(await ensureVisible(page, step.selector, step.label))) {
          allOk = false;
        }
      }

      if (!allOk) {
        console.error("REHEARSAL FAILED - fix selectors before recording");
        process.exit(1);
      }
      console.log("REHEARSAL PASSED - all selectors verified");
    } finally {
      await context.close();
      await browser.close();
    }
    return;
  }

  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
  });

  const page = await context.newPage();

  try {
    await runFlow(page);
  } catch (e) {
    console.error("DEMO ERROR:", e.message);
    process.exitCode = 1;
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log("Video saved:", dest);
      } catch (e) {
        console.error("ERROR: Failed to copy video:", e.message);
        console.error("  Source:", src);
      }
    }
    await browser.close();
  }
})();
