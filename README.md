<p align="center">
  <img src="media/devtool-plus-logo.png" alt="Case Converter Logo" width="60" />
</p>

---

<h1 align="center">
DevTool+
</h1>

<p align="center">
A code editor extension that provides common I/O tools directly in code editor
</p>

</br>

<p align="center">
  <img src="https://raw.githubusercontent.com/fuzionix/devtool-plus/refs/heads/main/media/devtool-plus-demo.gif" alt="Demo" width="840" />
</p>

## Introduction

**DevTool+**, (DevTool Plus) is a code editor extension that provides common developer I/O tools directly into your editor — It's free, no ads, no tracking.

The extension keeping everything inside code editor and running entirely on your local machine. There are no network requests involved, making it safe to use even with private or production data. By integrating these tools directly into the development workflow, DevTool+ helps developers work faster, stay focused, and avoid relying on external websites for everyday tasks.

## Features

- [🔒 **Security**] - All tools run locally in code editor — no data is sent to external servers, ensuring privacy and offline usability.
- [🧰 **Integration with Editor**] - Directly embedded into code editor workflow; Use tools in the side panel without leaving your coding environment.
- [🛠️ **Diverse Toolset**] - Over 35 tools across categories like Data, Encoding, Design, Text, and Cryptography. (Will keep expanding)
- [📔 **Native UI Language**] - Have native-like UI components (e.g., code editors, diff viewers) powered by Lit for a polished, theme-aware interface.
- [⚡ **Real-Time Update**] - Tools I/O update instantly as you type, providing immediate feedback and results.
- [💻 **Performance**] - Built with Lit for fast, efficient rendering and minimal resource usage.
- [📌 **Pinned Tools**] - Pin your favorite tools for quick access and better organization.
- [🔍 **Searchable Tools**] - Quickly find tools by name, category, or tags.

## Installation

<p align="center">
  Directly search for "<b>DevTool+</b>" in your code editor's extension marketplace. Or install through
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=Fuzionix.devtool-plus">Visual Studio Code</a>
  <span>|</span>
  <a href="https://open-vsx.org/extension/Fuzionix/devtool-plus">Cursor</a>
  <span>|</span>
  <a href="https://open-vsx.org/extension/Fuzionix/devtool-plus">Windsurf</a>
</p>

```sh
code --install-extension Fuzionix.devtool-plus
```

## Tool List

<table align="center">
  <tr>
    <th>Tool</th>
    <th>Version</th>
    <th>Editor</th>
    <th>Progress</th>
  </tr>
  <tr>
    <th colspan="4">[Encode / Decode]</th>
  </tr>
  <tr>
    <td>Base64 Encoder / Decoder</td>
    <td align="center">1.0.1</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>URL Encoder</td>
    <td align="center">1.0.1</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>URL Parser</td>
    <td align="center">1.1.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>ASCII Binary / Hex</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Unicode Inspector</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>

  <tr>
    <th colspan="4">[UI / UX Design]</th>
  </tr>
  <tr>
    <td>Color Convertor</td>
    <td align="center">1.1.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Color Palette Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Gradient Maker</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Cubic Bezier</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Contrast Checker</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Color Mixer</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>

  <tr>
    <th colspan="4">[Data Manipulation]</th>
  </tr>
  <tr>
    <td>UUID Generator</td>
    <td align="center">1.1.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Data Format Convertor</td>
    <td align="center">1.2.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>JSON Editor</td>
    <td align="center">1.1.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>YAML Editor</td>
    <td align="center">1.1.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>HTML / XML Editor</td>
    <td align="center">1.1.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Datetime Convertor</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>File Compressor / Decompressor</td>
    <td align="center"></td>
    <td align="center"></td>
    <td align="center">🚧</td>
  </tr>
  <tr>
    <td>Random Data Generator</td>
    <td align="center"></td>
    <td align="center"></td>
    <td align="center">📝</td>
  </tr>

  <tr>
    <th colspan="4">[Text]</th>
  </tr>
  <tr>
    <td>Text Editor</td>
    <td align="center">1.0.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Difference Checker</td>
    <td align="center">1.1.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Markdown Table Builder</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Slug Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">🆕</td>
  </tr>

  <tr>
    <th colspan="4">[Utility]</th>
  </tr>
  <tr>
    <td>QR Code Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
    <tr>
    <td>HTTP Status Code</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">🆕</td>
  </tr>
  <tr>
    <td>Data Unit Converter</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">🆕</td>
  </tr>
  <tr>
    <td>UNIX / Windows Path Convertor</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Docker Compose Generator</td>
    <td align="center"></td>
    <td align="center"></td>
    <td align="center">🚧</td>
  </tr>

  <tr>
    <th colspan="4">[Cryptography]</th>
  </tr>
  <tr>
    <td>Token Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Password Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>JWT Inspector</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>AES Encryption / Decryption</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>SHA Hashing</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>RSA Key Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>RSA Encryption / Decryption</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Signature Signer / Verifier</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td colspan="4" align="right">✅ = Released | 🚧 = In Progress | 📝 = Planning</td>
  </tr>
</table>

## FAQ
❓ **Does this extension collect any telemetry or usage data?**  
🅰️ No. DevTool+ is built on the principle of absolute privacy. There are no tracking scripts, no telemetry, and no external API calls.

❓ **Will installing this extension slow down code editor?**  
🅰️ DevTool+ is built using **Lit**, a lightweight web component library. The extension and its views are only loaded into memory when you actually open the side panel or a tool, ensuring your editor remains fast and responsive.

❓ **Does it match my code editor's theme?**  
🅰️ Yes. DevTool+ uses native UI CSS variables. It will automatically adapt its colors, borders, and typography to match whatever theme you are currently using.


## License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.

---
