const htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};
const htmlEscapesRegex = /[&<>"']/g;

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function escapeHtml(text) {
  if (!text) return text;
  return text.replace(htmlEscapesRegex, (match) => htmlEscapes[match]);
}

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
    }
    renderChunk();
  } catch (e) {
    output.textContent = "Invalid JSON: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;
  }
}

// Helper functions for JWT operations
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

function decodeJWT() {
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

    if (alg.startsWith("HS")) {
      const parts = input.split(".");
      if (parts.length === 3) {
        const signatureToVerify = `${parts[0]}.${parts[1]}`;
        let calculatedSignature;

        if (alg === "HS256") {
          calculatedSignature = CryptoJS.HmacSHA256(signatureToVerify, secret);
        } else if (alg === "HS384") {
          calculatedSignature = CryptoJS.HmacSHA384(signatureToVerify, secret);
        } else if (alg === "HS512") {
          calculatedSignature = CryptoJS.HmacSHA512(signatureToVerify, secret);
        } else {
          verificationStatus.innerHTML = `<span class="text-warning"><i class="bx bx-error"></i> Algorithm ${alg} not supported for verification</span>`;
          return;
        }

        const calculatedSignatureBase64Url =
          wordArrayToBase64Url(calculatedSignature);

        if (calculatedSignatureBase64Url === parts[2]) {
          verificationStatus.innerHTML =
            '<span class="text-success"><i class="bx bx-check-circle"></i> Signature Verified</span>';
        } else {
          verificationStatus.innerHTML =
            '<span class="text-danger"><i class="bx bx-x-circle"></i> Invalid Signature</span>';
        }
      }
    } else if (
      [
        "RS256",
        "RS384",
        "RS512",
        "PS256",
        "PS384",
        "PS512",
        "ES256",
        "ES384",
        "ES512",
      ].includes(alg)
    ) {
      if (publicKey) {
        const isValid = KJUR.jws.JWS.verify(input, publicKey, [alg]);
        if (isValid) {
          verificationStatus.innerHTML =
            '<span class="text-success"><i class="bx bx-check-circle"></i> Signature Verified</span>';
        } else {
          verificationStatus.innerHTML =
            '<span class="text-danger"><i class="bx bx-x-circle"></i> Invalid Signature</span>';
        }
      } else {
        verificationStatus.innerHTML =
          '<span class="text-warning"><i class="bx bx-error"></i> Public Key required for verification</span>';
      }
    } else {
      verificationStatus.textContent = "";
    }
  } catch (e) {
    headerOutput.textContent = "Error decoding token";
    payloadOutput.textContent = "Error: " + e.message;
    verificationStatus.textContent = "";
    headerCopyBtn.disabled = true;
    payloadCopyBtn.disabled = true;
  }
}

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
  }

  renderChunk();
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
    setTimeout(() => {
      btn.innerText = originalText;
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

function handleFileUpload(fileInput, targetTextareaId, copyBtnId) {
  handleFileSelect(fileInput, targetTextareaId, copyBtnId, null);
}

function handleYamlJsonUpload(fileInput) {
  handleFileSelect(fileInput, "yamlJsonInput", "yamlJsonInputCopyBtn", "yamlJsonFileName");
}

function handleJsonUpload(fileInput) {
  handleFileSelect(fileInput, "jsonInput", "jsonInputCopyBtn", "jsonFileName");
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

function updateJwtHeader() {
  const alg = document.getElementById("jwtAlgSelect").value;
  const headerInput = document.getElementById("jwtHeaderInput");
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

function encodeJWT() {
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
    } else if (
      [
        "RS256",
        "RS384",
        "RS512",
        "PS256",
        "PS384",
        "PS512",
        "ES256",
        "ES384",
        "ES512",
      ].includes(alg)
    ) {
      if (!privateKey)
        throw new Error(`Private Key required for ${alg} algorithm`);
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
    output.value = "Error: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
  }
}

function base64Encode() {
  const input = document.getElementById("base64Input").value;
  const output = document.getElementById("base64Output");
  const copyBtn = document.getElementById("base64OutputCopyBtn");
  try {
    const wordArray = CryptoJS.enc.Utf8.parse(input);
    output.value = CryptoJS.enc.Base64.stringify(wordArray);
    output.style.borderColor = "#ced4da";
    copyBtn.disabled = false;
  } catch (e) {
    output.value = "Error: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
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
  } catch (e) {
    output.value = "Error: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
  }
}

function urlEncode() {
  const input = document.getElementById("urlInput").value;
  const output = document.getElementById("urlOutput");
  const copyBtn = document.getElementById("urlOutputCopyBtn");
  try {
    output.value = encodeURIComponent(input);
    output.style.borderColor = "#ced4da";
    copyBtn.disabled = false;
  } catch (e) {
    output.value = "Error: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
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
  } catch (e) {
    output.value = "Error: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
  }
}

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
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    output.textContent = "Error converting YAML to JSON: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;
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
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    output.textContent = "Error converting JSON to YAML: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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

function downloadJsonOutput() {
  const text = getTextFromOutput("jsonOutput");
  if (!text) return;
  triggerDownload(text, "jsonFileName", "jsonTimestamp", ".json", "application/json");
}

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

setupLineNumbers("jsonInput");
setupLineNumbers("jsonDiff1");
setupLineNumbers("jsonDiff2");
setupLineNumbers("yamlJsonInput");
