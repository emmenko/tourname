type any;

external valuesToJsObject : 'a => Js.t({..}) = "%identity";

external toAny : 'a => any = "%identity";

module type CreateFormType = {type valueTypes;};

module CreateForm = (Config: CreateFormType) => {
  type validateFunc = Config.valueTypes => Js.Dict.t(string);
  module FormikActions = {
    type t;
    [@bs.send] external setSubmitting : (t, bool) => unit = "";
    [@bs.send] external setErrors : (t, any) => unit = "";
  };
  module FormikProps = {
    type t;
    [@bs.send] external handleChange : (t, ReactEventRe.Form.t) => unit = "";
    [@bs.send] external handleBlur : (t, ReactEventRe.Focus.t) => unit = "";
    [@bs.send] external handleSubmit : (t, ReactEventRe.Form.t) => unit = "";
    [@bs.send]
    external setFieldValue : (t, ~key: string, ~value: any) => unit = "";
    [@bs.send] external setSubmitting : (t, bool) => unit = "";
    [@bs.get] external isSubmitting : t => bool = "";
    [@bs.get] external isValid : t => bool = "";
    [@bs.get] external touched : t => Js.Dict.t(string) = "";
    [@bs.get] external errors : t => Js.Dict.t(string) = "";
    [@bs.get] external values : t => Config.valueTypes = "";
  };
  type renderFunc = FormikProps.t => ReasonReact.reactElement;
  /* Expose the React component with the mapped props */
  [@bs.module "formik"]
  external reactClass : ReasonReact.reactClass = "Formik";
  let make =
      (
        ~initialValues: Js.t({..}),
        ~validate: option(validateFunc)=?,
        ~onSubmit: (Config.valueTypes, FormikActions.t) => unit,
        ~render: renderFunc,
        _children
      ) =>
    ReasonReact.wrapJsForReason(
      ~reactClass,
      ~props={
        "initialValues": initialValues,
        "validate": Js.Null_undefined.from_opt(validate),
        "onSubmit": onSubmit,
        "render": render
      },
      [||]
    );
};