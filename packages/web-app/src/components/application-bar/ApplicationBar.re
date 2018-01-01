open Glamor;

open ReasonReactRouterDom;

module Styles = {
  let container =
    css([
      display("flex"),
      alignItems("center"),
      justifyContent("space-between"),
      borderBottom("1px solid #ccc"),
      padding("8px"),
      height("36px")
    ]);
  let placeholder =
    css([
      backgroundColor("#eaeaea"),
      borderRadius("36px"),
      height("36px"),
      width("36px")
    ]);
  let button =
    css([
      borderRadius("3px"),
      padding("4px 16px"),
      margin("0"),
      background("transparent"),
      color("#0074d9"),
      border("2px solid #0074d9"),
      cursor("pointer"),
      Selector(":hover", [backgroundColor("#0074d9"), color("white")])
    ]);
  let menusContainer =
    css([
      display("inline-flex"),
      alignItems("center"),
      justifyContent("center"),
      Selector("> * + *", [margin("0 0 0 16px")])
    ]);
};

let component = ReasonReact.statelessComponent("ApplicationBar");

let make = (~isUserAuthenticated, _children) => {
  ...component,
  render: _self =>
    <div className=Styles.container>
      <Link to_="/"> (ReasonReact.stringToElement("Logo")) </Link>
      <div className=Styles.menusContainer>
        <ApplicationBarActionsMenu />
        (
          if (isUserAuthenticated) {
            <FetchUser>
              (
                response =>
                  switch response {
                  | Loading => <div className=Styles.placeholder />
                  | Loaded(result) =>
                    <ApplicationBarUserMenu
                      fullName=result##me##name
                      email=result##me##email
                      pictureUrl=result##me##picture
                    />
                  | Failed(error) =>
                    Js.log2("[KeyCheck] Error while fetching", error);
                    ReasonReact.nullElement;
                  }
              )
            </FetchUser>;
          } else {
            <a onClick=(_event => ReasonAuth.authorize())>
              <div className=Styles.button>
                (ReasonReact.stringToElement("Login"))
              </div>
            </a>;
          }
        )
      </div>
    </div>
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(~isUserAuthenticated=jsProps##isUserAuthenticated, [||])
  );