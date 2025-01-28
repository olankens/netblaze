# <samp>OVERVIEW</samp>

Fancy network Node library with several helper functions.

<table>
  <tr align="center">
    <th><samp>AND</samp></th>
    <th><samp>IOS</samp></th>
    <th><samp>LIN</samp></th>
    <th><samp>MAC</samp></th>
    <th><samp>WIN</samp></th>
    <th><samp>WEB</samp></th>
  </tr>
  <tr align="center" height="50">
    <td width="9999">🟥</td>
    <td width="9999">🟥</td>
    <td width="9999">🟩</td>
    <td width="9999">🟩</td>
    <td width="9999">🟩</td>
    <td width="9999">🟥</td>
  </tr>
</table>

# <samp>GUIDANCE</samp>

### Import the library

```shell
npm i git://github.com/olankens/netblaze.git
```

### Download from address

```js
import { fromAddress } from "netblaze";

const address = "https://www.7-zip.org/a/7z2201-x64.exe";
const fetched = await fromAddress(address);
```

### Download from torrent

```js
import { fromTorrent } from "netblaze";

const torrent = "path/to/filename.torrent";
const deposit = await fromTorrent(torrent);
```
