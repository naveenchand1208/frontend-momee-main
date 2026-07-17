
import { showSuccess, showError } from '@/common/toast/toastService';
import { store } from '../store/store';
// export const apiRequest = async (url, method = 'POST', body = null, router = null ,responseType = 'json') => {
//     const token = store.getState().auth.token;

//     const isFormData = body instanceof FormData;

//     const headers = {
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...(!isFormData && { 'Content-Type': 'application/json' }),
//     };

//     const options = {
//         method,
//         headers,
//         ...(body && { body: isFormData ? body : JSON.stringify(body) }),
//     };

//     try {
//         const response = await fetch(url, options);

//         if (response.status === 401) {
//             showError('Unauthorized');
//             if (router) {
//                 store.dispatch({ type: 'auth/logout' });
//                 router.push('/login');
//             }
//             return;
//         }

//         // const result = await response.json();
//         const result = responseType === 'blob' ? response : await response.json();

//         if (!result.response && result.message !== "" && responseType !== 'blob') {
//             showError(result.message);
//             if (result.message === 'Unauthorized' && router) {
//                 store.dispatch({ type: 'auth/logout' });
//                 router.push('/login');
//             }
//         }

//         return result;
//     } catch (err) {
//         showError(err.message);
//     }
// };


export const apiRequest = async (
  url,
  method = 'POST',
  body = null,
  router = null,
  responseType = 'json',
  downloadFilename = ''
) => {
  const token = store.getState().auth.token;
  const isFormData = body instanceof FormData;

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && { 'Content-Type': 'application/json' }),
  };

  const options = {
    method,
    headers,
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
  };

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      showError('Unauthorized');
      if (router) {
        store.dispatch({ type: 'auth/logout' });
        router.push('/login');
      }
      return;
    }

    // showError('Please upload a valid audio file') Blob (Excel) response handler
    if (responseType === 'blob') {
      const blob = await response.blob();

      let filename = downloadFilename || 'download.xlsx';
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return; // Nothing else to return after download
    }

    // showError('Please upload a valid audio file') Normal JSON response
    const json = await response.json();

    if (!json.response && json.message && responseType !== 'blob') {
      showError(json.message);
      if (json.message === 'Unauthorized' && router) {
        store.dispatch({ type: 'auth/logout' });
        router.push('/login');
      }
    }

    return json;
  } catch (err) {
    showError(err.message);
    return null;
  }
};

