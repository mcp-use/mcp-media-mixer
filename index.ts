import {
  MCPServer,
  text,
  object,
  array,
  markdown,
  html,
  css,
  javascript,
  xml,
  image,
  audio,
  binary,
  resource,
  mix,
  error,
} from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "media-mixer",
  title: "Media Mixer",
  version: "1.0.0",
  description:
    "Response helpers showcase — every content type (image, audio, binary, html, xml, css, js)",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [
    { src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] },
  ],
});

// ---------------------------------------------------------------------------
// image()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "generate-image",
    description: "Generate a small SVG badge returned as a base64 image.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#3b82f6"/><text x="100" y="110" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">MCP</text></svg>`;
    return image(Buffer.from(svg).toString("base64"), "image/svg+xml");
  },
);

// ---------------------------------------------------------------------------
// audio()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "generate-audio",
    description:
      "Generate a tiny WAV file (1 s of silence at 8 kHz, 8-bit mono).",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    const sampleRate = 8000;
    const numSamples = sampleRate;
    const dataSize = numSamples;
    const fileSize = 36 + dataSize;

    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(fileSize, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate, 28);
    header.writeUInt16LE(1, 32);
    header.writeUInt16LE(8, 34);
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);

    const silence = Buffer.alloc(numSamples, 128);
    return audio(
      Buffer.concat([header, silence]).toString("base64"),
      "audio/wav",
    );
  },
);

// ---------------------------------------------------------------------------
// binary() — minimal PDF
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "generate-pdf",
    description: "Generate a minimal valid PDF document.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    const pdf = [
      "%PDF-1.0",
      "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
      "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>>>endobj",
      "4 0 obj<</Length 44>>stream",
      "BT /F1 24 Tf 100 700 Td (MCP Media Mixer) Tj ET",
      "endstream",
      "endobj",
      "xref",
      "0 5",
      "0000000000 65535 f ",
      "0000000009 00000 n ",
      "0000000058 00000 n ",
      "0000000115 00000 n ",
      "0000000314 00000 n ",
      "trailer<</Size 5/Root 1 0 R>>",
      "startxref",
      "406",
      "%%EOF",
    ].join("\n");

    return binary(Buffer.from(pdf).toString("base64"), "application/pdf");
  },
);

// ---------------------------------------------------------------------------
// mix() — combined response
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "get-report",
    description:
      "Return a mixed response combining text, markdown, and an embedded resource.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return mix(
      text("Analysis Report"),
      markdown(
        "## Summary\n\n- **Records**: 1,234\n- **Anomalies**: 3\n- **Success rate**: 99.8%",
      ),
      resource(
        "report://summary",
        object({ records: 1234, anomalies: 3, successRate: 99.8 }),
      ),
    );
  },
);

// ---------------------------------------------------------------------------
// html()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "get-html-snippet",
    description: "Return an HTML snippet via the html() response helper.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return html(
      "<div style='padding:16px;background:#f0f9ff;border-radius:8px;font-family:sans-serif'>" +
        "<h2 style='color:#1e40af;margin:0'>HTML Content</h2>" +
        "<p style='color:#3b82f6'>Rendered via the <code>html()</code> response helper.</p>" +
        "</div>",
    );
  },
);

// ---------------------------------------------------------------------------
// xml()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "get-xml-config",
    description: "Return an XML configuration document.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return xml(
      '<?xml version="1.0"?>\n<config>\n  <server name="media-mixer" version="1.0.0" />\n  <feature name="image" enabled="true" />\n  <feature name="audio" enabled="true" />\n</config>',
    );
  },
);

// ---------------------------------------------------------------------------
// css()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "get-stylesheet",
    description: "Return a CSS stylesheet via the css() response helper.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return css(
      "/* Media Mixer Theme */\n:root {\n  --primary: #3b82f6;\n  --bg: #f8fafc;\n}\nbody {\n  font-family: system-ui;\n  background: var(--bg);\n  color: #1e293b;\n}",
    );
  },
);

// ---------------------------------------------------------------------------
// javascript()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "get-script",
    description:
      "Return a JavaScript snippet via the javascript() response helper.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return javascript(
      "// Media Mixer utility\nfunction formatBytes(bytes) {\n  const units = ['B', 'KB', 'MB', 'GB'];\n  let i = 0;\n  while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }\n  return `${bytes.toFixed(1)} ${units[i]}`;\n}\nconsole.log(formatBytes(1536)); // '1.5 KB'",
    );
  },
);

// ---------------------------------------------------------------------------
// array()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "get-data-array",
    description: "Return a structured array of tool records.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return array([
      { id: 1, name: "Image Generator", type: "media", status: "active" },
      { id: 2, name: "Audio Synthesizer", type: "media", status: "active" },
      { id: 3, name: "PDF Builder", type: "document", status: "active" },
    ]);
  },
);

// ---------------------------------------------------------------------------
// resource()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "embed-resource",
    description: "Return an embedded resource with structured data.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return resource(
      "data://embedded-config",
      object({
        theme: "dark",
        version: "1.0.0",
        features: ["image", "audio", "pdf"],
      }),
    );
  },
);

// ---------------------------------------------------------------------------
// error()
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "content-error",
    description:
      "Demonstrate the error() response helper by returning a deliberate failure.",
    schema: z.object({}),
    annotations: { readOnlyHint: true },
  },
  async () => {
    return error(
      "This demonstrates the error() response helper. The tool intentionally reports a failure.",
    );
  },
);

server.listen().then(() => console.log("Media Mixer running"));
