# `reason-downshift`

[ReasonML](https://reasonml.github.io/) bindings for [`downshift`](https://github.com/paypal/downshift).

## Install and setup

#### yarn

```bash
$ yarn add reason-downshift
```

#### bsconfig

Add `reason-downshift` to your `bs-dependencies`:
**bsconfig.json**

```json
"bs-dependencies": [
  "reason-downshift",
  "reason-react"
]
```

## Usage

```reason
type listOfItems = list(string);

let component = ReasonReact.statelessComponent("BasicAutocomplete");

let make (~items: listOfItems, ~onChange, _children) => {
  ...component,
  render: _self =>
    <ReasonDownshift.Downshift
      onChange
      render=(
        renderFunc =>
          <div>
            (
              /*
                NOTE: spreading props is discouraged in ReasonReact!
                https://reasonml.github.io/reason-react/docs/en/props-spread.html
                */
              ReasonReact.cloneElement(
                <input />,
                ~props=
                  ReasonDownshift.objToJsObj(
                    renderFunc##getInputProps(ReactDOMRe.props(~placeholder="Favorite color ?", ()))
                  ),
                [||]
              )
            )
            {if (renderFunc##isOpen) {
              <div style=(ReactDOMRe.Style.make(~border="1px solid #ccc", ()))>
                (
                  List.mapi(
                    (index, item) => {
                      let backgroundColor = if (renderFunc##highlightedIndex === index) {
                        "gray"
                      } else {
                        "white"
                      };
                      let fontWeight = if (renderFunc##selectedItem === item) {
                        "bold"
                      } else {
                        "normal"
                      };
                      ReasonReact.cloneElement(
                        <div
                          key=item
                          style=(
                            ReactDOMRe.Style.make(
                              ~backgroundColor=backgroundColor,
                              ~fontWeight=fontWeight,
                              ()
                            )
                          )
                        />,
                        ~props=(ReasonDownshift.objToJsObj(renderFunc##getItemProps({item}))),
                        [|item|]
                      )
                    },
                    List.filter(
                      item => Js.String.includes("foo", String.lowercase(item)),
                      items
                    )
                  );
                )
              </div>;
            } else {
              ReasonReact.nullElement;
            }
          </div>
      )
    />
};
```
