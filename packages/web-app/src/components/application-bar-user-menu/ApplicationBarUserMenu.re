open Glamor;

[@bs.module "../../auth"] external auth : ReasonAuth.authShape = "default";

module Styles = {
  let placeholder =
    css([
      backgroundColor("#eaeaea"),
      borderRadius("36px"),
      height("36px"),
      width("36px")
    ]);
  let avatar = css([height("36px"), borderRadius("18px")]);
  let menuContainer = css([position("relative")]);
  let menu =
    css([
      border("1px solid rgba(34, 36, 38, 0.15)"),
      maxHeight("150px"),
      width("200px"),
      overflow("scroll"),
      position("absolute"),
      right("0px"),
      top("3px"),
      Selector("> * + *", [margin("8px 0 0")])
    ]);
  let menuHeadline = css([borderBottom("1px solid #ccc"), padding("8px")]);
  let userEmail =
    css([color("#aaa"), fontSize("0.7rem"), wordBreak("break-all")]);
  let likeLink =
    css([
      display("block"),
      padding("4px 8px"),
      Selector(":hover", [backgroundColor("#ccc")])
    ]);
};

let component = ReasonReact.statelessComponent("ApplicationBarUserMenu");

let make = (~isUserLoading, ~fullName, ~email, ~pictureUrl, _children) => {
  ...component,
  render: _self =>
    if (isUserLoading) {
      <div className=Styles.placeholder />;
    } else {
      <ReasonDownshift.Downshift
        render=(
          renderFunc =>
            <div>
              <div
                onClick=(
                  _event =>
                    renderFunc##toggleMenu(
                      ReasonDownshift.getActionFunctionOptions()
                    )
                )>
                <img
                  className=Styles.avatar
                  key="picture"
                  alt="User avatar"
                  src=pictureUrl
                />
              </div>
              (
                if (renderFunc##isOpen) {
                  <div className=Styles.menuContainer>
                    <div className=Styles.menu>
                      <div className=Styles.menuHeadline>
                        <div> (ReasonReact.stringToElement(fullName)) </div>
                        <div className=Styles.userEmail>
                          (ReasonReact.stringToElement(email))
                        </div>
                      </div>
                      <a
                        className=Styles.likeLink
                        onClick=(_event => auth##logout())>
                        (ReasonReact.stringToElement("Logout"))
                      </a>
                    </div>
                  </div>;
                } else {
                  ReasonReact.nullElement;
                }
              )
            </div>
        )
      />;
    }
};

let default =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~isUserLoading=jsProps##isUserLoading,
      ~fullName=jsProps##fullName,
      ~email=jsProps##email,
      ~pictureUrl=jsProps##pictureUrl,
      [||]
    )
  );