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
              (ReasonReact.stringToElement("New"))
            </div>
            (
              if (renderFunc##isOpen) {
                <div className=Styles.menuContainer>
                  <div className=Styles.menu>
                    <div>
                      <span
                        onClick=(
                          _event =>
                            renderFunc##closeMenu(
                              ReasonDownshift.getActionFunctionOptions()
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
                            renderFunc##closeMenu(
                              ReasonDownshift.getActionFunctionOptions()
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