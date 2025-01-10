import { promises as fs } from "fs";
import fetch from "node-fetch";
import { tmpdir } from "os";
import { setTimeout } from "node:timers/promises";
import { basename, join } from "path";
import { TimeoutError } from "puppeteer";
import puppeteer from "puppeteer-extra";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { URL } from "url";
import WebTorrent from "webtorrent";

export async function fromAddress(address) {
  const content = await fetch(address);
  const deposit = await fs.mkdtemp(join(tmpdir(), "tmp"));
  const fetched = join(deposit, await grabFilename(address));
  await fs.writeFile(fetched, content.body);
  return fetched;
}

export async function fromFilecr(address) {
  return await withBrowser(true, true, false, async (webpage, deposit) => {
    await webpage.setViewport({ height: await randInteger(800, 1000), width: await randInteger(1500, 1900) });
    await webpage.goto(address);
    await webpage.waitForSelector("#sh_pdf_download-2 > form > a");
    await webpage.waitForTimeout(2000);
    await webpage.evaluate('document.querySelector("#sh_pdf_download-2 > form > a").click()');
    await webpage.waitForSelector("a.sh_download-btn.done");
    await webpage.waitForTimeout(5000);
    await webpage.evaluate('document.querySelector("a.sh_download-btn.done").click()');
    await webpage.waitForTimeout(2000);
    await webpage.mouse.click(10, 10, { clickCount: 2 });
    return await waitCompletion(deposit);
  });
}

export async function fromJetbra(address = "https://jetbra.in/s") {
  return await withBrowser(false, false, false, async (webpage, deposit) => {
    await webpage.goto(address);
    await webpage.waitForTimeout(8000);
    const factors = await webpage.$$eval("#checker\\.results a", all => all.map((one) => one.href));
    const pattern = "body > header > p > a:nth-child(1)";
    for (let i = 0; i < factors.length; i++) {
      try {
        await webpage.goto(factors[i]);
        if ((await webpage.$$(pattern)).length === 0) continue;
        await webpage.waitForSelector(pattern);
        await webpage.waitForTimeout(2000);
        await webpage.evaluate(`document.querySelector("${pattern}").click()`);
        return await waitCompletion(deposit);
      } catch (e) {
        if (e instanceof TimeoutError) { }
      }
    }
    return null;
  });
}

export async function fromTorrent(torrent) {
  const manager = new WebTorrent();
  const deposit = await fs.mkdtemp(join(tmpdir(), "tmp"));
  const element = manager.add(torrent, { path: deposit });
  let completed = false;
  element.on("done", _ => (completed = true));
  while (completed === false) await setTimeout(2000);
  return deposit;
}

async function grabFilename(address) {
  const headers = (await fetch(address, { method: "HEAD" })).headers;
  let suggest = headers.get("Content-Disposition");
  if (suggest == null) suggest = decodeURIComponent(basename(new URL(address).pathname));
  return suggest;
}

async function randInteger(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

async function waitCompletion(deposit) {
  let element = null;
  while (element == null || element.endsWith(".crdownload")) {
    await setTimeout(1000);
    if ((await fs.readdir(deposit)).length !== 0) element = join(deposit, (await fs.readdir(deposit))[0]);
  }
  return element;
}

async function withBrowser(blocker, stealth, visible, payload) {
  blocker && puppeteer.use(AdblockerPlugin({ blockTrackers: false }));
  stealth && puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({ headless: !visible });
  try {
    const webpage = await browser.newPage();
    const deposit = await fs.mkdtemp(join(tmpdir(), "tmp"));
    const session = await webpage.target().createCDPSession();
    const { windowId } = await session.send("Browser.getWindowForTarget");
    await session.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "minimized" } });
    await session.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: deposit });
    return await payload(webpage, deposit);
  } finally {
    await browser.close();
  }
}
