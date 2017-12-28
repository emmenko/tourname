type authShape = {
  .
  "getAccessToken": [@bs.meth] (unit => string),
  "logout": [@bs.meth] (unit => unit)
};