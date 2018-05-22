open TypedGlamor;

open ReasonReactRouterDom;

module Styles = {
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
};

let component = ReasonReact.statelessComponent("ApplicationBarActionsMenu");

let make = _children => {
  ...component,
  render: _self =>
    <Downshift
      render=(
        t =>
          <div>
            <div
              onClick=(
                _event =>
                  Downshift.ControllerStateAndHelpers.toggleMenu(t, ())
              )>
              (ReasonReact.stringToElement("New"))
            </div>
            (
              if (Downshift.ControllerStateAndHelpers.isOpen(t)) {
                <div className=(Styles.menuContainer |> TypedGlamor.toString)>
                  <div className=(Styles.menu |> TypedGlamor.toString)>
                    <div>
                      <span
                        onClick=(
                          _event =>
                            Downshift.ControllerStateAndHelpers.closeMenu(
                              t,
                              (),
                            )
                        )>
                        <Link to_="/new">
                          (
                            ReasonReact.stringToElement(
                              "New match / tournament",
                            )
                          )
                        </Link>
                      </span>
                    </div>
                    <div>
                      <span
                        onClick=(
                          _event =>
                            Downshift.ControllerStateAndHelpers.closeMenu(
                              t,
                              (),
                            )
                        )>
                        <Link to_="/organizations/new">
                          (ReasonReact.stringToElement("New organization"))
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>;
              } else {
                ReasonReact.nullElement;
              }
            )
          </div>
      )
    />,
};

let default = ReasonReact.wrapReasonForJs(~component, (_) => make([||]));