function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatJSON() {
  const input = document.getElementById("jsonInput").value;
  const output = document.getElementById("jsonOutput");
  const indentSelect = document.getElementById("jsonIndent").value;
  const copyBtn = document.getElementById("jsonCopyBtn");

  if (!input.trim()) {
    output.textContent = "";
    output.style.borderColor = "#ced4da";
    copyBtn.disabled = true;
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
    output.innerHTML = formatted
      .split("\n")
      .map(
        (line, index) =>
          `<div class="code-line"><span class="line-number">${index + 1}</span><span class="line-content">${escapeHtml(line)}</span></div>`,
      )
      .join("");
    output.style.borderColor = "#ced4da";
    copyBtn.disabled = false;
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    output.textContent = "Invalid JSON: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
    output.scrollIntoView({ behavior: "smooth", block: "start" });
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

function compareJSON() {
  const input1 = document.getElementById("jsonDiff1").value;
  const input2 = document.getElementById("jsonDiff2").value;
  const output = document.getElementById("diffOutput");
  const controls = document.getElementById("diffControls");

  if (!input1.trim() && !input2.trim()) {
    output.innerHTML = "";
    output.style.borderColor = "#ced4da";
    controls.style.display = "none";
    currentDiffData = null;
    return;
  }

  try {
    let obj1, obj2;
    try {
      obj1 = input1.trim() ? JSON.parse(input1) : {};
    } catch (e) {
      throw new Error("Invalid JSON in Original JSON: " + e.message);
    }

    try {
      obj2 = input2.trim() ? JSON.parse(input2) : {};
    } catch (e) {
      throw new Error("Invalid JSON in Modified JSON: " + e.message);
    }

    currentDiffData = Diff.diffJson(obj1, obj2);
    currentDiffIndex = -1;
    controls.style.display = "block";
    renderDiff();
    output.style.borderColor = "#ced4da";
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    output.innerHTML = "";
    output.textContent = e.message;
    output.style.borderColor = "red";
    controls.style.display = "none";
    currentDiffData = null;
    output.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setDiffView(view) {
  currentDiffView = view;
  renderDiff();
}

function renderDiff() {
  const output = document.getElementById("diffOutput");
  if (!currentDiffData) return;

  output.innerHTML = "";
  currentDiffIndex = -1;
  let leftLineNum = 1;
  let rightLineNum = 1;

  if (currentDiffView === "inline") {
    output.style.padding = "10px";
    output.style.fontFamily =
      'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

    currentDiffData.forEach(function (part) {
      const color = part.added ? "#28a745" : part.removed ? "#dc3545" : "grey";
      const backgroundColor = part.added
        ? "#e6ffec"
        : part.removed
          ? "#ffebe9"
          : "transparent";

      const lines = part.value.split("\n");
      if (lines[lines.length - 1] === "") lines.pop();

      lines.forEach((line) => {
        const div = document.createElement("div");
        div.className = "diff-line-wrapper";
        div.style.color = color;
        div.style.backgroundColor = backgroundColor;

        if (part.added || part.removed) {
          div.classList.add("diff-change");
        }

        const numSpan = document.createElement("span");
        numSpan.className = "diff-line-num";
        // For inline, usually we might show both or just one. Let's show relevant line number.
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
        output.appendChild(div);
      });
    });
  } else {
    output.style.padding = "0";

    currentDiffData.forEach(function (part) {
      const lines = part.value.split("\n");
      if (lines[lines.length - 1] === "") lines.pop();

      lines.forEach((line) => {
        const row = document.createElement("div");
        row.className = "diff-row";

        if (part.added || part.removed) {
          row.classList.add("diff-change");
        }

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

        row.appendChild(leftCol);
        row.appendChild(rightCol);
        output.appendChild(row);
      });
    });
  }

  const changes = document.querySelectorAll(".diff-change");
  if (document.getElementById("diffCount")) {
    document.getElementById("diffCount").textContent = "0/" + changes.length;
  }
  updateDiffButtons(-1, changes.length);
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

function handleFileUpload(fileInput, targetTextareaId, copyBtnId) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    document.getElementById(targetTextareaId).value = content;
    checkInput(targetTextareaId, copyBtnId);
    document.getElementById(targetTextareaId).dispatchEvent(new Event("input"));
    // Reset file input so the same file can be selected again
    fileInput.value = "";
  };
  reader.onerror = function (e) {
    alert("Error reading file: " + e.target.error);
  };
  reader.readAsText(file);
}

function navigateDiff(direction) {
  const changes = document.querySelectorAll(".diff-change");
  if (changes.length === 0) return;

  if (currentDiffIndex !== -1 && changes[currentDiffIndex]) {
    changes[currentDiffIndex].classList.remove("diff-highlight");
  }

  currentDiffIndex += direction;
  if (currentDiffIndex < 0) currentDiffIndex = 0;
  if (currentDiffIndex >= changes.length) currentDiffIndex = changes.length - 1;

  const target = changes[currentDiffIndex];
  target.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

function downloadYamlJsonOutput() {
  const element = document.getElementById("yamlJsonOutput");
  if (!element) return;

  let text;
  const lines = element.querySelectorAll(".line-content");
  if (lines.length > 0) {
    text = Array.from(lines)
      .map((el) => el.textContent)
      .join("\n");
  } else {
    text = element.textContent;
  }

  if (!text) return;

  let filename = "output.yaml";
  let type = "text/yaml";

  try {
    JSON.parse(text);
    filename = "output.json";
    type = "application/json";
  } catch (e) {
    // Not JSON, keep default as YAML
  }

  const blob = new Blob([text], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function setupLineNumbers(textareaId) {
  const textarea = document.getElementById(textareaId);
  const lineNums = document.getElementById(textareaId + "LineNums");
  if (!textarea || !lineNums) return;

  const update = () => {
    const lines = textarea.value.split("\n").length;
    if (lineNums.childElementCount !== lines) {
      lineNums.innerHTML = Array.from(
        { length: lines },
        (_, i) => `<div>${i + 1}</div>`,
      ).join("");
    }
  };

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
