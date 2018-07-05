module Styles = {
  open TypedGlamor;
  let placeholder =
    css([
      backgroundColor(hex("#eaeaea")),
      borderRadius(px(36)),
      height(px(36)),
      width(px(36)),
    ]);
  let avatar = css([height(px(36)), borderRadius(px(18))]);
  let menuContainer = css([position(relative)]);
  let menu =
    css([
      border3(px(1), solid, rgba(34, 36, 38, 0.15)),
      maxHeight(px(150)),
      width(px(200)),
      overflow(scroll),
      position(absolute),
      offsetRight(zero),
      offsetTop(px(3)),
      select("> * + *", [marginTop(px(8))]),
    ]);
  let menuHeadline =
    css([borderBottom3(px(1), solid, hex("ccc")), padding(px(8))]);
  let userEmail =
    css([
      color(hex("aaa")),
      fontSize(rem(0.7)),
      /* wordBreak(breakAll) */
    ]);
  let likeLink =
    css([
      display(block),
      padding2(~v=px(4), ~h=px(8)),
      select(":hover", [backgroundColor(hex("ccc"))]),
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
             | Loading =>
               <div className=(Styles.placeholder |> TypedGlamor.toString) />
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
                           className=(Styles.avatar |> TypedGlamor.toString)
                           key="picture"
                           alt="User avatar"
                           src=response##me##picture
                         />
                       </div>
                       (
                         if (Downshift.ControllerStateAndHelpers.isOpen(t)) {
                           let fullName = response##me##name;
                           let email = response##me##email;
                           <div
                             className=(
                               Styles.menuContainer |> TypedGlamor.toString
                             )>
                             <div
                               className=(Styles.menu |> TypedGlamor.toString)>
                               <div
                                 className=(
                                   Styles.menuHeadline |> TypedGlamor.toString
                                 )>
                                 <div> (fullName |> ReasonReact.string) </div>
                                 <div
                                   className=(
                                     Styles.userEmail |> TypedGlamor.toString
                                   )>
                                   (email |> ReasonReact.string)
                                 </div>
                               </div>
                               <a
                                 className=(
                                   Styles.likeLink |> TypedGlamor.toString
                                 )
                                 onClick=(_event => ReasonAuth.logout())>
                                 ("Logout" |> ReasonReact.string)
                               </a>
                             </div>
                           </div>;
                         } else {
                           ReasonReact.null;
                         }
                       )
                     </div>
                 )
               />
             | Error(error) =>
               Js.log(error);
               ReasonReact.null;
             }
         )
    </FetchUser>,
};
