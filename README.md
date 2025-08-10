<p align="center">
  <img src="media/devtool-plus-logo.png" alt="Case Converter Logo" width="60" />
</p>

---

<h1 align="center">
DevTool+
</h1>

<p align="center">
A VSCode extension that provides common I/O tools directly in code editor
</p>

</br>

<p align="center">
  <img src="media/devtool-plus-demo.gif" alt="Demo" width="800" />
</p>

## 📖 Introduction

DevTool+ brings common developer tools into VSCode. It provides a set of utilities that can be used directly in the code editor, enhancing productivity and streamlining workflows. It includes features like a calculator, unit converter, and more, all accessible without leaving the coding environment.

The extension features two main sections:

- **Side Panel**: A compact view with an upper I/O section for tool interactions and a lower section listing all tools.
- **Editor Section**: A full-screen editor panel for more complex tasks (e.g., code editing or diff checking).

Built with native VSCode UI components and Lit for a responsive, familiar experience. All tools are dynamic and customizable. 🌟

## ✨ Features

- [🔒 **Security**] - All tools run locally in VSCode—no data is sent to external servers, ensuring privacy and offline usability.
- [🧰 **Integration with Editor**] - Directly embedded into VSCode workflow; Use tools in the side panel without leaving your coding environment.
- [🛠️ **Diverse Toolset**] - Over 30 tools across categories like Data, Encoding, Design, Text, and Cryptography. (Will keep expanding)
- [📔 **Native UI Language**] - Have native-like UI components (e.g., code editors, diff viewers) powered by Lit for a polished, theme-aware interface.
- [⚡ **Real-Time Update**] - Tools like editors and converters update instantly, with features like auto-formatting, validation, and live previews.
- [💻 **Performance**] - Built with Lit for fast, efficient rendering and minimal resource usage.
- [🔍 **Searchable Tools**] - Quickly find tools by name, category, or tags.

## 📦 Installation

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=Fuzionix.devtool-plus">Install From Marketplace</a>
</p>

---

<p align="center">
  --- or ---
</p>

```sh
code --install-extension Fuzionix.devtool-plus
```

## 🧰 Tool List

<table align="center">
  <tr>
    <th>Tool</th>
    <th>Version</th>
    <th>Editor</th>
    <th>Progress</th>
  </tr>
  <tr>
    <th colspan="4">[⌛ Encode / Decode]</th>
  </tr>
  <tr>
    <td>Base64 Encoder / Decoder</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>URL Encoder</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>URL Parser</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>

  <tr>
    <th colspan="4">[📱 UI / UX Design]</th>
  </tr>
  <tr>
    <td>Color Convertor</td>
    <td align="center">1.0.0</td>
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
    <th colspan="4">[💽 Data Manipulation]</th>
  </tr>
  <tr>
    <td>UUID Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Data Format Convertor</td>
    <td align="center">1.0.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>JSON Editor</td>
    <td align="center">1.0.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>YAML Editor</td>
    <td align="center">1.0.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>HTML / XML Editor</td>
    <td align="center">1.0.0</td>
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
    <th colspan="4">[📝 Text]</th>
  </tr>
  <tr>
    <td>Text Editor</td>
    <td align="center">1.0.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>Difference Checker</td>
    <td align="center">1.0.0</td>
    <td align="center">✅</td>
    <td align="center">✅</td>
  </tr>

  <tr>
    <th colspan="4">[🧰 Utility]</th>
  </tr>
  <tr>
    <td>QR Code Generator</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>
  <tr>
    <td>UNIX / Windows Path Convertor</td>
    <td align="center">1.0.0</td>
    <td align="center"></td>
    <td align="center">✅</td>
  </tr>

  <tr>
    <th colspan="4">[🔒 Cryptography]</th>
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

## 🔐 Privacy
> [!NOTE]
> Tool logic runs locally; no data is sent to any remote service.

## 📄 License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file for details.

---
