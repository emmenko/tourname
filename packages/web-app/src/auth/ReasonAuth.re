type authShape = {
  .
  "authorize": [@bs.meth] (unit => unit),
  "getAccessToken": [@bs.meth] (unit => string),
  "logout": [@bs.meth] (unit => unit)
};