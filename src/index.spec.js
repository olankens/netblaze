import test from "ava";
import { promises as fs } from "fs";
import { join } from "path";
import { fromAddress, fromFilecr, fromJetbra, fromTorrent } from "./index.js";

test("fromAddress() returns fetched file", async (t) => {
  const fetched = await fromAddress("https://www.7-zip.org/a/7z2107-x64.exe");
  t.true(await fileExists(fetched));
});

test("fromFilecr() returns fetched file", async (t) => {
  t.timeout(2 * 60 * 1000);
  const fetched = await fromFilecr("https://filecr.com/windows/rufus/");
  t.true(await fileExists(fetched));
});

test("fromJetbra() returns fetched file", async (t) => {
  t.timeout(10 * 60 * 1000);
  for (const _ of Array(5).keys()) {
    const fetched = await fromJetbra();
    t.true(await fileExists(fetched));
  }
});

test("fromTorrent() returns deposit with fetched torrent", async (t) => {
  t.timeout(5 * 60 * 1000);
  const torrent = join(process.cwd(), "src", "assets", "charlie-chaplin-mabels-strange-predicament.avi.torrent");
  const deposit = await fromTorrent(torrent);
  const fetched = (await fs.readdir(deposit))[0];
  t.true((await fileExists(join(deposit, fetched))) && fetched.endsWith("avi"));
});

async function fileExists(payload) {
  try {
    await fs.access(payload);
    return true;
  } catch {
    return false;
  }
}
