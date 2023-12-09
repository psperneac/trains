import {HEADER_AUTH, LS_AUTH} from "../constants";

export const addAuthorizationHeader = (headers) => {
  const strUser = localStorage.getItem(LS_AUTH);
  if (!strUser || strUser.length === 0) {
    return;
  }
  const user = JSON.parse(strUser);
  if (user && user.authorization) {
    headers.set(HEADER_AUTH, user.authorization);
  }
}
