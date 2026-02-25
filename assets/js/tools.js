function formatJSON() {
  const input = document.getElementById("jsonInput").value;
  const output = document.getElementById("jsonOutput");
  const indentSelect = document.getElementById("jsonIndent").value;
  const copyBtn = document.getElementById("jsonCopyBtn");

  if (!input.trim()) {
    output.value = "";
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
    output.value = JSON.stringify(parsed, null, indent);
    output.style.borderColor = "#ced4da";
    copyBtn.disabled = false;
  } catch (e) {
    output.value = "Invalid JSON: " + e.message;
    output.style.borderColor = "red";
    copyBtn.disabled = true;
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

function compareJSON() {
  const input1 = document.getElementById("jsonDiff1").value;
  const input2 = document.getElementById("jsonDiff2").value;
  const output = document.getElementById("diffOutput");

  if (!input1.trim() && !input2.trim()) {
    output.innerHTML = "";
    output.style.borderColor = "#ced4da";
    return;
  }

  try {
    const obj1 = input1.trim() ? JSON.parse(input1) : {};
    const obj2 = input2.trim() ? JSON.parse(input2) : {};

    const diff = Diff.diffJson(obj1, obj2);

    let html = "";
    diff.forEach(function (part) {
      const color = part.added ? "green" : part.removed ? "red" : "grey";
      const backgroundColor = part.added
        ? "#e6ffec"
        : part.removed
          ? "#ffebe9"
          : "transparent";
      const span = document.createElement("span");
      span.style.color = color;
      span.style.backgroundColor = backgroundColor;
      span.appendChild(document.createTextNode(part.value));
      html += span.outerHTML;
    });
    output.innerHTML = html;
    output.style.borderColor = "#ced4da";
  } catch (e) {
    output.textContent = "Invalid JSON in one of the inputs: " + e.message;
    output.style.borderColor = "red";
  }
}

function copyToClipboard(elementId, btn) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let text =
    element.tagName === "TEXTAREA" || element.tagName === "INPUT"
      ? element.value
      : element.textContent;

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
