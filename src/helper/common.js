import { WS_URL } from "../constant/common";
export function ajax(parameters, options = {}) {
  let requestUrl = "";
  // for (let key in parameters) {
  //   const parametr =
  //     parameters[key] || parameters[key] === 0 ? parameters[key] : ""
  //   requestUrl += key + "=" + encodeURIComponent(parametr) + "&"
  // }

  const path = options && options.path ? options.path : "api";
  requestUrl = WS_URL + path;
  console.log(requestUrl);
  const requestOptions = { method: "POST" };
  if (parameters.sp === "login" && parameters.provider === "sspi") {
    requestOptions.credentials = "include";
  }
  if (parameters.sp === "refresh_guid") {
    requestOptions.headers = {
      refresh: localStorage.getItem("dqRefreshToken")
    };
  }
  return new Promise((resolve, reject) => {
    if (options.withCredentials || parameters.remote_user) {
      ajax({ sp: "refresh_guid" }, { path: "auth" })
        .then(token => {
          requestOptions.headers = { authorization: "Bearer " + token };
          resolve();
        })
        .catch(err => reject(err));
    } else {
      resolve();
    }
  })
    .then(() => {
      return fetch(requestUrl, {
        body: JSON.stringify(parameters),
        ...requestOptions
      });
    })
    .then(response => {
      return response.json();
    })
    .then(response => {
      if (!response.body) {
        throw new Error(response);
      }
      if (response.refreshToken) {
        localStorage.setItem("dqRefreshToken", response.refreshToken);
      }
      if (response.accessToken) {
        return response.accessToken;
      }

      return response.body;
    })
    .catch(err => {
      dispathSnackbarMessage(parameters.sp + " failed");
      throw new Error(err);
    });
}
export function dispathSnackbarMessage(meaasage) {
  const ajaxFailEvent = new CustomEvent("snackBarMessage", {
    detail: meaasage
  });
  window.dispatchEvent(ajaxFailEvent);
}
export function decodeJwt(jwt) {
  if (!jwt) return null;
  try {
    return JSON.parse(atob(jwt.split(".")[1]));
  } catch (err) {
    return null;
  }
}

export function isJwtExpired(jwt) {
  if (!jwt) return true;
  try {
    const expiredAt = decodeJwt(jwt).exp * 1000 - 30 * 1000; //30 sec delay
    return expiredAt < Date.now() ? true : false;
  } catch (err) {
    return true;
  }
}
