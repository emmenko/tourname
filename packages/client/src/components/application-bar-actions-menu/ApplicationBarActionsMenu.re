open Glamor;

open ReasonReactRouterDom;

module Styles = {
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
                _event => Downshift.ControllerStateAndHelpers.toggleMenu(t, ())
              )>
              (ReasonReact.stringToElement("New"))
            </div>
            (
              if (Downshift.ControllerStateAndHelpers.isOpen(t)) {
                <div className=Styles.menuContainer>
                  <div className=Styles.menu>
                    <div>
                      <span
                        onClick=(
                          _event =>
                            Downshift.ControllerStateAndHelpers.closeMenu(
                              t,
                              ()
                            )
                        )>
                        <Link to_="/new">
                          (
                            ReasonReact.stringToElement(
                              "New match / tournament"
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
                              ()
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
    />
};

let default = ReasonReact.wrapReasonForJs(~component, (_) => make([||]));