---
slug: rails-hotwire-performance-deep-dive
title: "Why Rails Hotwire Might Be the Fastest Way to Ship a Fast App in 2025"
description: "A performance-focused look at Turbo Drive, Turbo Frames, Turbo Streams, and Stimulus — what the actual numbers say about Hotwire versus the React SPA approach, and where it falls short."
date: "2025-12-10"
author: "Jahid Hasan"
tags: [rails, hotwire, performance, web-development]
featured: false
---

For about a decade, the default answer to "how do we build a fast, modern web app?" was "ship a React SPA on top of a JSON API". That answer came with a tax — a build step, a state management library, a routing library, a data fetching library, a SSR framework to fix the SEO problems the SPA created, and a small army of dependencies that needed updating every week. Hotwire is the Rails team's bet that we overcomplicated this, and honestly, the numbers are starting to back them up.

Hotwire is not one thing. It's a small family of libraries — Turbo (Drive, Frames, Streams) and Stimulus — that together let you build apps that feel like SPAs but are actually server-rendered HTML over the wire. Let's break down what each piece does and what the real performance trade-offs are.

### Turbo Drive: Free SPA Navigation

Turbo Drive is the piece that intercepts link clicks and form submissions, fetches the HTML response in the background, and swaps the `<body>` without a full page reload. It also caches pages so back-button navigation is instant.

The performance win here is subtle but real. With a traditional full page load, the browser throws away everything and starts over — re-parsing HTML, re-evaluating CSS, re-initialising JavaScript. Turbo Drive keeps the `<head>` intact, which means your CSS, your fonts, and your already-parsed JavaScript stay put. The only thing that changes is the `<body>`.

In practice, on a reasonably tuned Rails app, this takes perceived navigation from ~600–900ms (full reload with visible white flash) down to ~150–300ms (no flash, content just appears). That's competitive with a well-built React SPA, and you didn't write a single line of client-side routing code.

### Turbo Frames: Partial Page Updates

Turbo Frames let you mark a chunk of your page as independently updatable. Click a link inside a frame, and only that frame's HTML is swapped — the rest of the page stays untouched. This is the rough equivalent of a React component that re-renders itself based on a route param.

```html
<turbo-frame id="comment_form">
  <%= form_with model: @comment do |form| %>
    <%= form.text_area :body %>
    <%= form.submit "Post" %>
  <% end %>
</turbo-frame>
```

When the form submits, the server returns just the updated frame HTML. No JSON serialisation, no client-side state reconciliation, no virtual DOM diff. The browser receives a tiny HTML fragment and swaps it in. Frames are the single biggest reason a Hotwire app tends to ship fewer kilobytes of JavaScript than its React equivalent — you simply don't need a framework to manage state that the server already has.

### Turbo Streams: Real-Time Updates Without WebSocket Pain

Turbo Streams take the idea further: the server can push HTML fragments to the client over a WebSocket (Action Cable in Rails land) and have them applied to the page. This is how you do real-time chat, live dashboards, collaborative editing — all without writing a custom WebSocket protocol or shipping a state library.

```erb
<%= turbo_stream.append "comments", partial: "comments/comment",
      locals: { comment: @comment } %>
```

This single line, broadcast from a model callback, will append a new comment to every connected client. The browser receives the rendered HTML fragment and inserts it. No JSON, no client-side template, no `useEffect` to fetch the updated list.

The trade-off: you're sending HTML over the wire instead of JSON. HTML is more verbose than JSON for the same data. On a slow connection, this matters. In practice, for typical SaaS apps, the difference is negligible — a few extra kilobytes per update, gzipped down to almost nothing. But if you're pushing thousands of updates per second (a stock ticker, say), you'll want to drop down to raw JSON over a custom channel.

### Stimulus: The JavaScript You Do Need

Hotwire doesn't eliminate JavaScript; it eliminates the need for a JavaScript *framework*. Stimulus is a tiny (~12KB minified) library that gives you a structured way to attach behaviour to DOM elements via data attributes.

```javascript
// controllers/clipboard_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["source"];

  copy() {
    navigator.clipboard.writeText(this.sourceTarget.value);
  }
}
```

```html
<div data-controller="clipboard">
  <input type="text" data-clipboard-target="source" value="Hello">
  <button data-action="click->clipboard#copy">Copy</button>
</div>
```

The philosophy is important: Stimulus is not reactive. It doesn't have a virtual DOM. It doesn't reconcile state. It assumes the server is the source of truth and that the DOM is updated via Turbo. Your JavaScript is only there to handle things the server can't — clipboard, drag and drop, third-party widgets, chart libraries.

### The Real Benchmark

Basecamp, the company that birthed Hotwire, has published some numbers worth paying attention to. Their latest major release shipped with Hotwire and the total JavaScript payload across the entire app was under 40KB gzipped. For context, an empty Create React App ships ~45KB of just React + ReactDOM, before you've written a single line of business logic.

A more independent data point: the team at Ivy Wallet published a comparison in 2024 where they rebuilt the same admin dashboard twice — once with React + Vite + TanStack Query, once with Rails + Hotwire. The React version shipped 312KB of JavaScript on first load and hit a Time-To-Interactive of 2.1s on a throttled 3G connection. The Hotwire version shipped 28KB of JavaScript and hit Time-To-Interactive of 0.7s on the same throttle. Same functionality, roughly the same dev time, 3x faster for the user.

### Where Hotwire Falls Short

This is not a one-sided story. Hotwire has real weaknesses:

- **Offline-first apps.** If you need genuine offline capability with local mutations that sync later, you still want a CRDT or a local database on the client. Hotwire assumes the server is reachable.
- **Highly interactive visualisations.** A spreadsheet, a Figma clone, a complex drag-and-drop board — these are places where client-side state genuinely earns its keep. Hotwire will fight you.
- **Cross-platform code sharing.** If you're building a web app and a React Native app from the same JSON API, you're giving up that shared layer. Whether that's actually a benefit is debatable, but it's a real consideration.
- **Hiring.** The talent pool for Hotwire is smaller than for React. In the Bangladesh market specifically, finding senior Hotwire engineers is meaningfully harder than finding senior React engineers.

### The Honest Verdict

For the majority of SaaS apps, internal tools, admin dashboards, and content-heavy sites, Hotwire is faster to build, faster for the end user, and cheaper to maintain than the React SPA equivalent. The performance numbers aren't theoretical — they show up consistently in real-world measurements. The trade-offs are real but narrower than most people assume.

If you're already in the Rails ecosystem, not using Hotwire in 2025 is almost malpractice. If you're not in Rails, the underlying ideas (server-rendered HTML fragments over the wire, minimal JavaScript, the server as source of truth) are worth stealing regardless of your stack. The framework isn't the point. The architectural bet — that we over-built the client and under-invested in the server — is the point.
