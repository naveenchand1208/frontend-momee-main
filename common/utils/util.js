import CryptoJS from "crypto-js";
import moment from "moment";
const SECRET_KEY = "12345678901234567890123456789012"; // 32 chars
const IV = "1234567890123456"; // 16 chars

export function encryptPassword(password) {
  const encrypted = CryptoJS.AES.encrypt(
    password,
    CryptoJS.enc.Utf8.parse(SECRET_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString();

  return encrypted;
}

export function formatDate(dateInput, format = 'DD-MM-YYYY') {
  const date = moment(dateInput);
  return date.isValid() ? date.format(format) : '';
}

export function formattedDate(date) {
  return date
    ? new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : '';
}

export function formatDateTime(isoDateStr) {
  const date = new Date(isoDateStr);
  const options = {


    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString('en-IN', options);
};

// utils/weeks.js
export function getWeeks(weeks = 42) {
  return Array.from({ length: weeks }, (_, i) => ({
    id: i + 1,
    label: `Week ${i + 1}`,
    value: `${i + 1}`
  }));
}

export function getMonths(months = 12) {
  return Array.from({ length: months }, (_, i) => ({
    id: i + 1,
    label: `${i + 1}`
  }));
}

export function generateMomTypes(form) {
  return [].concat(
    form.pregMom ? ['pregMom'] : [],
    form.newMom ? ['newMom'] : []
  );
};

// utils/formUtils.js
export function objectToFormData(obj) {
  const formData = new FormData();

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }
  return formData;
}

// for product file upload
export function newObjectToFormData(obj) {
  const formData = new FormData();

  // Append regular fields
  Object.entries(obj).forEach(([key, value]) => {
    if (key === 'files' || key === 'oldFiles' || value === undefined || value === null) return;

    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([nestedKey, nestedVal]) => {
        if (nestedVal !== undefined && nestedVal !== null) {
          formData.append(`${key}[${nestedKey}]`, nestedVal);
        }
      });
    } else {
      formData.append(key, value);
    }
  });

  // Append new files
  if (Array.isArray(obj.files)) {
    obj.files.forEach((file) => {
      if (file instanceof File) {
        formData.append('files', file);
      }
    });
  }

  // Append old files (retained during edit)
  if (Array.isArray(obj.oldFiles)) {
    obj.oldFiles.forEach((fileObj, index) => {
      if (fileObj.url && fileObj.public_id) {
        formData.append(`oldFiles[${index}][url]`, fileObj.url);
        formData.append(`oldFiles[${index}][public_id]`, fileObj.public_id);
        formData.append(`oldFiles[${index}][fileChanged]`, 'false');
      }
    });
  }

  return formData;
}

export function getArticleStates() {
  const states = ['Draft', 'Published', 'Archived'];
  return states.map((state, i) => ({
    id: i + 1,
    label: state,
  }));
}

export function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function addFiveHoursThirtyMinutes(date) {
  return moment(date).add(5, 'hours').add(30, 'minutes').toDate();
}

export function formatChatDate(dateString) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (dateString === today) return 'Today';
  if (dateString === yesterday) return 'Yesterday';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const stripHtmlAndTruncate = (html, maxLength = 100) => {
  if (!html) return '';
  const withSpaces = html.replace(/<\/?(p|div|br|li|ul|ol|h[1-6])[^>]*>/gi, ' ');
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = withSpaces;
  let text = tempDiv.textContent || tempDiv.innerText || "";
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length <= maxLength) return text;

  let truncated = text.substring(0, maxLength);
  truncated = truncated.substring(0, truncated.lastIndexOf(' '));

  return truncated + "...";
};

export const  convertToInputDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return '';
  const [day, month, year] = ddmmyyyy.split('-');
  return `${year}-${month}-${day}`; // YYYY-MM-DD
}
