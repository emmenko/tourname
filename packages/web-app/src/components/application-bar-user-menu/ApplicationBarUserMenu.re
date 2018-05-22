open Glamor;

module Styles = {
  let placeholder =
    css([
      backgroundColor("#eaeaea"),
      borderRadius("36px"),
      height("36px"),
      width("36px"),
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
      Selector("> * + *", [margin("8px 0 0")]),
    ]);
  let menuHeadline = css([borderBottom("1px solid #ccc"), padding("8px")]);
  let userEmail =
    css([color("#aaa"), fontSize("0.7rem"), wordBreak("break-all")]);
  let likeLink =
    css([
      display("block"),
      padding("4px 8px"),
      Selector(":hover", [backgroundColor("#ccc")]),
    ]);
};

let component = ReasonReact.statelessComponent("ApplicationBarUserMenu");

let make = _children => {
  ...component,
  render: _self =>
    <FetchUser>
      ...(
           ({result}) =>
             switch (result) {
             | Loading => <div className=Styles.placeholder />
             | Data(response) =>
               <Downshift
                 render=(
                   t =>
                     <div>
                       <div
                         onClick=(
                           _event =>
                             Downshift.ControllerStateAndHelpers.toggleMenu(
                               t,
                               (),
                             )
                         )>
                         <img
                           className=Styles.avatar
                           key="picture"
                           alt="User avatar"
                           src=response##me##picture
                         />
                       </div>
                       (
                         if (Downshift.ControllerStateAndHelpers.isOpen(t)) {
                           let fullName = response##me##name;
                           let email = response##me##email;
                           <div className=Styles.menuContainer>
                             <div className=Styles.menu>
                               <div className=Styles.menuHeadline>
                                 <div>
                                   (ReasonReact.stringToElement(fullName))
                                 </div>
                                 <div className=Styles.userEmail>
                                   (ReasonReact.stringToElement(email))
                                 </div>
                               </div>
                               <a
                                 className=Styles.likeLink
                                 onClick=(_event => ReasonAuth.logout())>
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
               />
             | Error(error) =>
               Js.log(error);
               ReasonReact.nullElement;
             }
         )
    </FetchUser>,
};

let default = ReasonReact.wrapReasonForJs(~component, _jsProps => make([||]));