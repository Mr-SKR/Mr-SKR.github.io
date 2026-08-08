/**
 * Tools.js - Developer Tools Logic
 */
(function (global) {
  "use strict";

  // --- Constants & Helpers ---

  const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  const htmlEscapesRegex = /[&<>"']/g;

  function escapeHtml(text) {
    if (!text) return text;
    return text.replace(htmlEscapesRegex, (match) => htmlEscapes[match]);
  }

  // jsrsasign throws bare strings rather than Errors for things like a malformed
  // PEM, and "Error: " + e.message renders those as "Error: undefined".
  function errorText(e) {
    if (e && e.message) return e.message;
    if (typeof e === "string" && e) return e;
    return String(e);
  }

  // Writes a short sentence into the polite live region on the page. Every tool
  // renders its result into a panel that a screen reader has no reason to
  // re-read, so without this the buttons are silent: press Format, hear
  // nothing, and there is no way to tell success from failure.
  //
  // Re-setting identical text does not re-announce in most screen readers, so a
  // repeated action (formatting twice) clears the node first to force it.
  let statusTimer = null;
  function announce(message) {
    const region = document.getElementById("toolStatus");
    if (!region) return;
    clearTimeout(statusTimer);
    region.textContent = "";
    statusTimer = setTimeout(() => {
      region.textContent = message;
    }, 60);
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function copyToClipboard(elementId, btn) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let text;
    if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
      text = element.value;
    } else {
      // Try to get content excluding line numbers
      const lines = element.querySelectorAll(".line-content, .diff-line-content");
      if (lines.length > 0) {
        text = Array.from(lines)
          .map((el) => el.textContent)
          .join("\n");
      } else {
        text = element.textContent;
      }
    }

    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const originalText = btn.innerText;
      btn.innerText = "Copied!";
      btn.disabled = true; // Disable to prevent spamming
      announce("Copied to clipboard.");
      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
      }, 2000);
    });
  }

  function checkInput(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (input && btn) {
      btn.disabled = !input.value.trim();
    }
  }

  function handleFileSelect(fileInput, targetTextareaId, copyBtnId, filenameInputId) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const textarea = document.getElementById(targetTextareaId);
      textarea.value = content;
      checkInput(targetTextareaId, copyBtnId);
      textarea.dispatchEvent(new Event("input"));

      if (filenameInputId) {
        let filename = file.name;
        const lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex !== -1) {
          filename = filename.substring(0, lastDotIndex);
        }
        document.getElementById(filenameInputId).value = filename;
      }
      fileInput.value = "";
    };
    reader.onerror = function (e) {
      alert("Error reading file: " + e.target.error);
    };
    reader.readAsText(file);
  }

  function triggerDownload(content, filenameInputId, timestampCheckboxId, extension, type) {
    if (!content) return;

    let filename = document.getElementById(filenameInputId).value.trim();
    const useTimestamp = document.getElementById(timestampCheckboxId).checked;

    if (useTimestamp) {
      const now = new Date();
      const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");
      filename = filename ? `${filename}_${timestamp}` : `output_${timestamp}`;
    } else {
      filename = filename ? filename : "output";
    }

    if (!filename.toLowerCase().endsWith(extension)) {
      filename += extension;
    }

    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getTextFromOutput(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const lines = element.querySelectorAll(".line-content");
    if (lines.length > 0) {
      return Array.from(lines).map((el) => el.textContent).join("\n");
    }
    return element.textContent;
  }

  // --- JSON Formatter ---

  let formatJsonTask = null;

  function formatJSON() {
    const input = document.getElementById("jsonInput").value;
    const output = document.getElementById("jsonOutput");
    const indentSelect = document.getElementById("jsonIndent").value;
    const copyBtn = document.getElementById("jsonCopyBtn");
    const downloadBtn = document.getElementById("jsonOutputDownloadBtn");

    if (formatJsonTask) {
      cancelAnimationFrame(formatJsonTask);
      formatJsonTask = null;
    }

    if (!input.trim()) {
      output.textContent = "";
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      return;
    }

    let indent = 4;
    if (indentSelect === "tab") {
      indent = "\t";
    } else {
      indent = parseInt(indentSelect, 10);
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);

      output.innerHTML = "";
      const lines = formatted.split("\n");
      let lineIndex = 0;

      function renderChunk() {
        const startTime = performance.now();
        let chunk = "";

        while (lineIndex < lines.length) {
          chunk += `<div class="code-line"><span class="line-number">${lineIndex + 1}</span><span class="line-content">${escapeHtml(lines[lineIndex])}</span></div>`;
          lineIndex++;

          if (lineIndex % 100 === 0 && performance.now() - startTime > 20) {
            output.insertAdjacentHTML('beforeend', chunk);
            formatJsonTask = requestAnimationFrame(renderChunk);
            return;
          }
        }
        output.insertAdjacentHTML('beforeend', chunk);
        output.style.borderColor = "#ced4da";
        copyBtn.disabled = false;
        if (downloadBtn) downloadBtn.disabled = false;
        formatJsonTask = null;
        // Announced from here rather than after renderChunk() is first called,
        // because large documents finish across several animation frames.
        announce("JSON formatted, " + lines.length + " lines.");
      }
      renderChunk();
    } catch (e) {
      output.textContent = "Invalid JSON: " + e.message;
      output.style.borderColor = "red";
      copyBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      announce("Invalid JSON. " + errorText(e));
    }
  }

  function handleJsonUpload(fileInput) {
    handleFileSelect(fileInput, "jsonInput", "jsonInputCopyBtn", "jsonFileName");
  }

  function downloadJsonOutput() {
    const text = getTextFromOutput("jsonOutput");
    if (!text) return;
    triggerDownload(text, "jsonFileName", "jsonTimestamp", ".json", "application/json");
  }

  // --- JSON Diff ---

  let currentDiffData = null;
  let currentDiffView = "inline";
  let currentDiffIndex = -1;
  let renderDiffTask = null;

  function scrollToControls() {
    const controls = document.querySelector("#diff .sticky-controls");
    if (controls) {
      const rect = controls.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - 10;
      window.scrollTo({
        top: top,
        behavior: "smooth",
      });
    }
  }

  function compareJSON() {
    const input1 = document.getElementById("jsonDiff1").value;
    const input2 = document.getElementById("jsonDiff2").value;
    const output = document.getElementById("diffOutput");
    const controls = document.getElementById("diffControls");

    if (renderDiffTask) {
      cancelAnimationFrame(renderDiffTask);
      renderDiffTask = null;
    }

    if (!input1.trim() && !input2.trim()) {
      output.innerHTML = "";
      output.style.borderColor = "#ced4da";
      controls.style.display = "none";
      currentDiffData = null;
      return;
    }

    output.innerHTML =
      '<div class="d-flex justify-content-center align-items-center p-3"><div class="spinner-border text-primary mr-2" role="status"></div><span class="text-muted">Computing diff...</span></div>';

    let obj1, obj2;
    try {
      obj1 = input1.trim() ? JSON.parse(input1) : {};
    } catch (e) {
      output.innerHTML = "";
      output.textContent = "Invalid JSON in Original JSON: " + e.message;
      output.style.borderColor = "red";
      controls.style.display = "none";
      currentDiffData = null;
      output.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    try {
      obj2 = input2.trim() ? JSON.parse(input2) : {};
    } catch (e) {
      output.innerHTML = "";
      output.textContent = "Invalid JSON in Modified JSON: " + e.message;
      output.style.borderColor = "red";
      controls.style.display = "none";
      currentDiffData = null;
      output.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const workerCode = `
      self.onmessage = function(e) {
        const { obj1, obj2 } = e.data;

        function fastDiff(text1, text2) {
          const lines1 = text1.split('\\n');
          const lines2 = text2.split('\\n');
          const diffs = [];
          let i = 0;
          let j = 0;

          while (i < lines1.length || j < lines2.length) {
            if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
              let text = lines1[i] + '\\n';
              let count = 1;
              i++; j++;
              while (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
                text += lines1[i] + '\\n';
                count++;
                i++; j++;
              }
              diffs.push({ value: text, count: count });
            } else {
              let foundIn2 = -1;
              let foundIn1 = -1;

              if (i < lines1.length) {
                const maxLookahead = Math.min(j + 1000, lines2.length);
                for (let k = j; k < maxLookahead; k++) {
                  if (lines2[k] === lines1[i]) {
                    foundIn2 = k;
                    break;
                  }
                }
              }

              if (j < lines2.length) {
                const maxLookahead = Math.min(i + 1000, lines1.length);
                for (let k = i; k < maxLookahead; k++) {
                  if (lines1[k] === lines2[j]) {
                    foundIn1 = k;
                    break;
                  }
                }
              }
              
              if (foundIn2 !== -1 && (foundIn1 === -1 || foundIn2 - j < foundIn1 - i)) {
                const addedLines = lines2.slice(j, foundIn2);
                diffs.push({ value: addedLines.join('\\n') + '\\n', count: addedLines.length, added: true });
                j = foundIn2;
              } else if (foundIn1 !== -1) {
                const removedLines = lines1.slice(i, foundIn1);
                diffs.push({ value: removedLines.join('\\n') + '\\n', count: removedLines.length, removed: true });
                i = foundIn1;
              } else {
                if (i < lines1.length && j < lines2.length) {
                  diffs.push({ value: lines1[i] + '\\n', count: 1, removed: true });
                  diffs.push({ value: lines2[j] + '\\n', count: 1, added: true });
                  i++; j++;
                } else if (i < lines1.length) {
                  diffs.push({ value: lines1[i] + '\\n', count: 1, removed: true });
                  i++;
                } else {
                  const addedLines = lines2.slice(j);
                  diffs.push({ value: addedLines.join('\\n') + '\\n', count: addedLines.length, added: true });
                  j = lines2.length;
                }
              }
            }
          }
          return diffs;
        }

        try {
          const str1 = JSON.stringify(obj1, null, 2);
          const str2 = JSON.stringify(obj2, null, 2);
          const diff = fastDiff(str1, str2);
          self.postMessage({ success: true, diff: diff });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = function (e) {
      if (e.data.success) {
        currentDiffData = e.data.diff;
        currentDiffIndex = -1;
        controls.style.display = "block";
        renderDiff();
        scrollToControls();
      } else {
        output.innerHTML = "";
        output.textContent = e.data.error;
        output.style.borderColor = "red";
        controls.style.display = "none";
        currentDiffData = null;
        output.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    worker.onerror = function (e) {
      output.innerHTML = "";
      output.textContent = "Worker Error: " + e.message;
      output.style.borderColor = "red";
      controls.style.display = "none";
      currentDiffData = null;
      output.scrollIntoView({ behavior: "smooth", block: "start" });
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    worker.postMessage({ obj1, obj2 });
  }

  function setDiffView(view) {
    currentDiffView = view;
    const output = document.getElementById("diffOutput");
    // Preserve height to prevent scroll jumping
    if (output.offsetHeight > 100) {
      output.style.minHeight = output.offsetHeight + "px";
    }
    output.innerHTML =
      '<div class="d-flex justify-content-center align-items-center p-3"><div class="spinner-border text-primary mr-2" role="status"></div><span class="text-muted">Rendering...</span></div>';
    setTimeout(renderDiff, 10);
    setTimeout(scrollToControls, 50);
  }

  function renderDiff() {
    let output = document.getElementById("diffOutput");
    if (!currentDiffData) return;

    if (renderDiffTask) {
      cancelAnimationFrame(renderDiffTask);
      renderDiffTask = null;
    }

    const newOutput = output.cloneNode(false);
    output.parentNode.replaceChild(newOutput, output);
    output = newOutput;

    currentDiffIndex = -1;
    let leftLineNum = 1;
    let rightLineNum = 1;
    let wasLastLineChange = false;

    let partIndex = 0;
    let lineIndex = 0;
    let currentLines = null;
    let currentRightLines = null;
    let isAligned = false;

    if (currentDiffView === "inline") {
      output.style.padding = "10px";
      output.style.fontFamily =
        'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    } else {
      output.style.padding = "0";
    }

    function renderChunk() {
      const startTime = performance.now();
      const fragment = document.createDocumentFragment();

      while (partIndex < currentDiffData.length) {
        const part = currentDiffData[partIndex];

        if (!currentLines) {
          currentLines = part.value.split("\n");
          if (currentLines[currentLines.length - 1] === "") currentLines.pop();
          wasLastLineChange = false;

          isAligned = false;
          currentRightLines = null;
          if (part.removed && partIndex + 1 < currentDiffData.length) {
            const nextPart = currentDiffData[partIndex + 1];
            if (nextPart.added) {
              isAligned = true;
              currentRightLines = nextPart.value.split("\n");
              if (currentRightLines[currentRightLines.length - 1] === "")
                currentRightLines.pop();
            }
          }
        }

        const maxLines = isAligned
          ? Math.max(currentLines.length, currentRightLines.length)
          : currentLines.length;

        while (lineIndex < maxLines) {
          const line = currentLines[lineIndex];
          let isChange = false;

          if (currentDiffView === "inline") {
            if (isAligned) {
              const wrapper = document.createElement("div");
              wrapper.className = "diff-change";

              const leftText =
                lineIndex < currentLines.length ? currentLines[lineIndex] : null;
              const rightText =
                lineIndex < currentRightLines.length
                  ? currentRightLines[lineIndex]
                  : null;

              const createInlineLine = (text, type, num) => {
                const div = document.createElement("div");
                div.className = "diff-line-wrapper";
                div.style.color = type === "removed" ? "#dc3545" : "#28a745";
                div.style.backgroundColor =
                  type === "removed" ? "#ffebe9" : "#e6ffec";
                const numSpan = document.createElement("span");
                numSpan.className = "diff-line-num";
                numSpan.textContent = num;
                const contentSpan = document.createElement("span");
                contentSpan.className = "diff-line-content";
                contentSpan.textContent = text;
                div.appendChild(numSpan);
                div.appendChild(contentSpan);
                return div;
              };

              isChange = true;
              if (leftText !== null)
                wrapper.appendChild(
                  createInlineLine(leftText, "removed", leftLineNum++),
                );
              if (rightText !== null)
                wrapper.appendChild(
                  createInlineLine(rightText, "added", rightLineNum++),
                );
              fragment.appendChild(wrapper);
            } else {
              if (part.added || part.removed) isChange = true;
              const color = part.added
                ? "#28a745"
                : part.removed
                  ? "#dc3545"
                  : "grey";
              const backgroundColor = part.added
                ? "#e6ffec"
                : part.removed
                  ? "#ffebe9"
                  : "transparent";

              const div = document.createElement("div");
              div.className = "diff-line-wrapper";
              div.style.color = color;
              div.style.backgroundColor = backgroundColor;

              if (part.added || part.removed) {
                div.classList.add("diff-change");
              }

              const numSpan = document.createElement("span");
              numSpan.className = "diff-line-num";
              if (part.removed) numSpan.textContent = leftLineNum++;
              else if (part.added) numSpan.textContent = rightLineNum++;
              else {
                leftLineNum++;
                numSpan.textContent = rightLineNum++;
              }
              const contentSpan = document.createElement("span");
              contentSpan.className = "diff-line-content";
              contentSpan.textContent = line;
              div.appendChild(numSpan);
              div.appendChild(contentSpan);
              fragment.appendChild(div);
            }
          } else {
            const row = document.createElement("div");
            row.className = "diff-row";

            const leftCol = document.createElement("div");
            leftCol.className = "diff-col";
            const rightCol = document.createElement("div");
            rightCol.className = "diff-col";

            const createLine = (num, text) => {
              const wrapper = document.createElement("div");
              wrapper.className = "diff-line-wrapper";
              const numSpan = document.createElement("span");
              numSpan.className = "diff-line-num";
              numSpan.textContent = num;
              const contentSpan = document.createElement("span");
              contentSpan.className = "diff-line-content";
              contentSpan.textContent = text;
              wrapper.appendChild(numSpan);
              wrapper.appendChild(contentSpan);
              return wrapper;
            };

            if (isAligned) {
              isChange = true;
              row.classList.add("diff-change");

              const leftText =
                lineIndex < currentLines.length ? currentLines[lineIndex] : null;
              const rightText =
                lineIndex < currentRightLines.length
                  ? currentRightLines[lineIndex]
                  : null;

              if (leftText !== null) {
                leftCol.classList.add("diff-removed");
                leftCol.appendChild(createLine(leftLineNum++, leftText));
              } else {
                leftCol.classList.add("diff-spacer");
              }

              if (rightText !== null) {
                rightCol.classList.add("diff-added");
                rightCol.appendChild(createLine(rightLineNum++, rightText));
              } else {
                rightCol.classList.add("diff-spacer");
              }
            } else {
              if (part.added || part.removed) {
                isChange = true;
                row.classList.add("diff-change");
              }

              if (part.removed) {
                leftCol.classList.add("diff-removed");
                leftCol.appendChild(createLine(leftLineNum++, line));
                rightCol.classList.add("diff-spacer");
              } else if (part.added) {
                leftCol.classList.add("diff-spacer");
                rightCol.classList.add("diff-added");
                rightCol.appendChild(createLine(rightLineNum++, line));
              } else {
                leftCol.appendChild(createLine(leftLineNum++, line));
                rightCol.appendChild(createLine(rightLineNum++, line));
              }
            }

            row.appendChild(leftCol);
            row.appendChild(rightCol);
            fragment.appendChild(row);
          }

          if (isChange) {
            if (!wasLastLineChange) {
              const lastChild = fragment.lastChild;
              if (lastChild) {
                lastChild.classList.add("diff-group-start");
              }
            }
            wasLastLineChange = true;
          } else {
            wasLastLineChange = false;
          }

          lineIndex++;

          if (lineIndex % 50 === 0 && performance.now() - startTime > 20) {
            output.appendChild(fragment);
            renderDiffTask = requestAnimationFrame(renderChunk);
            return;
          }
        }

        partIndex++;
        if (isAligned) {
          partIndex++;
        }
        lineIndex = 0;
        currentLines = null;
        currentRightLines = null;
        isAligned = false;
      }

      output.appendChild(fragment);
      renderDiffTask = null;
      output.style.minHeight = "100px";

      const changes = document.querySelectorAll(".diff-group-start");
      if (document.getElementById("diffCount")) {
        document.getElementById("diffCount").textContent = "0/" + changes.length;
      }
      updateDiffButtons(-1, changes.length);
      announce(
        changes.length === 0
          ? "Comparison complete. The two documents are identical."
          : "Comparison complete, " +
              changes.length +
              (changes.length === 1 ? " difference." : " differences."),
      );
    }

    renderChunk();
  }

  function navigateDiff(direction) {
    const changes = document.querySelectorAll(".diff-group-start");
    if (changes.length === 0) return;

    if (currentDiffIndex !== -1 && changes[currentDiffIndex]) {
      changes[currentDiffIndex].classList.remove("diff-highlight");
    }

    currentDiffIndex += direction;
    if (currentDiffIndex < 0) currentDiffIndex = 0;
    if (currentDiffIndex >= changes.length) currentDiffIndex = changes.length - 1;

    const target = changes[currentDiffIndex];

    const header = document.querySelector("#diff .sticky-controls");
    const headerHeight = header ? header.offsetHeight : 0;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: targetTop - headerHeight - 40,
      behavior: "smooth",
    });
    target.classList.add("diff-highlight");

    if (document.getElementById("diffCount")) {
      document.getElementById("diffCount").textContent =
        currentDiffIndex + 1 + "/" + changes.length;
    }
    updateDiffButtons(currentDiffIndex, changes.length);
  }

  function updateDiffButtons(index, total) {
    const prevBtn = document.getElementById("diffPrevBtn");
    const nextBtn = document.getElementById("diffNextBtn");
    if (!prevBtn || !nextBtn) return;

    if (total === 0) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    } else {
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= total - 1;
    }
  }

  function handleFileUpload(fileInput, targetTextareaId, copyBtnId) {
    handleFileSelect(fileInput, targetTextareaId, copyBtnId, null);
  }

  // --- JWT Tools ---

  // jsrsasign is 341 KB and only RS/PS/ES signing and verification need it --
  // HMAC is handled by crypto-js, which is a fraction of the size. Fetching it
  // on demand keeps it off the critical path for the majority of visitors who
  // never touch an asymmetric algorithm.
  //
  // Load order still matters once it arrives: jsrsasign carries its own
  // CryptoJS 3.1.2 behind `var CryptoJS = CryptoJS || (...)`, so crypto-js 4.x
  // must already be global (it is -- it ships in the page) or every HMAC on
  // this page would silently downgrade.
  const JSRSASIGN_SRC = "assets/js/jsrsasign-all-min.js";
  let jsrsasignLoad = null;

  function loadJsrsasign() {
    if (typeof KJUR !== "undefined") return Promise.resolve();
    if (!jsrsasignLoad) {
      jsrsasignLoad = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = JSRSASIGN_SRC;
        script.onload = () => resolve();
        script.onerror = () => {
          // Cleared so a later attempt can retry rather than reusing the
          // rejected promise forever.
          jsrsasignLoad = null;
          reject(new Error("Could not load the signature library"));
        };
        document.head.appendChild(script);
      });
    }
    return jsrsasignLoad;
  }

  const ASYMMETRIC_ALGS = [
    "RS256",
    "RS384",
    "RS512",
    "PS256",
    "PS384",
    "PS512",
    "ES256",
    "ES384",
    "ES512",
  ];

  function base64UrlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function wordArrayToBase64Url(wordArray) {
    return CryptoJS.enc.Base64.stringify(wordArray)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function decodeJWT() {
    let input = document.getElementById("jwtInput").value.trim();
    const secret = document.getElementById("jwtVerifySecret").value;
    const publicKey = document.getElementById("jwtVerifyPublicKey").value;
    const headerOutput = document.getElementById("jwtHeader");
    const payloadOutput = document.getElementById("jwtPayload");
    const verificationStatus = document.getElementById("jwtVerificationStatus");
    const headerCopyBtn = document.getElementById("jwtHeaderCopyBtn");
    const payloadCopyBtn = document.getElementById("jwtPayloadCopyBtn");

    // Handle Bearer prefix
    if (input.toLowerCase().startsWith("bearer ")) {
      input = input.slice(7).trim();
    }

    try {
      if (!input) {
        headerOutput.textContent = "";
        payloadOutput.textContent = "";
        verificationStatus.textContent = "";
        headerCopyBtn.disabled = true;
        payloadCopyBtn.disabled = true;
        return;
      }

      const header = jwt_decode(input, { header: true });
      const payload = jwt_decode(input);
      headerOutput.textContent = JSON.stringify(header, null, 4);
      payloadOutput.textContent = JSON.stringify(payload, null, 4);
      headerCopyBtn.disabled = false;
      payloadCopyBtn.disabled = false;

      const alg = header.alg ? header.alg.toUpperCase() : "HS256";
      const parts = input.split(".");

      // Cleared up front. Every branch below either sets its own status or
      // deliberately leaves none, and the previous token's result must never
      // be left standing where it reads as a verdict on this one.
      verificationStatus.textContent = "";

      // The verdict is conveyed visually by colour and an icon, neither of
      // which reaches a screen reader, so each branch also announces in words.
      // This is the one result on the page where silence could be read as
      // success, so it matters more here than anywhere else.
      const verified = () => {
        verificationStatus.innerHTML =
          '<span class="text-success"><i class="bx bx-check-circle"></i> Signature Verified</span>';
        announce("Token decoded. Signature verified.");
      };
      const invalid = () => {
        verificationStatus.innerHTML =
          '<span class="text-danger"><i class="bx bx-x-circle"></i> Invalid Signature</span>';
        announce("Token decoded. Invalid signature.");
      };
      // alg comes straight out of an untrusted token, so it is escaped before
      // it ever reaches innerHTML.
      const needs = (what) => {
        verificationStatus.innerHTML = `<span class="text-warning"><i class="bx bx-error"></i> ${escapeHtml(what)}</span>`;
        announce("Token decoded. " + what);
      };

      if (parts.length !== 3 || !parts[2]) {
        needs("No signature on this token to verify");
      } else if (alg.startsWith("HS")) {
        const signatureToVerify = `${parts[0]}.${parts[1]}`;
        const hmac = {
          HS256: CryptoJS.HmacSHA256,
          HS384: CryptoJS.HmacSHA384,
          HS512: CryptoJS.HmacSHA512,
        }[alg];

        if (!hmac) {
          needs(`Algorithm ${alg} not supported for verification`);
        } else if (!secret) {
          // Hashing with an empty secret and reporting "Invalid Signature"
          // blames the token for a field the user simply has not filled in.
          needs("Secret required for verification");
        } else if (
          wordArrayToBase64Url(hmac(signatureToVerify, secret)) === parts[2]
        ) {
          verified();
        } else {
          invalid();
        }
      } else if (ASYMMETRIC_ALGS.includes(alg)) {
        if (!publicKey) {
          needs("Public Key required for verification");
        } else {
          // Header and payload are already on screen; only the verdict waits
          // on the library, so say so rather than looking frozen.
          needs("Loading signature library…");
          try {
            await loadJsrsasign();
          } catch (err) {
            needs("Could not load the signature library");
            return;
          }
          if (KJUR.jws.JWS.verify(input, publicKey, [alg])) {
            verified();
          } else {
            invalid();
          }
        }
      } else {
        needs(`Algorithm ${alg} not supported for verification`);
      }
    } catch (e) {
      headerOutput.textContent = "Error decoding token";
      payloadOutput.textContent = "Error: " + errorText(e);
      verificationStatus.textContent = "";
      headerCopyBtn.disabled = true;
      payloadCopyBtn.disabled = true;
    }
  }

  function updateJwtHeader() {
    const alg = document.getElementById("jwtAlgSelect").value;
    const headerInput = document.getElementById("jwtHeaderInput");

    // Picking RS/PS/ES is the earliest reliable signal that the library will be
    // wanted. Warming it here means the download overlaps with the user typing
    // their key instead of stalling the Encode click. Failure is ignored: the
    // real attempt at sign time surfaces it.
    if (ASYMMETRIC_ALGS.includes(alg)) {
      loadJsrsasign().catch(() => {});
    }

    try {
      const header = JSON.parse(headerInput.value);
      header.alg = alg;
      headerInput.value = JSON.stringify(header, null, 4);
    } catch (e) {
      const header = {
        alg: alg,
        typ: "JWT",
      };
      headerInput.value = JSON.stringify(header, null, 4);
    }
    checkInput("jwtHeaderInput", "jwtHeaderInputCopyBtn");
  }

  async function encodeJWT() {
    const headerInput = document.getElementById("jwtHeaderInput").value;
    const payloadInput = document.getElementById("jwtPayloadInput").value;
    const secret = document.getElementById("jwtSecretInput").value;
    const privateKey = document.getElementById("jwtPrivateKeyInput").value;
    const output = document.getElementById("jwtOutput");
    const copyBtn = document.getElementById("jwtOutputCopyBtn");

    try {
      const header = JSON.parse(headerInput);
      const payload = JSON.parse(payloadInput);

      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));

      let token = `${encodedHeader}.${encodedPayload}`;
      const alg = header.alg ? header.alg.toUpperCase() : "HS256";

      if (alg === "NONE") {
        token += ".";
      } else if (alg.startsWith("HS")) {
        let signature;
        if (alg === "HS256") {
          signature = CryptoJS.HmacSHA256(token, secret);
        } else if (alg === "HS384") {
          signature = CryptoJS.HmacSHA384(token, secret);
        } else if (alg === "HS512") {
          signature = CryptoJS.HmacSHA512(token, secret);
        } else {
          throw new Error(
            `Algorithm ${alg} not supported for signing (only HS256, HS384, HS512)`,
          );
        }

        const base64Signature = wordArrayToBase64Url(signature);
        token += `.${base64Signature}`;
      } else if (ASYMMETRIC_ALGS.includes(alg)) {
        if (!privateKey)
          throw new Error(`Private Key required for ${alg} algorithm`);
        await loadJsrsasign();
        token = KJUR.jws.JWS.sign(
          alg,
          JSON.stringify(header),
          JSON.stringify(payload),
          privateKey,
        );
      } else {
        throw new Error(`Algorithm ${alg} not supported`);
      }

      output.value = token;
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = false;
    } catch (e) {
      output.value = "Error: " + errorText(e);
      output.style.borderColor = "red";
      copyBtn.disabled = true;
    }
  }

  // --- Base64 Tools ---

  function base64Encode() {
    const input = document.getElementById("base64Input").value;
    const output = document.getElementById("base64Output");
    const copyBtn = document.getElementById("base64OutputCopyBtn");
    try {
      const wordArray = CryptoJS.enc.Utf8.parse(input);
      output.value = CryptoJS.enc.Base64.stringify(wordArray);
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = false;
      announce("Encoded to Base64.");
    } catch (e) {
      output.value = "Error: " + e.message;
      output.style.borderColor = "red";
      copyBtn.disabled = true;
      announce("Base64 encoding failed. " + errorText(e));
    }
  }

  function base64Decode() {
    const input = document.getElementById("base64Input").value;
    const output = document.getElementById("base64Output");
    const copyBtn = document.getElementById("base64OutputCopyBtn");
    try {
      const wordArray = CryptoJS.enc.Base64.parse(input);
      output.value = CryptoJS.enc.Utf8.stringify(wordArray);
      if (!output.value && input) throw new Error("Invalid Base64 or not UTF-8");
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = false;
      announce("Decoded from Base64.");
    } catch (e) {
      output.value = "Error: " + e.message;
      output.style.borderColor = "red";
      copyBtn.disabled = true;
      announce("Base64 decoding failed. " + errorText(e));
    }
  }

  // --- URL Tools ---

  function urlEncode() {
    const input = document.getElementById("urlInput").value;
    const output = document.getElementById("urlOutput");
    const copyBtn = document.getElementById("urlOutputCopyBtn");
    try {
      output.value = encodeURIComponent(input);
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = false;
      announce("URL encoded.");
    } catch (e) {
      output.value = "Error: " + e.message;
      output.style.borderColor = "red";
      copyBtn.disabled = true;
      announce("URL encoding failed. " + errorText(e));
    }
  }

  function urlDecode() {
    const input = document.getElementById("urlInput").value;
    const output = document.getElementById("urlOutput");
    const copyBtn = document.getElementById("urlOutputCopyBtn");
    try {
      output.value = decodeURIComponent(input);
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = false;
      announce("URL decoded.");
    } catch (e) {
      output.value = "Error: " + e.message;
      output.style.borderColor = "red";
      copyBtn.disabled = true;
      announce("URL decoding failed. " + errorText(e));
    }
  }

  // --- YAML/JSON Tools ---

  function yamlToJson() {
    const input = document.getElementById("yamlJsonInput").value;
    const output = document.getElementById("yamlJsonOutput");
    const copyBtn = document.getElementById("yamlJsonOutputCopyBtn");
    const downloadBtn = document.getElementById("yamlJsonOutputDownloadBtn");

    try {
      const obj = jsyaml.load(input);
      const json = JSON.stringify(obj, null, 4);
      output.innerHTML = json
        .split("\n")
        .map(
          (line, index) =>
            `<div class="code-line"><span class="line-number">${index + 1}</span><span class="line-content">${escapeHtml(line)}</span></div>`,
        )
        .join("");
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
      announce("Converted YAML to JSON.");
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      output.textContent = "Error converting YAML to JSON: " + e.message;
      output.style.borderColor = "red";
      copyBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      announce("YAML to JSON conversion failed. " + errorText(e));
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function jsonToYaml() {
    const input = document.getElementById("yamlJsonInput").value;
    const output = document.getElementById("yamlJsonOutput");
    const copyBtn = document.getElementById("yamlJsonOutputCopyBtn");
    const downloadBtn = document.getElementById("yamlJsonOutputDownloadBtn");

    try {
      const obj = JSON.parse(input);
      const yaml = jsyaml.dump(obj);
      output.innerHTML = yaml
        .split("\n")
        .map(
          (line, index) =>
            `<div class="code-line"><span class="line-number">${index + 1}</span><span class="line-content">${escapeHtml(line)}</span></div>`,
        )
        .join("");
      output.style.borderColor = "#ced4da";
      copyBtn.disabled = false;
      if (downloadBtn) downloadBtn.disabled = false;
      announce("Converted JSON to YAML.");
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      output.textContent = "Error converting JSON to YAML: " + e.message;
      output.style.borderColor = "red";
      copyBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      announce("JSON to YAML conversion failed. " + errorText(e));
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleYamlJsonUpload(fileInput) {
    handleFileSelect(fileInput, "yamlJsonInput", "yamlJsonInputCopyBtn", "yamlJsonFileName");
  }

  function downloadYamlJsonOutput() {
    const text = getTextFromOutput("yamlJsonOutput");
    if (!text) return;

    let extension = ".yaml";
    let type = "text/yaml";

    try {
      JSON.parse(text);
      extension = ".json";
      type = "application/json";
    } catch (e) {
      // Not JSON, keep default as YAML
    }

    triggerDownload(text, "yamlJsonFileName", "yamlJsonTimestamp", extension, type);
  }

  // --- Initialization ---

  function setupLineNumbers(textareaId) {
    const textarea = document.getElementById(textareaId);
    const lineNums = document.getElementById(textareaId + "LineNums");
    if (!textarea || !lineNums) return;

    const update = debounce(() => {
      const lines = textarea.value.split("\n").length;
      const currentCount = lineNums.childElementCount;
      if (currentCount !== lines) {
        if (lines > currentCount) {
          const fragment = document.createDocumentFragment();
          for (let i = currentCount + 1; i <= lines; i++) {
            const div = document.createElement("div");
            div.textContent = i;
            fragment.appendChild(div);
          }
          lineNums.appendChild(fragment);
        } else {
          while (lineNums.childElementCount > lines) {
            lineNums.removeChild(lineNums.lastChild);
          }
        }
      }
    }, 10);

    const syncScroll = () => {
      lineNums.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener("input", update);
    textarea.addEventListener("scroll", syncScroll);
    update();
  }

  // --- Event wiring ---
  //
  // The markup used to call these directly through inline onclick/oninput/
  // onchange attributes, which forced script-src to allow 'unsafe-inline' --
  // on a page where people paste private keys, that is the one concession
  // worth not making. Elements now name an action, and dispatch happens here
  // against these tables. Nothing resolves through the global object, so a
  // stray or injected data-action can only ever reach a listed entry.
  //
  // Each handler receives (element, args), where args is the comma-separated
  // data-args list. Wrapping rather than referencing the functions directly
  // keeps the tables honest about argument order, which differs between them:
  // copyToClipboard takes the id first, handleFileUpload takes the element.

  const CLICK_ACTIONS = {
    format: () => formatJSON(),
    compare: () => compareJSON(),
    decodeJwt: () => decodeJWT(),
    encodeJwt: () => encodeJWT(),
    base64Encode: () => base64Encode(),
    base64Decode: () => base64Decode(),
    urlEncode: () => urlEncode(),
    urlDecode: () => urlDecode(),
    yamlToJson: () => yamlToJson(),
    jsonToYaml: () => jsonToYaml(),
    downloadJson: () => downloadJsonOutput(),
    downloadYamlJson: () => downloadYamlJsonOutput(),
    copy: (el, args) => copyToClipboard(args[0], el),
    diffView: (el, args) => setDiffView(args[0]),
    diffNav: (el, args) => navigateDiff(Number(args[0])),
    // The real <input type="file"> is visually hidden; a styled button stands
    // in for it and forwards the click.
    openFilePicker: (el, args) => {
      const input = document.getElementById(args[0]);
      if (input) input.click();
    },
  };

  const INPUT_ACTIONS = {
    checkInput: (el, args) => checkInput(args[0], args[1]),
  };

  const CHANGE_ACTIONS = {
    jsonUpload: (el) => handleJsonUpload(el),
    yamlJsonUpload: (el) => handleYamlJsonUpload(el),
    fileUpload: (el, args) => handleFileUpload(el, args[0], args[1]),
    updateJwtHeader: () => updateJwtHeader(),
  };

  function parseArgs(el) {
    const raw = el.getAttribute("data-args");
    return raw ? raw.split(",").map((s) => s.trim()) : [];
  }

  // input and change bubble, so all three can be delegated from the document
  // and keep working for markup added after load.
  function delegate(eventName, attribute, table) {
    document.addEventListener(eventName, (event) => {
      const el = event.target.closest("[" + attribute + "]");
      if (!el) return;
      const handler = table[el.getAttribute(attribute)];
      if (!handler) return;
      // The diff view switch is a <label> wrapping a radio, so one user click
      // arrives twice: once for the label, once for the click the browser
      // synthesises on the control inside it. Both bubble to the same element.
      // Re-rendering a large diff twice is visible, so drop the second.
      if (el.tagName === "LABEL" && event.target !== el && el.contains(event.target)) {
        return;
      }
      handler(el, parseArgs(el));
    });
  }

  delegate("click", "data-action", CLICK_ACTIONS);
  delegate("input", "data-input-action", INPUT_ACTIONS);
  delegate("change", "data-change-action", CHANGE_ACTIONS);

  // Initialize line numbers
  document.addEventListener('DOMContentLoaded', () => {
    setupLineNumbers("jsonInput");
    setupLineNumbers("jsonDiff1");
    setupLineNumbers("jsonDiff2");
    setupLineNumbers("yamlJsonInput");
  });

})(window);
